import WS from 'ws';
import net from 'net';
import { writeFile } from '../utils';
import { OctopusConfig } from '../config';

export default class OctopusWebSocket {
  private wss: WS.Server | null = null;
  private clients: Set<WS> = new Set();
  private port: number;
  private config: OctopusConfig;

  constructor({ config }: { config: OctopusConfig }) {
    this.port = config.wsPort || 8081;
    this.config = config;
    this.initWebSocketServer();
  }

  private initWebSocketServer = async () => {
    this.port = await this.findAvailablePort(this.port);
    this.startWebSocketServer();
  };

  private findAvailablePort = (startPort: number): Promise<number> => {
    return new Promise((resolve) => {
      const tryPort = (port: number) => {
        const server = net.createServer();

        server.once('error', () => tryPort(port + 1));
        server.once('listening', () => server.close(() => resolve(port)));

        server.listen(port);
      };

      tryPort(startPort);
    });
  };

  private startWebSocketServer = () => {
    this.wss = new WS.Server({ port: this.port });
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);

      ws.on('close', () => this.clients.delete(ws));
    });
  };

  reload = () => {
    this.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        client.send(JSON.stringify({ type: 'reload' }));
      }
    });
  };
  attachWebSocketJS = async () => {
    const target = `${this.config.outdir}/static/js/ws.js`;

    const script = `
        const socket = new WebSocket('ws://localhost:${this.port}');
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'reload') {
            console.log('♻️ Changes detected! Reloading the page...');
            location.reload();
          }
        };

        socket.onopen = () => console.log('[HMR] connected.');
        socket.onclose = () => console.log('[HMR] closed.');`;

    await writeFile(target, script);
  };
}
