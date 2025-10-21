import { createGzip, createBrotliCompress, createDeflate } from 'zlib';
import { IncomingMessage, ServerResponse } from 'http';
import stream from 'stream';

export function compression() {
  return async (
    ctx: { req: IncomingMessage; res: ServerResponse },
    next: () => Promise<void>
  ) => {
    const { req, res } = ctx;

    const acceptEncoding = req.headers['accept-encoding'] || '';
    let encoder: stream.Transform | null = null;
    let encoding: string | null = null;

    if (/\bbr\b/.test(acceptEncoding as string)) {
      encoder = createBrotliCompress();
      encoding = 'br';
    } else if (/\bgzip\b/.test(acceptEncoding as string)) {
      encoder = createGzip();
      encoding = 'gzip';
    } else if (/\bdeflate\b/.test(acceptEncoding as string)) {
      encoder = createDeflate();
      encoding = 'deflate';
    }

    if (!encoder) {
      await next();
      return;
    }

    const _write = res.write.bind(res);
    const _end = res.end.bind(res);

    let headersSent = false;
    const setHeaderOnce = () => {
      if (!headersSent) {
        res.setHeader('Content-Encoding', encoding!);
        res.removeHeader('Content-Length');
        headersSent = true;
      }
    };

    encoder.on('data', (chunk) => {
      setHeaderOnce();
      _write(chunk);
    });

    encoder.on('end', () => {
      _end();
    });

    res.write = (chunk: any, ...args: any[]) => {
      encoder!.write(chunk, ...args);
      return true;
    };

    (res as any).end = (chunk?: any, ...args: any[]) => {
      if (chunk) encoder!.end(chunk, ...args);
      else encoder!.end();
    };

    await next();
  };
}
