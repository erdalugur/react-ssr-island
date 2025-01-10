const { renderToString } = require('react-dom/server');
const React = require('react');
const {
  createGetServerSideProps,
  createMeta,
  getStyleTagOrLinks,
  manifestLoader
} = require('./utils.js');
const path = require('path');

const root = path.resolve(process.cwd());

const manifest = manifestLoader('pages-manifest.json');

const staticManifest = manifestLoader('static-manifest.json');

const styles = getStyleTagOrLinks(manifest);

const modules = {};

module.exports = {
  createRequestHandler: function createRequestHandler({ dev }) {
    if (dev) {
      require('../webpack').watch();
    }
    return async function render(req, res, normalizedPath) {
      const item = manifest[normalizedPath];
      if (!item || (item && !item.runtime)) {
        res.sendStatus(404);
        return;
      }

      const mod = require(path.resolve(root, `dist${item.runtime}`));

      const assets = staticManifest[normalizedPath];

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
    
      const linkOrStyle = styles[normalizedPath];
    
      const preloadedStateScript = `<script id="__PRELOADED_STATE__" type="application/json">${JSON.stringify(
        {
          page: normalizedPath,
          chunk: normalizedPath,
          runtimeConfig: {}
        }
      )}</script>`;
    
      const javascripts = [
        preloadedStateScript,
        ...assets.js.map((item) => `<script src="/dist${item}"></script>`)
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
}
