const path = require('path');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const {
  entryLoader,
  getJavascriptLoaders,
  getMiniCssExtractPlugin,
  getStyleLoaders,
  extensions,
  outdir,
  octopusConfig,
  getAppAliases,
  extraLoader
} = require('./common.cjs');

const isDevelopment = process.env.NODE_ENV !== 'production';

const entries = octopusConfig.serverEntries || {
  ...entryLoader('server'),
  ...extraLoader()
};

/** @type { import('webpack').Configuration } */
const config = {
  name: 'server',
  mode: isDevelopment ? 'development' : 'production',
  target: 'node',
  entry: entries,
  optimization: {
    splitChunks: false
  },
  output: {
    path: outdir,
    filename: 'pages/[name].cjs',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: extensions,
    byDependency: {
      'node-fetch': {
        mainFields: ['main', 'module']
      },
      'isomorphic-fetch': {
        mainFields: ['main', 'module']
      }
    },
    alias: getAppAliases()
  },
  module: {
    rules: [...getStyleLoaders(), getJavascriptLoaders()]
  },
  plugins: [
    getMiniCssExtractPlugin(),
    new WebpackManifestPlugin({
      fileName: 'pages-manifest.json',
      publicPath: '/',
      generate: (seed, files) => {
        const current = {};
        for (let index = 0; index < files.length; index++) {
          const item = files[index];
          const ext = path.extname(item.name);
          const entry = item.name.replace(ext, '');
          const route = `/${entry}`;
          if (entries[entry]) {
            if (!current[route]) {
              current[route] = {
                runtime: '',
                css: []
              };
            }
            if (ext === '.cjs') {
              current[route].runtime = item.path;
            }
            if (ext === '.css') {
              current[route].css.push(item.path);
            }
          }
        }
        return current;
      }
    })
  ],
  externals: [require('webpack-node-externals')(), { react: 'react', 'react-dom': 'react-dom' }]
};
const fn = octopusConfig.webpack || ((c) => c);
module.exports = fn(config, { isServer: true });
