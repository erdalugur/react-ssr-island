import { renderToString } from 'react-dom/server';
import React, { JSX } from 'react';
import { Request, Response } from 'express';
import path from 'path';
import { OctopusConfig } from '../config';
import fs from 'fs';
import { Context, DocumentProps } from '../types';

interface RouteProps {
  Component: <T>(props: T) => JSX.Element;
  Meta: <T>(props: T) => JSX.Element;
  getServerSideProps: (ctx: Context) => any;
  assets: { js: string[]; css: string[] };
}

class OctopusServer {
  octopusConfig!: OctopusConfig;
  dev: boolean = process.env.NODE_ENV !== 'production';
  serverManifest: any;
  clientManifest: any;
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

  routeLoader = async (req: Request, res: Response, route: string): Promise<RouteProps | null> => {
    const item = this.serverManifest[route];
    if (!item) {
      res.statusCode = 404;
      return null;
    }
    if (item && !item.runtime) {
      res.statusCode = 500;
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

  render = async (req: Request, res: Response, route: string) => {
    let routeResult = await this.routeLoader(req, res, route);
    const errorMessage: any = {};
    if (!routeResult) {
      routeResult = this.errorPage;
      errorMessage.statusCode = res.statusCode;
      errorMessage.message = res.statusCode === 404 ? 'Page Not Found' : 'Internal Server Error';
    }

    const Document = this.document.Component<DocumentProps>;
    const { Component, Meta, assets, getServerSideProps } = routeResult;

    const serverSideProps = await getServerSideProps({ req, res });
    const pageProps = { ...serverSideProps.props, ...errorMessage };

    res.send(
      renderToString(
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
      )
    );
  };

  manifestLoader = async (m: string) => {
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
    this.serverManifest = await this.manifestLoader('pages-manifest.json');
    this.clientManifest = await this.manifestLoader('static-manifest.json');
    this.document = (await this.routeLoader({} as any, {} as any, '/_document')) as RouteProps;
    this.errorPage = (await this.routeLoader({} as any, {} as any, '/_error')) as RouteProps;
    return Promise.resolve();
  };

  getRequestHandler = async (req: Request, res: Response) => {
    return () => {};
  };
}

export default function createServer({ dev }: { dev: boolean }) {
  return new OctopusServer({ dev });
}
