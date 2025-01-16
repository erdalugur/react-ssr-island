"use strict";
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
exports.createRequestHandler = createRequestHandler;
const server_1 = require("react-dom/server");
const react_1 = __importDefault(require("react"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const root = path_1.default.resolve(process.cwd());
const manifest = (0, utils_1.manifestLoader)('pages-manifest.json');
const staticManifest = (0, utils_1.manifestLoader)('static-manifest.json');
const styles = (0, utils_1.getStyleTagOrLinks)(manifest);
const { getOctopusConfig } = require('../webpack/utils');
let octopusConfig;
if (process.env.NODE_ENV === 'production') {
    octopusConfig = getOctopusConfig();
}
function register(config) {
    Object.keys(config).forEach(key => {
        process.env[key] = config[key];
    });
}
function createRequestHandler({ dev }) {
    if (dev) {
        require('../webpack').watch();
        octopusConfig = getOctopusConfig();
    }
    return function render(req, res, route) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = manifest[route];
            if (!item || (item && !item.runtime)) {
                res.sendStatus(404);
                return;
            }
            const { publicRuntimeConfig = {}, serverRuntimeConfig } = octopusConfig || {};
            register(Object.assign(Object.assign({}, publicRuntimeConfig), serverRuntimeConfig));
            const outdir = octopusConfig.outdir || path_1.default.resolve(root, "dist");
            const routePath = path_1.default.join(outdir, `${item.runtime}`);
            const { Component, Meta, getServerSideProps } = yield (0, utils_1.routeLoader)(routePath);
            const assets = staticManifest[route];
            if (!Component) {
                res.status(404).send('unknown page');
                return;
            }
            const pageProps = yield getServerSideProps({ req, res });
            const html = (0, server_1.renderToString)(react_1.default.createElement(Component, pageProps.props));
            const metaTags = (0, server_1.renderToString)(react_1.default.createElement(Meta, pageProps.props));
            const linkOrStyle = styles[route];
            const preloadedStateScript = `<script id="__PRELOADED_STATE__" type="application/json">${JSON.stringify({
                page: route,
                chunk: route,
                runtimeConfig: publicRuntimeConfig
            })}</script>`;
            const javascripts = [
                preloadedStateScript,
                ...assets.js.map((item) => `<script src="/dist${item}"></script>`)
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
    };
}
