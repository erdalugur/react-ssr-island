import { Request, Response } from 'express';
import { renderToString } from 'react-dom/server';
import React from 'react';
import path from 'path';
import fs from 'fs';
import { IncomingError, Route } from '../types';
import { OctopusConfig } from '../config';
import Routing from './Routing';
export default class Renderer {
  private routing: Routing;
  private styles: Record<string, string> = {};
  private config: OctopusConfig;
  private assetPrefix: string;

  constructor({ routing, config }: { routing: Routing; config: OctopusConfig }) {
    this.routing = routing;
    this.config = config;
    this.assetPrefix = config.assetPrefix || '';
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

  renderErrorToHTML = async ({
    req,
    res,
    err
  }: {
    req: Request;
    res: Response;
    err?: IncomingError;
  }) => {
    const route = this.routing.getErrorRoute();
    const pageProps = await route.getServerSideProps({ req, res, err });
    return this.renderToHTML({ pageProps, route });
  };

  renderNotFound = async ({ req, res }: { req: Request; res: Response }) => {
    res.statusCode = 404;
    res.send(await this.renderErrorToHTML({ req, res }));
  };

  render = async (req: Request, res: Response, routePath: string) => {
    try {
      const route = this.routing.getRoute(routePath);
      if (!route) {
        this.renderNotFound({ req, res });
        return;
      }
      const pageProps = await route.getServerSideProps({ req, res });
      const { redirect, notFound } = pageProps;
      if (redirect) {
        res.redirect(redirect.status || 302, redirect.destination);
        return;
      }
      if (notFound) {
        this.renderNotFound({ req, res });
        return;
      }
      res.send(await this.renderToHTML({ pageProps, route }));
    } catch (error: any) {
      res.statusCode = 500;
      const err = { message: error.message, context: routePath, status: 500 };
      res.send(await this.renderErrorToHTML({ req, res, err }));
    }
  };
}
