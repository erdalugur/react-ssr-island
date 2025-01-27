import { renderToString } from 'react-dom/server';
import React from 'react';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AppManifest, RenderPage, RouteProps, DocumentProps, ManifestItem } from '../types';
import { ensureDirectoryExists, writeFile } from '../utils';
import { getOctopusConfig, OctopusConfig } from '../config';
import Manifest from './manifest';
import { StaticPagesCantUseGetServerSideProps } from './errors';

class OctopusServer {
  octopusConfig!: OctopusConfig;
  dev: boolean = process.env.NODE_ENV !== 'production';
  appManifest!: AppManifest;
  styles: Record<string, string> = {};
  outdir!: string;
  assetPrefix!: string;
  document!: RouteProps;
  errorPage!: RouteProps;
  routePaths: Record<string, string> = {};
  manifest!: Manifest;
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

  routeLoader = async (item: ManifestItem): Promise<RouteProps> => {
    const routePath = this.getRoutePath(item.runtime);
    const mod = await import(routePath);

    if (item.ssg && mod.getServerSideProps) {
      throw new StaticPagesCantUseGetServerSideProps(item.runtime)
    }
    const dataLoader =
      mod.getServerSideProps || mod.getStaticProps || mod.getIntialProps || (() => ({ props: {} }));

    return {
      Component: mod.default,
      Meta: mod?.Meta || (() => null),
      dataLoader,
      js: item?.js || [],
      css: item?.css || [],
      params: item.params
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

  renderToHTML = async ({ req, res, route }: RenderPage) => {
    const Document = this.document.Component<DocumentProps>;
    const { Component, Meta, dataLoader, css, js, params } = await this.routeLoader(route);

    const pageProps = await dataLoader({ req, res, params });

    return renderToString(
      <Document
        main={() => <Component {...pageProps.props} />}
        scripts={() => this.getScripts(js)}
        meta={() => <Meta {...pageProps.props} />}
        styles={() => this.getStyles(css)}
        pageProps={{
          ...pageProps,
          runtimeConfig: this.octopusConfig.publicRuntimeConfig
        }}
      />
    );
  };

  render = async (req: Request, res: Response, route: string) => {
    let item = this.appManifest[route];
    if (!item) {
      item = this.appManifest['/_error'];
      res.statusCode = 404;
    }
    if (item.runtime.endsWith('.html')) {
      const routePath = this.getRoutePath(item.runtime);
      res.sendFile(routePath);
      return;
    }
    const html = await this.renderToHTML({ req, res, route: item });
    res.send(html);
  };

  prepare = async () => {
    if (this.dev) {
      const { default: cli } = await import('../cli');
      await cli.dev();
    }
    const config = getOctopusConfig();
    this.outdir = config.outdir as string;
    this.assetPrefix = config.assetPrefix as string;
    this.octopusConfig = config;
    this.register({ ...config.publicRuntimeConfig, ...config.serverRuntimeConfig });
    this.manifest = new Manifest({ dev: this.dev, config });
    this.appManifest = await this.manifest.generate();
    this.document = await this.routeLoader(this.appManifest['/_document']);
    if (!this.dev) {
      this.export();
    }
    return Promise.resolve();
  };

  export = async () => {
    const appManifest = this.appManifest;
    for (const key in appManifest) {
      const item = appManifest[key];
      if (item.destination) {
        const target = path.join(this.outdir, 'out');
        const html = await this.renderToHTML({ req: {} as any, res: {} as any, route: item });
        item.runtime = `/out${item.destination}.html`;
        const htmlPath = path.join(this.outdir, item.runtime);
        await ensureDirectoryExists(target);
        await writeFile(htmlPath, html);
      }
    }
    this.appManifest = appManifest;
  };

  getRequestHandler = async (req: Request, res: Response) => {
    return () => {};
  };
}

export default function createServer({ dev }: { dev: boolean }) {
  return new OctopusServer({ dev });
}
