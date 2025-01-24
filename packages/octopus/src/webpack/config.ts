import { Configuration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import {
  entryLoader,
  extensions,
  getJavascriptLoaders,
  getStyleLoaders,
  outdir,
  octopusConfig,
  getAppAliases,
  extraLoader
} from './common';

function createManifest(entries: any, isServer: boolean) {
  const serverGenerate = (_: any, files: any[]) => {
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
  };

  const clientGenerate = (_: any, files: any[]) => {
    const manifest: any = {};
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
  };

  return new WebpackManifestPlugin({
    fileName: isServer ? 'pages-manifest.json' : 'static-manifest.json',
    publicPath: '/',
    generate: isServer ? serverGenerate : clientGenerate
  });
}

function getMiniCssExtractPlugin(client = false) {
  return new MiniCssExtractPlugin({
    filename: client
      ? 'static/client/[name]/[name].[chunkhash].css'
      : 'static/css/[name]/[name].[chunkhash].css',
    chunkFilename: client ? 'static/chunk/[chunkhash].css' : 'static/css/[name]/[name].css'
  });
}

export interface ConfigOptions {
  isServer: boolean;
  mode: 'production' | 'development';
  buildId: string;
}

export default function createConfig({ isServer, mode, buildId }: ConfigOptions): Configuration {
  const isDevelopment = mode !== 'production';

  const entries = isServer
    ? octopusConfig.serverEntries || {
        ...entryLoader('server'),
        ...extraLoader()
      }
    : octopusConfig.clientEntries || entryLoader('client');

  const clientOutput = {
    path: outdir,
    filename: 'static/js/[name]/main.[chunkhash].js',
    publicPath: octopusConfig.assetPrefix
      ? `${octopusConfig.assetPrefix}/`
      : `/${octopusConfig.outdirname}/`
  };
  const serverOutput = {
    path: outdir,
    filename: 'pages/[name].cjs',
    libraryTarget: 'commonjs2'
  };
  const config: Configuration = {
    name: isServer ? 'server' : 'client',
    mode: mode,
    target: isServer ? 'node' : 'browserslist',
    entry: entries,
    output: isServer ? serverOutput : clientOutput,
    devtool: isDevelopment ? 'eval-source-map' : false,
    resolve: {
      extensions: extensions,
      alias: getAppAliases(),
      ...(isServer && {
        byDependency: {
          'node-fetch': {
            mainFields: ['main', 'module']
          },
          'isomorphic-fetch': {
            mainFields: ['main', 'module']
          }
        }
      })
    },
    module: {
      rules: [...getStyleLoaders(), getJavascriptLoaders()]
    },
    ...(isDevelopment && isServer
      ? {}
      : {
          optimization: {
            nodeEnv: 'production',
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
    plugins: [getMiniCssExtractPlugin(!isServer), createManifest(entries, isServer)],
    externals: isServer
      ? [require('webpack-node-externals')(), { react: 'react', 'react-dom': 'react-dom' }]
      : []
  };

  const fn =
    octopusConfig.webpack || ((c: Configuration, {}: { isServer: boolean; buildId: string }) => c);
  return fn(config, { isServer, buildId });
}
