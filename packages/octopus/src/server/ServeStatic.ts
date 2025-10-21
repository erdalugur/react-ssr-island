import { promises as fs } from 'fs';
import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/octet-stream'
};

export default class ServeStatic {
  constructor(
    private options: {
      publicDir: string;
    }
  ) {}
  serve = async (
    req: IncomingMessage,
    res: ServerResponse,
    next?: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  ) => {
    const url = req.url || '/';
    const filePath =
      process.cwd() + path.resolve(this.options.publicDir, decodeURIComponent(url.split('?')[0]));

    try {
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        await fs.access(indexPath);
        const file = await fs.readFile(indexPath);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(file);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      const data = await fs.readFile(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', mime);
      res.end(data);
      return;
    } catch {
      next?.(req, res);
    }
  };
}
