import React, { Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { hydrationTypes } from '../hoc/types';

function whenVisible(element: Element, hydrateCallback: () => void) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      hydrateCallback();
      observer.unobserve(element)
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
    'octopus-island'
  ) as NodeListOf<HTMLElement>
): Promise<void> {
  return new Promise(async (resolve) => {
    for (let index = 0; index < nodes.length; index++) {
      const container = nodes[index];
      const name = container.getAttribute('component');
      const hydrationType = container.getAttribute('hydration');
      const props = JSON.parse(container.getAttribute('props') || '{}');

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
      whenVisible(container, () => {
        lazyHydrate(container, Component, props);
      });
    }
    return resolve();
  });
}
