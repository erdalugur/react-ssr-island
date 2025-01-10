import { Request, Response } from 'express';
export declare function createRequestHandler({ dev }: {
    dev: boolean;
}): (req: Request, res: Response, route: string) => Promise<void>;
