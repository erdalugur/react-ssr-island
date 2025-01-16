import { GlobalState } from '../hydrator/types';

if (typeof window !== 'undefined') {
  const state: GlobalState = JSON.parse(
    window.document.querySelector('#__PRELOADED_STATE__')?.textContent || '{}'
  );
  /* eslint-disable-next-line no-undef */
  (window as any).__NEXT_DATA__ = state;
  (window as any).process = { env: state.runtimeConfig };
}
