"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCache = withCache;
const react_1 = __importDefault(require("react"));
const componentCache = new Map();
const createHash = (input) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash.toString();
};
function renderWithCache(Component, props, ttl) {
    const hash = createHash(JSON.stringify(props));
    if (componentCache.has(hash)) {
        const cached = componentCache.get(hash);
        if (!ttl)
            return cached.component;
        if (Date.now() - cached.timestamp < ttl) {
            /* eslint-disable-next-line no-undef */
            /* eslint-disable-next-line no-console */
            console.log('Cache hit');
            return cached.component;
        }
        componentCache.delete(hash);
    }
    /* eslint-disable-next-line no-undef */
    /* eslint-disable-next-line no-console */
    console.log('Cache miss');
    const component = <Component {...props}/>;
    // Cache'e kaydet
    componentCache.set(hash, { component, timestamp: Date.now() });
    return component;
}
function withCache(Component) {
    return (props) => {
        return renderWithCache(Component, props, props.ttl);
    };
}
exports.default = withCache;
