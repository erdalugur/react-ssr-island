"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifestLoader = manifestLoader;
exports.resolveModule = resolveModule;
exports.createGetServerSideProps = createGetServerSideProps;
exports.createMeta = createMeta;
exports.getStyleTagOrLinks = getStyleTagOrLinks;
const react_1 = __importDefault(require("react"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const root = path_1.default.join(process.cwd());
function manifestLoader(name) {
    return require(resolveModule(name));
}
function resolveModule(m) {
    return path_1.default.join(root, 'dist', m);
}
function createGetServerSideProps(mod) {
    return (mod === null || mod === void 0 ? void 0 : mod.getServerSideProps) || (() => ({ props: {} }));
}
function createMeta(mod) {
    return (mod === null || mod === void 0 ? void 0 : mod.Meta) || (() => react_1.default.createElement(react_1.default.Fragment));
}
const isProd = process.env.NODE_ENV === 'production';
const styles = {};
function getStyleTagOrLinks(manifest) {
    if (Object.keys(styles).length > 0)
        return styles;
    Object.keys(manifest).forEach((key) => {
        const css = manifest[key].css;
        if (isProd) {
            const _styles = [];
            css.forEach((s) => {
                const p = path_1.default.join(root, `dist${s}`);
                const style = fs_1.default.readFileSync(p, { encoding: 'utf-8' });
                _styles.push(`<style>${style}</style>`);
            });
            styles[key] = _styles.join(`\n`);
        }
        else {
            styles[key] = css.map((item) => `<link rel="stylesheet" href="/dist${item}"/>`).join('\n');
        }
    });
    return styles;
}
