import { IncomingMessage, ServerResponse } from 'http';
import { compression } from './Compression';
import ServeStatic from './ServeStatic';
import { HttpRequest, HttpResponse } from '../types';

export function compose(
  middlewares: ((
    ctx: { req: IncomingMessage; res: ServerResponse },
    next: () => Promise<void>
  ) => Promise<void>)[]
) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const ctx = { req, res };

    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) throw new Error('next() çağrısı birden fazla yapıldı');
      index = i;
      const fn = middlewares[i];
      if (!fn) return;
      await fn(ctx, () => dispatch(i + 1));
    };

    await dispatch(0);
  };
}

export function enhanceReq(req: any): HttpRequest {
  if (!req.params) req.params = {};
  if (!req.query) req.query = {};
  if (!req.body) req.body = undefined;

  return req as HttpRequest;
}

export function enhanceRes(res: any): HttpResponse {
  const r = res as HttpResponse;

  r.status = (code: number) => {
    r.statusCode = code;
    return r;
  };

  r.send = (body: string | Buffer) => {
    if (!r.getHeader('Content-Type')) {
      r.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    r.end(body);
  };

  r.json = (body: unknown) => {
    r.setHeader('Content-Type', 'application/json; charset=utf-8');
    r.end(JSON.stringify(body));
  };

  r.redirect = (status: number, url: string) => {
    r.statusCode = status;
    r.setHeader('Location', url);
    r.end();
  };

  return r;
}

type WrapOptions = {
  fieldNames?: string[];
};

export function enhanceRenderer<T extends object>(
  renderer: T,
  serveStatic: ServeStatic,
  options: WrapOptions = {}
): T {
  const { fieldNames } = options;
  const target: any = { ...renderer };
  const keysToWrap = fieldNames ?? Object.keys(renderer);

  for (const key of keysToWrap) {
    const orig = (renderer as any)[key];
    if (typeof orig !== 'function') continue;

    target[key] = async (...args: any[]) => {
      const req: IncomingMessage = args[0];
      const res: ServerResponse = args[1];

      const handler = compose([
        compression(),
        async (ctx, next) => await serveStatic.serve(ctx.req, ctx.res, next),
        async (ctx, next) => await orig(enhanceReq(ctx.req), enhanceRes(ctx.res), ...args.slice(2))
      ]);

      return await handler(req, res);
    };
  }

  return target;
}
