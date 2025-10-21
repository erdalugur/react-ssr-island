import { HttpRequest, HttpResponse } from '../types';

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
