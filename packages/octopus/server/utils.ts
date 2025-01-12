import React from 'react';
import path from 'path';
import fs from 'fs';

const root = path.join(process.cwd());

export function manifestLoader(name: string) {
  return require(resolveModule(name));
}

export function resolveModule(m: string) {
  return path.join(root, 'dist', m);
}

export async function routeLoader(route: string){
  const mod = await import(route);
  return {
    Component: mod.default,
    Meta: mod?.Meta || (() => React.createElement(React.Fragment)),
    getServerSideProps: mod?.getServerSideProps || (() => ({ props: {} }))
  }
}
const isProd = process.env.NODE_ENV === 'production';

const styles: Record<string, string> = {};

export function getStyleTagOrLinks(manifest: Record<string, {runtime: string, css: string[]}>) {
  if (Object.keys(styles).length > 0) return styles;

  Object.keys(manifest).forEach((key) => {
    const css: string[] = manifest[key].css;
    if (isProd) {
      const _styles: string[] = [];
      css.forEach((s) => {
        const p = path.join(root, `dist${s}`);
        const style = fs.readFileSync(p, { encoding: 'utf-8' });
        _styles.push(`<style>${style}</style>`);
      });
      styles[key] = _styles.join(`\n`);
    } else {
      styles[key] = css.map((item) => `<link rel="stylesheet" href="/dist${item}"/>`).join('\n');
    }
  });
  return styles;
}


