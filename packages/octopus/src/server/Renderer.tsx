import { Request, Response } from 'express';
import { renderToString } from 'react-dom/server';
import React from 'react';
import path from 'path';
import fs from 'fs';
import { Route } from '../types';
import { OctopusConfig } from '../config';
import Routing from './Routing';
import { createLogger, JsonLogger } from '../logger';
export default class Renderer {
  private routing: Routing;
  private styles: Record<string, string> = {};
  private config: OctopusConfig;
  private assetPrefix: string;
  private logger!: JsonLogger;

  constructor({
    routing,
    config,
    logger
  }: {
    routing: Routing;
    config: OctopusConfig;
    logger?: JsonLogger;
  }) {
    this.routing = routing;
    this.config = config;
    this.assetPrefix = config.assetPrefix || '';
    this.logger = createLogger(logger, 'Renderer')
  }

  private getScripts = (scripts: string[]) => {
    return (
      <>
        {scripts.map((s: string) => (
          <script key={s} defer src={`${this.assetPrefix}${s}`} />
        ))}
      </>
    );
  };

  private getStyles = (css: string[]) => {
    const { outdir, inlineCss } = this.config;
    if (!inlineCss)
      return (
        <>
          {css.map((s: string, i) => (
            <link key={i} rel="stylesheet" href={`${this.assetPrefix}${s}`} />
          ))}
        </>
      );
    return (
      <>
        {css.map((s, i) => {
          if (!this.styles[s]) {
            const p = path.join(outdir as string, `${s}`);
            const style = fs.readFileSync(p, { encoding: 'utf-8' });
            this.styles[s] = style;
          }
          return <style key={i} dangerouslySetInnerHTML={{ __html: this.styles[s] }} />;
        })}
      </>
    );
  };

  renderToHTML = ({ pageProps, route }: { pageProps: any; route: Route }) => {
    const Document = this.routing.getDocument();
    const html = renderToString(
      <Document
        main={() => <route.Page {...pageProps.props} />}
        scripts={() => this.getScripts(route.js)}
        meta={() => <route.Meta {...pageProps.props} />}
        styles={() => this.getStyles(route.css)}
        pageProps={{
          ...pageProps,
          runtimeConfig: this.config.publicRuntimeConfig
        }}
      />
    );
    return `<!DOCTYPE html> ${html}`;
  };

  renderError = async ({ req, res, status }: { req: Request; res: Response; status: number }) => {
    const route = this.routing.getErrorRoute();
    res.statusCode = status;
    const pageProps = await route.getServerSideProps({ req, res });
    return this.renderToHTML({ pageProps, route });
  };

  render = async (req: Request, res: Response, routePath: string) => {
    let route = this.routing.getRoute(routePath);
    if (!route) {
      res.statusCode = 404;
      route = this.routing.getErrorRoute();
    }
    try {
      const pageProps = await route.getServerSideProps({ req, res });
      const { redirect, notFound } = pageProps;
      if (redirect) {
        res.redirect(redirect.status || 302, redirect.destination);
        return;
      }
      if (notFound) {
        res.send(await this.renderError({ req, res, status: 404 }));
        return;
      }
      res.send(await this.renderToHTML({ pageProps, route }));
    } catch (error: any) {
      this.logger.error('Render error: ' + error.message);
      res.send(await this.renderError({ req, res, status: 500 }));
    }
  };
}
