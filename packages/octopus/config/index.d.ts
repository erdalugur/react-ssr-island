declare const _default: () => any;
export default _default;
export declare function setConfig(config: any): void;
export interface OctopusConfig {
    publicRuntimeConfig?: Record<string, any>;
    serverRuntimeConfig?: Record<string, any>;
    pagesdir?: string;
    outdir?: string;
}
export declare function defineConfig(config: OctopusConfig): OctopusConfig;
