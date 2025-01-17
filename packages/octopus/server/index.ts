import { renderToString } from 'react-dom/server';
import React from 'react';
import { Request, Response } from 'express';
import path from 'path';
import { OctopusConfig } from '../config';
import fs from 'fs';
class Server {
  octopusConfig!: OctopusConfig;
  dev: boolean = process.env.NODE_ENV !== 'production';
  serverManifest: any;
  clientManifest: any;
  styleTagsOrLinks!: Record<string, string>;
  styles: Record<string, string> = {};
  outdir!: string;
  outdirname!: string;
  constructor({ dev }: { dev: boolean }) {
    this.dev = dev;
  }

  register = (config: Record<string, any>) => {
    Object.keys(config).forEach((key) => {
      process.env[key] = config[key];
    });
  };

  routeLoader = async (route: string) => {
    const mod = await import(route);
    return {
      Component: mod.default,
      Meta: mod?.Meta || (() => React.createElement(React.Fragment)),
      getServerSideProps: mod?.getServerSideProps || (() => ({ props: {} }))
    };
  };

  render = async (req: Request, res: Response, route: string) => {
    const item = this.serverManifest[route];
    if (!item || (item && !item.runtime)) {
      res.sendStatus(404);
      return;
    }

    const { publicRuntimeConfig, serverRuntimeConfig } = this.octopusConfig;

    this.register({ ...publicRuntimeConfig, ...serverRuntimeConfig });

    const routePath = path.join(this.outdir, `${item.runtime}`);
    const { Component, Meta, getServerSideProps } = await this.routeLoader(routePath);

    const assets = this.clientManifest[route];

    if (!Component) {
      res.status(404).send('unknown page');
      return;
    }

    const pageProps = await getServerSideProps({ req, res });
    const html = renderToString(React.createElement(Component, pageProps.props));
    const metaTags = renderToString(React.createElement(Meta, pageProps.props));

    const linkOrStyle = this.styleTagsOrLinks[route];

    const scripts = this.getScripts(route, publicRuntimeConfig, assets.js);

    const document = `
      <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${metaTags}
        ${linkOrStyle}
        </head>
        <body>
          <div id="root">${html}</div>
          ${scripts}
        </body>
      </html>
    `;
    res.send(document);
  };

  manifestLoader = async (m: string) => {
    return import(path.join(this.outdir, m));
  };

  getScripts = (route: string, publicRuntimeConfig: any, js: string[]) => {
    const data = JSON.stringify({
      page: route,
      chunk: route,
      runtimeConfig: publicRuntimeConfig
    });

    const preloadedState = `<script id="__PRELOADED_STATE__" type="application/json">${data}</script>`;

    return [
      preloadedState,
      ...js.map((item: string) => `<script defer src="/${this.outdirname}${item}"></script>`)
    ].join('\n');
  };
  
  prepare = async () => {
    if (this.dev) {
      const { watch } = require('../webpack');
      await watch();
    }
    const { getOctopusConfig } = require('../webpack/utils');
    this.octopusConfig = getOctopusConfig();
    this.outdir = this.octopusConfig.outdir as string;
    const names = this.outdir.split('/');
    this.outdirname = names[names.length - 1];
    this.serverManifest = await this.manifestLoader('pages-manifest.json');
    this.clientManifest = await this.manifestLoader('static-manifest.json');
    this.styleTagsOrLinks = this.getStyleTagOrLinks(this.serverManifest);
    return Promise.resolve();
  };

  getStyleTagOrLinks(manifest: Record<string, { runtime: string; css: string[] }>) {
    if (Object.keys(this.styles).length > 0) return this.styles;

    Object.keys(manifest).forEach((key) => {
      const css: string[] = manifest[key].css || [];

      if (!this.dev) {
        const _styles: string[] = [];
        css.forEach((s) => {
          const p = path.join(this.outdir, `${s}`);
          const style = fs.readFileSync(p, { encoding: 'utf-8' });
          _styles.push(`<style>${style}</style>`);
        });
        this.styles[key] = _styles.join(`\n`);
      } else {
        this.styles[key] = css
          .map((item) => `<link rel="stylesheet" href="/${this.outdirname}${item}"/>`)
          .join('\n');
      }
    });
    return this.styles;
  }

  getRequestHandler = async (req: Request, res: Response) => {
    return () => {};
  };
}

export default function createServer({ dev }: { dev: boolean }) {
  return new Server({ dev });
}
