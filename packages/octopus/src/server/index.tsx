import { renderToString } from 'react-dom/server';
import React from 'react';
import { Request, Response } from 'express';
import path from 'path';
import { OctopusConfig } from '../config';
import { Main, Meta, Provider, Scripts, Styles } from '../document';

class OctopusServer {
  octopusConfig!: OctopusConfig;
  dev: boolean = process.env.NODE_ENV !== 'production';
  serverManifest: any;
  clientManifest: any;
  styles: Record<string, string> = {};
  outdir!: string;
  assetPrefix!: string;
  constructor({ dev }: { dev: boolean }) {
    this.dev = dev;
  }

  register = (config: Record<string, any>) => {
    Object.keys(config).forEach((key) => {
      process.env[key] = config[key];
    });
  };

  document = () => {
    return (
      <html>
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Styles />
        </head>
        <body>
          <Main />
          <Scripts />
        </body>
      </html>
    );
  }

  routeLoader = async (route: string) => {
    const mod = await import(route);
    return {
      Component: mod.default,
      Meta: mod?.Meta || (() => null),
      getServerSideProps: mod?.getServerSideProps || (() => ({ props: {} }))
    };
  };

  getDocument = async () => {
    return this.document;
  };
  render = async (req: Request, res: Response, route: string) => {
    const item = this.serverManifest[route];
    if (!item || (item && !item.runtime)) {
      res.sendStatus(404);
      return;
    }

    const routePath = path.join(this.outdir, `${item.runtime}`);

    const { Component, Meta, getServerSideProps } = await this.routeLoader(routePath);

    const assets = this.clientManifest[route];

    if (!Component) {
      res.status(404).send('unknown page');
      return;
    }

    const pageProps = await getServerSideProps({ req, res });

    const Document = await this.getDocument();
    
    res.send(
      renderToString(
        <Provider
          value={{
            dev: this.dev,
            Component,
            css: item.css || [],
            pageProps,
            Meta,
            assetPrefix: this.assetPrefix,
            scripts: assets?.js || [],
            octopusConfig: this.octopusConfig
          }}
        >
          <Document />
        </Provider>
      )
    );
  };

  manifestLoader = async (m: string) => {
    return import(path.join(this.outdir, m));
  };

  prepare = async () => {
    if (this.dev) {
      const { watch } = require('../../webpack');
      await watch();
    }
    const { getOctopusConfig } = require('../../webpack/utils');
    const config = getOctopusConfig();
    this.octopusConfig = config;
    this.register({ ...config.publicRuntimeConfig, ...config.serverRuntimeConfig });

    this.outdir = config.outdir as string;
    this.assetPrefix = config.assetPrefix;
    this.serverManifest = await this.manifestLoader('pages-manifest.json');
    this.clientManifest = await this.manifestLoader('static-manifest.json');
    return Promise.resolve();
  };

  getRequestHandler = async (req: Request, res: Response) => {
    return () => {};
  };
}

export default function createServer({ dev }: { dev: boolean }) {
  return new OctopusServer({ dev });
}
