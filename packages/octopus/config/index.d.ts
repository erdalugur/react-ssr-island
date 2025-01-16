export interface OctopusConfig {
    publicRuntimeConfig?: Record<string, any>;
    serverRuntimeConfig?: Record<string, any>;
    pagesdir?: string;
    outdir?: string;
    clientEntries?: string[];
    serverEntries?: string[];
}
export declare function defineConfig(config: OctopusConfig): OctopusConfig;
