import React, { Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydrationConfig, hydrationTypes } from '../hoc/types';

function withObserver(element: Element, hydrateCallback: (unobserve: () => void) => void) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      hydrateCallback(() => observer.unobserve(element));
    }
  });
  observer.observe(element);
}

const lazyHydrate = (container: Element, Component: any, props: any) => {
  return hydrateRoot(
    container,
    <Suspense fallback={<div />}>
      <Component {...props} />
    </Suspense>
  );
};

export default async function hydrate(
  componentMap: any,
  nodes: NodeListOf<HTMLElement> = window.document.querySelectorAll(
    '[data-island]'
  ) as NodeListOf<HTMLElement>
): Promise<void> {
  return new Promise(async (resolve) => {
    /* eslint-disable-next-line no-undef */
    const start = performance.now();
    for (let index = 0; index < nodes.length; index++) {
      const container = nodes[index];
      const m = container.dataset.island;
      if (m) {
        const { name, hydrationType, props }: HydrationConfig & { props: any } = JSON.parse(m);
        if (!name || !hydrationType) continue;
        const Component = componentMap[name];
        if (!Component) {
          continue;
        }
        if (hydrationType === hydrationTypes.static) {
          continue;
        }

        if (hydrationType === hydrationTypes.domcontentloaded) {
          lazyHydrate(container, Component, props);
          continue;
        }
        withObserver(container, (unobserve) => {
          lazyHydrate(container, Component, props);
          unobserve();
        });
      }
    }
    /* eslint-disable-next-line no-undef */
    const end = performance.now();
    const timeInSeconds = (end - start) / 1000;
    /* eslint-disable-next-line no-console */
    console.log(`all islands registered in: ${timeInSeconds.toFixed(4)} seconds`);
    return resolve();
  });
}
