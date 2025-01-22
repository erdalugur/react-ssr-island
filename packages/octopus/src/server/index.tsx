import { renderToString } from 'react-dom/server';
import React from 'react';
import { Request, Response } from 'express';
import path from 'path';
import { OctopusConfig } from '../config';
import fs from 'fs';

const styles: Record<string, string> = {};
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

  document = (props: any) => {
    const { main: Main, styles: Styles, meta: Meta, scripts: Scripts } = props;
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
  };

  routeLoader = async (route: string) => {
    const mod = await import(route);
    return {
      Component: mod.default,
      Meta: mod?.Meta || (() => null),
      getServerSideProps: mod?.getServerSideProps || (() => ({ props: {} }))
    };
  };

  getDocument = async () => {
    const doc = this.serverManifest['/_document']?.runtime;
    if (doc) {
      const docpath = path.join(this.outdir, `${doc}`);
      const mod = await import(docpath);
      return mod.default || this.document;
    }
    return this.document;
  };

  getScripts = (scripts: string[]) => {
    const { assetPrefix, publicRuntimeConfig } = this.octopusConfig;
    return (
      <>
        {scripts.map((s: string) => (
          <script key={s} defer src={`${assetPrefix}${s}`} />
        ))}
        <script
          id="__PRELOADED_STATE__"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              runtimeConfig: publicRuntimeConfig
            })
          }}
        />
      </>
    );
  };

  getStyles = (css: string[]) => {
    const { assetPrefix, outdir, inlineCss } = this.octopusConfig;
    if (!inlineCss)
      return css.map((s: string) => <link key={s} rel="stylesheet" href={`${assetPrefix}${s}`} />);

    return css.map((s) => {
      if (!styles[s]) {
        const p = path.join(outdir as string, `${s}`);
        const style = fs.readFileSync(p, { encoding: 'utf-8' });
        styles[s] = style;
      }
      return <style dangerouslySetInnerHTML={{ __html: styles[s] }} />;
    });
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
        <Document
          main={() => <Component {...pageProps.props} />}
          scripts={() => this.getScripts(assets?.js || [])}
          meta={() => <Meta {...pageProps.props} />}
          styles={() => this.getStyles(item?.css || [])}
          pageProps={pageProps}
        />
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
