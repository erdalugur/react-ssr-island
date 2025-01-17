import { Request, Response } from 'express';
import { OctopusConfig } from '../config';
declare class Server {
    octopusConfig: OctopusConfig;
    dev: boolean;
    serverManifest: any;
    clientManifest: any;
    styleTagsOrLinks: Record<string, string>;
    styles: Record<string, string>;
    outdir: string;
    outdirname: string;
    constructor({ dev }: {
        dev: boolean;
    });
    register: (config: Record<string, any>) => void;
    routeLoader: (route: string) => Promise<{
        Component: any;
        Meta: any;
        getServerSideProps: any;
    }>;
    render: (req: Request, res: Response, route: string) => Promise<void>;
    manifestLoader: (m: string) => Promise<any>;
    getScripts: (route: string, publicRuntimeConfig: any, js: string[]) => string;
    prepare: () => Promise<void>;
    getStyleTagOrLinks(manifest: Record<string, {
        runtime: string;
        css: string[];
    }>): Record<string, string>;
    getRequestHandler: (req: Request, res: Response) => Promise<() => void>;
}
export default function createServer({ dev }: {
    dev: boolean;
}): Server;
export {};
