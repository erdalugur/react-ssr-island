import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import fs from 'fs';
import { getOctopusConfig } from '../config';

export const octopusConfig = getOctopusConfig();
export const pagesdir = octopusConfig.pagesdir as string;
export const outdir = octopusConfig.outdir as string;

const octopusDir = path.resolve(__dirname, '..');

type Platform = 'server' | 'client';

export const entryLoader = (platform: Platform = 'server') => {
  const entries: Record<string, string> = {};

  const loadEntries = (currentDir: string) => {
    const files = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(currentDir, file.name);

      if (file.isDirectory()) {
        loadEntries(fullPath);
      } else if (file.isFile() && file.name === `index.${platform}.tsx`) {
        const relativePath = path.relative(pagesdir, fullPath);
        const entryKey = relativePath.replace(/\\/g, '/').replace(`/index.${platform}.tsx`, '');
        entries[entryKey] = fullPath;
      }
    }
  };

  try {
    loadEntries(pagesdir);
    entries['_error'] = entries['_error'] || path.join(octopusDir, 'document/_error.js');
    return entries;
  } catch (error) {
    console.error('Error occurred:', error);
    throw error;
  }
};

export const extraLoader = () => {
  const keys = ['_document.tsx'];
  const entries: Record<string, string> = {};
  const files = fs.readdirSync(pagesdir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(pagesdir, file.name);

    if (file.isFile() && keys.includes(file.name)) {
      const relativePath = path.relative(pagesdir, fullPath);
      const entryKey = relativePath.replace('.tsx', '');
      entries[entryKey] = fullPath;
    }
  }

  return {
    _document: entries['_document'] || path.join(octopusDir, 'document/index.js')
  };
};

export const styleLoader = MiniCssExtractPlugin.loader;

export const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        [
          'postcss-preset-env',
          {
            // Options
          }
        ]
      ]
    }
  }
};

export const cssLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      auto: true,
      exportOnlyLocals: false,
      localIdentName: '[local]__[hash:base64:5]'
    },
    esModule: false
  }
};

export const sassLoader = {
  loader: 'sass-loader',
  options: {
    implementation: require('sass'),
    warnRuleAsWarning: false,
    sassOptions: {
      //outputStyle: "expanded",
    }
  }
};

const styleLoaders = [
  {
    test: /\.module\.css$/,
    use: [styleLoader, cssLoader, postcssLoader]
  },
  {
    test: /\.module\.scss$/,
    use: [styleLoader, cssLoader, postcssLoader, sassLoader]
  },
  {
    test: /\.css$/,
    exclude: /\.module\.css$/,
    use: [styleLoader, cssLoader]
  },
  {
    test: /\.scss$/,
    exclude: /\.module\.scss$/,
    use: [styleLoader, cssLoader, postcssLoader, sassLoader]
  }
];

export const getStyleLoaders = () => {
  return styleLoaders;
};

export const getJavascriptLoaders = (isServer: boolean) => {
  return {
    test: /\.(js|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          [
            '@babel/preset-env',
            {
              ...(isServer
                ? {
                    ignoreBrowserslistConfig: true,
                    targets: {
                      node: 'current'
                    }
                  }
                : {
                    forceAllTransforms: true
                  }),
              useBuiltIns: false,
              corejs: false
            }
          ],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript'
        ],
        plugins: ['@babel/plugin-transform-runtime']
      }
    }
  };
};

export const extensions = ['.tsx', '.ts', '.js', '.css'];

export const getAppAliases = () => {
  return {
    react: 'preact/compat',
    'react-dom/test-utils': 'preact/test-utils',
    'react-dom': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime'
  };
};
