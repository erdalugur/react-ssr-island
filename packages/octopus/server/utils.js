const React = require('react');
const path = require('path');
const fs = require('fs');

const root = path.resolve(process.cwd());

function manifestLoader(name) {
  return require(resolveModule(name));
}

function resolveModule(m) {
  return path.resolve(root, 'dist', m);
}

function createGetServerSideProps(mod) {
  return mod?.getServerSideProps || (() => ({ props: {} }));
}
function createMeta(mod) {
  return mod?.Meta || (() => React.createElement(React.Fragment));
}
const isProd = process.env.NODE_ENV === 'production';

const styles = {};
function getStyleTagOrLinks(manifest) {
  if (Object.keys(styles).length > 0) return styles;

  Object.keys(manifest).forEach((key) => {
    const css = manifest[key].css;
    if (isProd) {
      const _styles = [];
      css.forEach((s) => {
        const p = path.resolve(root, `dist${s}`);
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

module.exports = {
  manifestLoader,
  resolveModule,
  createGetServerSideProps,
  createMeta,
  getStyleTagOrLinks
};
