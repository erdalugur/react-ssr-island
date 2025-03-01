import React, { Suspense, JSX } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { hydrationTypes } from '../hoc/types';

export function whenVisible(container: Element, Component: () => JSX.Element, props: any) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      render(container, Component, props);
      observer.unobserve(container);
    }
  });
  observer.observe(container);
}

export function render(container: Element, Component: () => JSX.Element, props: any) {
  return hydrateRoot(
    container,
    <Suspense fallback={<div />}>
      <Component {...props} />
    </Suspense>
  );
}

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
        render(container, Component, props);
        continue;
      }
      whenVisible(container, Component, props);
    }
    return resolve();
  });
}
