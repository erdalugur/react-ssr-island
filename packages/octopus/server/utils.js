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
exports.manifestLoader = manifestLoader;
exports.resolveModule = resolveModule;
exports.routeLoader = routeLoader;
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
function routeLoader(route) {
    return __awaiter(this, void 0, void 0, function* () {
        const mod = yield Promise.resolve(`${route}`).then(s => __importStar(require(s)));
        return {
            Component: mod.default,
            Meta: (mod === null || mod === void 0 ? void 0 : mod.Meta) || (() => react_1.default.createElement(react_1.default.Fragment)),
            getServerSideProps: (mod === null || mod === void 0 ? void 0 : mod.getServerSideProps) || (() => ({ props: {} }))
        };
    });
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
