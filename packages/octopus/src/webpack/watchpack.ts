import { EventEmitter } from 'events';

export const BUNDLE_UPDATED = 'bundleUpdated';

class WatchPack extends EventEmitter {
  emitBundleUpdated(isServer: boolean) {
    this.emit(BUNDLE_UPDATED, { isServer });
  }

  onBundleUpdated(cb: (isServer: boolean) => void) {
    this.on(BUNDLE_UPDATED, ({ isServer }) => cb(isServer));
  }
}

const watchpack = new WatchPack();
export default watchpack;
