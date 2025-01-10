import { renderToString } from 'react-dom/server';
import React from 'react';
import { Request, Response } from 'express'
import {
  createGetServerSideProps,
  createMeta,
  getStyleTagOrLinks,
  manifestLoader
} from './utils';
import path from 'path';
import { setConfig } from '../config';

const root = path.resolve(process.cwd());

const manifest = manifestLoader('pages-manifest.json');

const staticManifest = manifestLoader('static-manifest.json');

const styles = getStyleTagOrLinks(manifest);
const { getOctopusConfig } = require('../webpack/utils')
let octopusConfig: any
if (process.env.NODE_ENV === 'production') {
  octopusConfig = getOctopusConfig()
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
    
    const { publicRuntimeConfig = {}, serverRuntimeConfig = {} } = octopusConfig || {};
    const outdir = octopusConfig.outdir || path.resolve(root, "dist");

    setConfig({
      publicRuntimeConfig,
      serverRuntimeConfig
    })

    const mod = require(path.join(outdir, `${item.runtime}`));

    const assets = staticManifest[route];

    if (!mod) {
      res.status(404).send('unknown page');
      return;
    }
  
    if (!mod.default) {
      res.status(500).send('page must be default export');
      return;
    }
    
    const getServerSideProps = createGetServerSideProps(mod)
    const pageProps = await getServerSideProps({ req, res });
    const html = renderToString(React.createElement(mod.default, pageProps.props));
    const meta = createMeta(mod);
    const metaTags = renderToString(React.createElement(meta, pageProps.props));
  
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
