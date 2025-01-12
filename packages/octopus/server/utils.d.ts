export declare function manifestLoader(name: string): any;
export declare function resolveModule(m: string): string;
export declare function routeLoader(route: string): Promise<{
    Component: any;
    Meta: any;
    getServerSideProps: any;
}>;
export declare function getStyleTagOrLinks(manifest: Record<string, {
    runtime: string;
    css: string[];
}>): Record<string, string>;
