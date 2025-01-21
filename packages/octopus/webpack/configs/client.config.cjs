const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const {
  entryLoader,
  extensions,
  getJavascriptLoaders,
  getMiniCssExtractPlugin,
  getStyleLoaders,
  outdir,
  octopusConfig,
  getAppAliases
} = require('./common.cjs');

const isDevelopment = process.env.NODE_ENV !== 'production';

const entries = octopusConfig.clientEntries || entryLoader('client');

/** @type { import('webpack').Configuration } */
const config = {
  name: 'client',
  mode: isDevelopment ? 'development' : 'production',
  target: 'browserslist',
  entry: entries,
  output: {
    path: outdir,
    filename: 'static/js/[name]/main.[chunkhash].js',
    publicPath: octopusConfig.assetPrefix
      ? `${octopusConfig.assetPrefix}/`
      : `/${octopusConfig.outdirname}/`
  },
  devtool: isDevelopment ? 'eval-source-map' : false,
  resolve: {
    extensions: extensions,
    alias: getAppAliases()
  },
  module: {
    rules: [...getStyleLoaders(), getJavascriptLoaders()]
  },
  ...(isDevelopment
    ? {}
    : {
        optimization: {
          nodeEnv: isDevelopment ? 'development' : 'production',
          runtimeChunk: false,
          minimize: true,
          usedExports: true,
          minimizer: [
            new TerserPlugin({
              parallel: true,
              terserOptions: {
                compress: true
              }
            })
          ]
        }
      }),
  plugins: [
    getMiniCssExtractPlugin(true),
    new WebpackManifestPlugin({
      fileName: 'static-manifest.json',
      publicPath: '/',
      generate: (seed, files, entrypoints) => {
        const manifest = {};
        for (let index = 0; index < files.length; index++) {
          const item = files[index];
          const ext = path.extname(item.name);
          const entry = item.name.replace(ext, '');
          const route = `/${entry}`;
          const asset = ext.replace('.', '');
          if (entries[entry]) {
            if (!manifest[route]) {
              manifest[route] = {
                js: []
              };
            }
            if (ext === '.js') {
              manifest[route][asset].push(item.path);
            }
          }
        }
        return manifest;
      }
    })
  ]
};
const fn = octopusConfig.webpack || ((c) => c);
module.exports = fn(config, { isServer: false });
