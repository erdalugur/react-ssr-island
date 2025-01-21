import { ComponentType, createElement } from 'react';
import { HydrationConfig, HydrationInput } from './types';

const getConfig = (input: HydrationInput): HydrationConfig => {
  if (typeof input === 'string') {
    return { name: input, hydrationType: 'lazyinview' };
  }
  return input;
};

export function withHydrator<T extends object>(Component: ComponentType<T>, input: HydrationInput) {
  const config = getConfig(input);

  return function HydratedComponent(props: T): JSX.Element {

    return createElement(
      'octopus-island',
      {
        component: config.name,
        hydration: config.hydrationType,
        props: JSON.stringify(props)
      },
      createElement(Component, props)
    );
  };
}
export default withHydrator;
