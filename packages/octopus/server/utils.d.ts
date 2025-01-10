export declare function manifestLoader(name: string): any;
export declare function resolveModule(m: string): string;
export declare function createGetServerSideProps(mod: any): any;
export declare function createMeta(mod: any): any;
export declare function getStyleTagOrLinks(manifest: Record<string, {
    runtime: string;
    css: string[];
}>): Record<string, string>;
