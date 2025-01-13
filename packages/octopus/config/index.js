"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = setConfig;
exports.defineConfig = defineConfig;
exports.default = () => {
    if (typeof window !== 'undefined') {
        return window.__INITIAL_STATE__.runtimeConfig;
    }
    return globalThis.runtimeConfig;
};
function setConfig(config) {
    globalThis.runtimeConfig = config;
}
function defineConfig(config) {
    return config;
}
