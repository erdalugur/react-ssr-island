import Routing from './Routing';
import { createLogger, JsonLogger } from '../logger';
import { OctopusConfig } from '../config';
import OctopusWebSocket from './OctopusWebSocket';
import cli from '../cli';
import watchpack from '../webpack/watchpack';
export default class OctopusHMR {
  private routing: Routing;
  private wss: OctopusWebSocket;
  private logger!: JsonLogger;
  constructor({
    routing,
    config,
    logger
  }: {
    routing: Routing;
    config: OctopusConfig;
    logger?: JsonLogger;
  }) {
    this.routing = routing;
    this.wss = new OctopusWebSocket({ config });
    this.logger = createLogger(logger, 'OctopusHMR');
  }

  start = async () => {
    await cli.dev();
    this.wss.attachWebSocketJS();

    watchpack.onBundleUpdated((isServer) => {
      this.logger.info(`refreshing ${isServer ? 'server' : 'client'} side bundle...`);
      this.logger.time('refresh time');

      this.routing.refreshRoutes(isServer).finally(() => {
        this.logger.timeEnd('refresh time');
        this.logger.info(`✅ ${isServer ? 'Server' : 'Client'} side bundle updated successfully!`);
        this.wss.reload();
      });
    });
  };
}
