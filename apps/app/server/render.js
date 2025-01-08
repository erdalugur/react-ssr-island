const { renderToString } = require('react-dom/server');
const React = require('react');
const {
  createGetServerSideProps,
  createMeta,
  getStyleTagOrLinks,
  manifestLoader
} = require('./utils.js');
const path = require('path');
const getConfig = require('@octopus/runtime');

const root = path.resolve(__dirname, '..');

const manifest = manifestLoader('pages-manifest.json');

const staticManifest = manifestLoader('static-manifest.json');

const styles = getStyleTagOrLinks(manifest);

const modules = {};

for (const key in manifest) {
  const item = manifest[key];
  const mod = require(path.resolve(root, `dist${item.runtime}`));
  const getServerSideProps = createGetServerSideProps(mod);
  const meta = createMeta(mod);
  modules[key] = {
    meta: meta,
    default: mod.default,
    getServerSideProps: getServerSideProps
  };
}

const { publicRuntimeConfig } = getConfig();

module.exports = async function render(req, res, normalizedPath) {
  const mod = modules[normalizedPath];

  const assets = staticManifest[normalizedPath];

  if (!mod) {
    res.status(404).send('unknown page');
    return;
  }

  if (!mod.default) {
    res.status(500).send('page must be default export');
    return;
  }
  const pageProps = await mod.getServerSideProps({ req, res });
  const html = renderToString(React.createElement(mod.default, pageProps.props));
  const meta = renderToString(React.createElement(mod.meta, pageProps.props));

  const linkOrStyle = styles[normalizedPath];

  const preloadedStateScript = `<script id="__PRELOADED_STATE__" type="application/json">${JSON.stringify(
    {
      page: normalizedPath,
      chunk: normalizedPath,
      publicRuntimeConfig: publicRuntimeConfig
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
			${meta}
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
