import { renderToString } from 'react-dom/server';
import React from 'react';
import { Request, Response } from 'express'
import {
  routeLoader,
  getStyleTagOrLinks,
  manifestLoader
} from './utils';
import path from 'path';

const root = path.resolve(process.cwd());

const manifest = manifestLoader('pages-manifest.json');

const staticManifest = manifestLoader('static-manifest.json');

const styles = getStyleTagOrLinks(manifest);

const { getOctopusConfig } = require('../webpack/utils')

let octopusConfig: any
if (process.env.NODE_ENV === 'production') {
  octopusConfig = getOctopusConfig()
}
function register(config: Record<string, any>) {
  Object.keys(config).forEach(key => {
    process.env[key] = config[key];
  })
}
export function createRequestHandler({ dev }: { dev: boolean}) {
  if (dev) {
    require('../webpack').watch();
    octopusConfig = getOctopusConfig()
  }
  return async function render(req: Request, res: Response, route: string) {
    const item = manifest[route];
    if (!item || (item && !item.runtime)) {
      res.sendStatus(404);
      return;
    }
    
    const { publicRuntimeConfig = {}, serverRuntimeConfig } = octopusConfig || {};
    register({ ...publicRuntimeConfig, ...serverRuntimeConfig });
    const outdir = octopusConfig.outdir || path.resolve(root, "dist");

    const routePath = path.join(outdir, `${item.runtime}`);
    const { Component, Meta, getServerSideProps } = await routeLoader(routePath);

    const assets = staticManifest[route];

    if (!Component) {
      res.status(404).send('unknown page');
      return;
    }
  
    const pageProps = await getServerSideProps({ req, res });
    const html = renderToString(React.createElement(Component, pageProps.props));
    const metaTags = renderToString(React.createElement(Meta, pageProps.props));
  
    const linkOrStyle = styles[route];
  
    const preloadedStateScript = `<script id="__PRELOADED_STATE__" type="application/json">${JSON.stringify(
      {
        page: route,
        chunk: route,
        runtimeConfig: publicRuntimeConfig
      }
    )}</script>`;
  
    const javascripts = [
      preloadedStateScript,
      ...assets.js.map((item: string) => `<script src="/dist${item}"></script>`)
    ].join('\n');
  
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
          ${javascripts}
        </body>
      </html>
    `;
    res.send(document);
  };
}
