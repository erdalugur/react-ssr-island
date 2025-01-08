import React from 'react';

interface CacheMapProps {
  component: JSX.Element;
  timestamp: number;
}

const componentCache = new Map<string, CacheMapProps>();

const createHash = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString();
};

function renderWithCache<T extends object>(
  Component: React.ComponentType<T>,
  props: T,
  ttl?: number
): JSX.Element {
  const hash = createHash(JSON.stringify(props));

  if (componentCache.has(hash)) {
    const cached = componentCache.get(hash)!;
    if (!ttl) return cached.component;

    if (Date.now() - cached.timestamp < ttl) {
      /* eslint-disable-next-line no-undef */
      /* eslint-disable-next-line no-console */
      console.log('Cache hit');
      return cached.component;
    }
    componentCache.delete(hash);
  }
  /* eslint-disable-next-line no-undef */
  /* eslint-disable-next-line no-console */
  console.log('Cache miss');
  const component = <Component {...props} />;

  // Cache'e kaydet
  componentCache.set(hash, { component, timestamp: Date.now() });

  return component;
}

export function withCache<T extends object>(Component: React.ComponentType<T>) {
  return (props: T & { ttl?: number }) => {
    return renderWithCache(Component, props, props.ttl);
  };
}

export default withCache;
