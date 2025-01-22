const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const fs = require('fs');
const { getOctopusConfig } = require('../utils');

const octopusConfig = getOctopusConfig();
const pagesdir = octopusConfig.pagesdir;
const outdir = octopusConfig.outdir;

const octopusDir = path.join(__dirname, '../..');

const entryLoader = (platform = 'server') => {
  const entries = {};
  const loadEntries = (currentDir) => {
    const files = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(currentDir, file.name);

      if (file.isDirectory()) {
        loadEntries(fullPath);
      } else if (file.isFile() && file.name === `index.${platform}.tsx`) {
        const relativePath = path.relative(pagesdir, fullPath);
        const entryKey = relativePath.replace(/\\/g, '/').replace(`/index.${platform}.tsx`, ''); // Cross-platform için normalize edilmiş key
        entries[entryKey] = fullPath;
      }
    }
  };
  try {
    loadEntries(pagesdir);
    entries['_error'] = entries['_error'] || path.join(octopusDir, 'document/_error.tsx');
    return entries;
  } catch (error) {
    console.error('Hata oluştu:', error);
    throw error;
  }
};

const extraLoader = () => {
  const keys = ['_document.tsx'];
  const entries = {};
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
    _document: entries['_document'] || path.join(octopusDir, 'document/index.tsx')
  };
};

const styleLoader = MiniCssExtractPlugin.loader;

const postcssLoader = {
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

const cssLoader = {
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

const sassLoader = {
  loader: 'sass-loader',
  options: {
    implementation: require('sass'),
    //api: 'legacy',
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
const getStyleLoaders = () => {
  return styleLoaders;
};

const getJavascriptLoaders = () => {
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
              targets: '> 0.25%, not dead',
              useBuiltIns: 'usage',
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

const getMiniCssExtractPlugin = (client = false) => {
  return new MiniCssExtractPlugin({
    filename: client ? 'static/client/[name]/[name].css' : 'static/css/[name]/[name].css',
    chunkFilename: client ? 'static/chunk/[chunkhash].css' : 'static/css/[name]/[name].css'
  });
};

const extensions = ['.tsx', '.ts', '.js', '.css'];

const getAppAliases = () => {
  return {
    react: 'preact/compat',
    'react-dom/test-utils': 'preact/test-utils',
    'react-dom': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime'
  };
};

module.exports = {
  entryLoader,
  getJavascriptLoaders,
  getStyleLoaders,
  getMiniCssExtractPlugin,
  extensions,
  pagesdir,
  outdir,
  octopusConfig,
  getAppAliases,
  extraLoader
};
