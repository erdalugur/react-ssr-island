import { BuildOptions } from 'esbuild';
import path from 'path';
import fs from 'fs';
import { getOctopusConfig } from '../config';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';

const octopusConfig = getOctopusConfig();
const pagesdir = octopusConfig.pagesdir as string;
const outdir = octopusConfig.outdir as string;

const octopusDir = path.resolve(__dirname, '..');

type Platform = 'server' | 'client';

const entryLoader = (platform: Platform = 'server') => {
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

const extraLoader = () => {
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

function appAliasPlugin() {
  return require('esbuild-plugin-alias')({
    react: require.resolve('preact/compat'),
    'react-dom': require.resolve('preact/compat'),
    'react-dom/client': require.resolve('preact/compat/client'),
    'react/jsx-runtime': require.resolve('preact/jsx-runtime'),
    'react-dom/test-utils': require.resolve('preact/test-utils')
  });
}

const manifestPlugin = ({
  isServer,
  entryPoints
}: {
  isServer: boolean;
  entryPoints: Record<string, string>;
}) => {
  return {
    name: 'manifest-plugin',
    setup(build: any) {
      build.onEnd((result: any) => {
        if (result.errors.length === 0) {
          const manifest = Object.keys(result.metafile.outputs)
            .filter((x) => !/\.map$/.test(x))
            .reduce((acc: any, file) => {
              const outputName = file
                .replace(/^dist\/(pages|static)\//, '/')
                .replace(/(.js|.css)/, '');
              const item = file.replace(/^dist\//, '/');
              if (!item.includes('.css')) {
                acc[outputName] = {
                  [isServer ? 'runtime' : 'js']: isServer ? item : [item],
                  css: []
                };
              }
              // CSS dosyalarını bul ve ekle
              Object.keys(result.metafile.outputs).forEach((cssFile) => {
                if (cssFile.endsWith('.css')) {
                  if (result.metafile.outputs[cssFile].inputs)
                    acc[outputName].css.push(cssFile.replace(/^dist\//, '/'));
                }
              });

              return acc;
            }, {});

          const out = `${outdir}/${isServer ? 'pages' : 'static'}-manifest.json`;
          fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
        }
      });
    }
  };
};

function changeLoggerPlugin() {
  let buildNumber: number = 0;

  const manifestPath = path.join(octopusConfig.outdir as string, '..', 'octopus-build-log.txt');
  return {
    name: 'build-manifest',
    setup(build: any) {
      build.onEnd(() => {
        buildNumber++;
        const manifestContent = `${buildNumber}`;
        if (fs.existsSync(manifestPath)) {
          const currentContent = fs.readFileSync(manifestPath, 'utf8');
          if (currentContent === manifestContent) return;
        }
        fs.writeFileSync(manifestPath, manifestContent, 'utf8');
      });
    }
  };
} 

export interface ConfigOptions {
  isServer: boolean;
  mode: 'production' | 'development';
}
export default function createConfig({ isServer, mode }: ConfigOptions) {
  const out = isServer ? `${outdir}/pages` : `${outdir}/static`;

  const entryPoints = isServer
    ? {
        ...entryLoader('server'),
        ...extraLoader()
      }
    : entryLoader('client');
  return {
    entryPoints: entryPoints,
    platform: isServer ? 'node': 'browser',
    preserveSymlinks: true,
    write: true,
    outdir: out,
    format: isServer ? 'cjs' : 'iife',
    bundle: true,
    minify: true,
    target: isServer ? ['node18'] : ['esnext'],
    sourcemap: mode === 'development',
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
    metafile: true,
    plugins: [
      sassPlugin({
        filter: /\.module\.scss$/,
        silenceDeprecations: ['import'],
        type: 'css',
        transform: postcssModules({
          localsConvention: 'camelCaseOnly',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        })
      }),
      sassPlugin({
        filter: /\.scss$/,
        type: 'css',
        silenceDeprecations: ['import']
      }),
      !isServer && appAliasPlugin(),
      manifestPlugin({ isServer, entryPoints }),
      changeLoggerPlugin()
    ].filter(Boolean),
    external: isServer ? ['react', 'react-dom'] : [],
    jsx: 'automatic'
  } as BuildOptions;
}
