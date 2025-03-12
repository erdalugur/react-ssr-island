import Routing from './Routing';
import logger from '../logger';
import { OctopusConfig } from '../config';
import OctopusWebSocket from './OctopusWebSocket';
import cli from '../cli';
import watchpack from '../webpack/watchpack';
export default class OctopusHMR {
  private routing: Routing;
  private wss: OctopusWebSocket;

  constructor({ routing, config }: { routing: Routing; config: OctopusConfig }) {
    this.routing = routing;
    this.wss = new OctopusWebSocket({ config });
  }

  start = async () => {
    await cli.dev();
    this.wss.attachWebSocketJS();

    watchpack.onBundleUpdated((isServer, files) => {
      logger.log(`🔄 Refreshing ${isServer ? 'server' : 'client'} side bundle...`);
      logger.time('⏳ Refresh time');

      this.routing.refreshRoutes(isServer, files).finally(() => {
        logger.timeEnd('⏳ Refresh time');
        logger.log(`✅ ${isServer ? 'Server' : 'Client'} side bundle updated successfully!`);
        this.wss.reload();
      });
    });
  };
}
