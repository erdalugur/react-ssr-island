"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createServer;
const server_1 = require("react-dom/server");
const react_1 = __importDefault(require("react"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class Server {
    constructor({ dev }) {
        this.dev = process.env.NODE_ENV !== 'production';
        this.styles = {};
        this.register = (config) => {
            Object.keys(config).forEach((key) => {
                process.env[key] = config[key];
            });
        };
        this.routeLoader = (route) => __awaiter(this, void 0, void 0, function* () {
            const mod = yield Promise.resolve(`${route}`).then(s => __importStar(require(s)));
            return {
                Component: mod.default,
                Meta: (mod === null || mod === void 0 ? void 0 : mod.Meta) || (() => react_1.default.createElement(react_1.default.Fragment)),
                getServerSideProps: (mod === null || mod === void 0 ? void 0 : mod.getServerSideProps) || (() => ({ props: {} }))
            };
        });
        this.render = (req, res, route) => __awaiter(this, void 0, void 0, function* () {
            const item = this.serverManifest[route];
            if (!item || (item && !item.runtime)) {
                res.sendStatus(404);
                return;
            }
            const { publicRuntimeConfig, serverRuntimeConfig } = this.octopusConfig;
            this.register(Object.assign(Object.assign({}, publicRuntimeConfig), serverRuntimeConfig));
            const routePath = path_1.default.join(this.outdir, `${item.runtime}`);
            const { Component, Meta, getServerSideProps } = yield this.routeLoader(routePath);
            const assets = this.clientManifest[route];
            if (!Component) {
                res.status(404).send('unknown page');
                return;
            }
            const pageProps = yield getServerSideProps({ req, res });
            const html = (0, server_1.renderToString)(react_1.default.createElement(Component, pageProps.props));
            const metaTags = (0, server_1.renderToString)(react_1.default.createElement(Meta, pageProps.props));
            const linkOrStyle = this.styleTagsOrLinks[route];
            const preloadedStateScript = `<script id="__PRELOADED_STATE__" type="application/json">${JSON.stringify({
                page: route,
                chunk: route,
                runtimeConfig: publicRuntimeConfig
            })}</script>`;
            const javascripts = [
                preloadedStateScript,
                ...assets.js.map((item) => `<script src="/${this.outdirname}${item}"></script>`)
            ].join('\n');
            const document = `
      <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${metaTags}
        ${linkOrStyle}
        </head>
        <body>
          <div id="root">${html}</div>
          ${javascripts}
        </body>
      </html>
    `;
            res.send(document);
        });
        this.manifestLoader = (m) => __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(`${path_1.default.join(this.outdir, m)}`).then(s => __importStar(require(s)));
        });
        this.prepare = () => __awaiter(this, void 0, void 0, function* () {
            if (this.dev) {
                const { watch } = require('../webpack');
                yield watch();
            }
            const { getOctopusConfig } = require('../webpack/utils');
            this.octopusConfig = getOctopusConfig();
            this.outdir = this.octopusConfig.outdir;
            const names = this.outdir.split('/');
            this.outdirname = names[names.length - 1];
            this.serverManifest = yield this.manifestLoader('pages-manifest.json');
            this.clientManifest = yield this.manifestLoader('static-manifest.json');
            this.styleTagsOrLinks = this.getStyleTagOrLinks(this.serverManifest);
            return Promise.resolve();
        });
        this.getRequestHandler = (req, res) => __awaiter(this, void 0, void 0, function* () {
            return () => { };
        });
        if (dev) {
            require('../webpack').watch();
            this.dev = dev;
        }
    }
    getStyleTagOrLinks(manifest) {
        if (Object.keys(this.styles).length > 0)
            return this.styles;
        Object.keys(manifest).forEach((key) => {
            const css = manifest[key].css || [];
            if (!this.dev) {
                const _styles = [];
                css.forEach((s) => {
                    const p = path_1.default.join(this.outdir, `${s}`);
                    const style = fs_1.default.readFileSync(p, { encoding: 'utf-8' });
                    _styles.push(`<style>${style}</style>`);
                });
                this.styles[key] = _styles.join(`\n`);
            }
            else {
                this.styles[key] = css
                    .map((item) => `<link rel="stylesheet" href="/${this.outdirname}${item}"/>`)
                    .join('\n');
            }
        });
        return this.styles;
    }
}
function createServer({ dev }) {
    return new Server({ dev });
}
