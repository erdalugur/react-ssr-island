import { EventEmitter } from 'events';

export const BUNDLE_UPDATED = 'bundleUpdated';

class WatchPack extends EventEmitter {
  emitBundleUpdated(isServer: boolean, files: string[] = []) {
    this.emit(BUNDLE_UPDATED, { isServer, files });
  }

  onBundleUpdated(cb: (isServer: boolean, files: string[]) => void) {
    this.on(BUNDLE_UPDATED, ({ isServer, files }) => cb(isServer, files));
  }
}

const watchpack = new WatchPack();
export default watchpack;
