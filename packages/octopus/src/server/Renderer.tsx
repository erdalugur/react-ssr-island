import { Request, Response } from 'express';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { IncomingError, Route } from '../types';
import { OctopusConfig } from '../config';
import Routing from './Routing';
import Assets from './Assets';
import { parse } from 'url';

export default class Renderer {
  private routing: Routing;
  private config: OctopusConfig;
  private assets: Assets;
  constructor({ routing, config }: { routing: Routing; config: OctopusConfig }) {
    this.routing = routing;
    this.config = config;
    this.assets = new Assets({ config: config });
  }

  renderToHTML = async ({ pageProps, route }: { pageProps: any; route: Route }) => {
    const Document = this.routing.getDocument();
    const scrips = this.assets.getScriptTags(route.js);
    const styles = await this.assets.getStyleTags(route.css);
    const html = renderToString(
      <Document
        main={() => <route.Page {...pageProps.props} />}
        scripts={() => scrips}
        meta={() => <route.Meta {...pageProps.props} />}
        styles={() => styles}
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
      if (!route) return this.renderNotFound({ req, res });

      const staticRouteParams = (await route?.getStaticParams?.()) || [];
      const incomingRequestParams = this.routing.getStaticRouteParams(
        staticRouteParams,
        req.params
      );

      if (route?.getStaticParams && !incomingRequestParams) {
        return this.renderNotFound({ req, res });
      }

      const pageProps = await route.getServerSideProps({ req, res, params: incomingRequestParams });
      const { redirect, notFound } = pageProps;

      if (redirect) return res.redirect(redirect.status || 302, redirect.destination);

      if (notFound) return this.renderNotFound({ req, res });

      res.send(await this.renderToHTML({ pageProps, route }));
    } catch (error: any) {
      res.statusCode = 500;
      const err = { message: error.message, context: routePath, status: 500 };
      res.send(await this.renderErrorToHTML({ req, res, err }));
    }
  };

  requestHandler = (req: Request, res: Response) => {
    const { pathname } = parse(req.originalUrl, true) as { pathname: string };
    const route = pathname === '/' ? '/index' : pathname;
    const match = this.routing.matchRoute(route);
    if (!match) return this.renderNotFound({ req, res });

    const params = this.routing.getRouteURLParams(match, route);
    req.params = params as any;
    this.render(req, res, match);
  };
}
