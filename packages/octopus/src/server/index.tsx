import { renderToString } from 'react-dom/server';
import React from 'react';
import { Request, Response } from 'express';
import path from 'path';
import { OctopusConfig } from '../config';
import fs from 'fs';
import {
  ServerPagesManifest,
  ClientPagesManifest,
  RenderPage,
  RouteProps,
  DocumentProps
} from '../types';

class OctopusServer {
  octopusConfig!: OctopusConfig;
  dev: boolean = process.env.NODE_ENV !== 'production';
  serverManifest!: ServerPagesManifest;
  clientManifest!: ClientPagesManifest;
  styles: Record<string, string> = {};
  outdir!: string;
  assetPrefix!: string;
  document!: RouteProps;
  errorPage!: RouteProps;
  routePaths: Record<string, string> = {};
  constructor({ dev }: { dev: boolean }) {
    this.dev = dev;
  }

  register = (config: Record<string, any>) => {
    Object.keys(config).forEach((key) => {
      process.env[key] = config[key];
    });
  };

  getRoutePath = (route: string) => {
    if (this.routePaths[route]) {
      return this.routePaths[route];
    }
    const routePath = path.join(this.outdir, route);
    this.routePaths[route] = routePath;
    return routePath;
  };

  routeLoader = async (route: string): Promise<RouteProps | null> => {
    const item = this.serverManifest[route];
    if (!item) {
      return null;
    }

    const routePath = this.getRoutePath(item.runtime);

    const assets = this.clientManifest[route];

    const mod = await import(routePath);

    return {
      Component: mod.default,
      Meta: mod?.Meta || (() => null),
      getServerSideProps: mod?.getServerSideProps || (() => ({ props: {} })),
      assets: {
        js: assets?.js || [],
        css: item?.css || []
      }
    };
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
      if (!this.styles[s]) {
        const p = path.join(outdir as string, `${s}`);
        const style = fs.readFileSync(p, { encoding: 'utf-8' });
        this.styles[s] = style;
      }
      return <style dangerouslySetInnerHTML={{ __html: this.styles[s] }} />;
    });
  };

  renderPage = async ({ req, res, route }: RenderPage) => {
    let routeResult = await this.routeLoader(route);
    const errorMessage: any = {};
    if (!routeResult) {
      routeResult = this.errorPage;
      res.statusCode = 404;
      errorMessage.statusCode = 404;
      errorMessage.message = 'Page Not Found';
    }

    const Document = this.document.Component<DocumentProps>;
    const { Component, Meta, assets, getServerSideProps } = routeResult;

    const serverSideProps = await getServerSideProps({ req, res });
    const pageProps = { ...serverSideProps.props, ...errorMessage };

    return renderToString(
      <Document
        main={() => <Component {...pageProps} />}
        scripts={() => this.getScripts(assets.js)}
        meta={() => <Meta {...pageProps} />}
        styles={() => this.getStyles(assets.css)}
        pageProps={{
          ...pageProps,
          runtimeConfig: this.octopusConfig.publicRuntimeConfig
        }}
      />
    );
  };

  render = async (req: Request, res: Response, route: string) => {
    const html = await this.renderPage({ req, res, route });
    res.send(html);
  };

  manifestLoader = async <T,>(m: string): Promise<T> => {
    return import(path.join(this.outdir, m));
  };

  prepare = async () => {
    if (this.dev) {
      const cli = (await import('../cli')).default;
      await cli.dev();
    }
    const { getOctopusConfig } = await import('../config');
    const config = getOctopusConfig();
    this.octopusConfig = config;
    this.register({ ...config.publicRuntimeConfig, ...config.serverRuntimeConfig });

    this.outdir = config.outdir as string;
    this.assetPrefix = config.assetPrefix as string;
    this.serverManifest = await this.manifestLoader<ServerPagesManifest>('pages-manifest.json');
    this.clientManifest = await this.manifestLoader<ClientPagesManifest>('static-manifest.json');
    this.document = (await this.routeLoader('/_document')) as RouteProps;
    this.errorPage = (await this.routeLoader('/_error')) as RouteProps;
    return Promise.resolve();
  };

  getRequestHandler = async (req: Request, res: Response) => {
    return () => {};
  };
}

export default function createServer({ dev }: { dev: boolean }) {
  return new OctopusServer({ dev });
}
