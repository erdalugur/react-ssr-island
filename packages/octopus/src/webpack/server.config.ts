import path from 'path';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import webpackNodeExternals from 'webpack-node-externals';
import {
  entryLoader,
  getJavascriptLoaders,
  getMiniCssExtractPlugin,
  getStyleLoaders,
  extensions,
  outdir,
  octopusConfig,
  getAppAliases,
  extraLoader
} from './common';

const isDevelopment = process.env.NODE_ENV !== 'production';

const entries = octopusConfig.serverEntries || {
  ...entryLoader('server'),
  ...extraLoader()
};

/** Webpack Configuration */
const config: import('webpack').Configuration = {
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
        const current: Record<string, any> = {};
        for (const item of files) {
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
  externals: [webpackNodeExternals(), { react: 'react', 'react-dom': 'react-dom' }]
};

const fn = octopusConfig.webpack || ((c: import('webpack').Configuration) => c);

module.exports = fn(config, { isServer: true, buildId: '' });
