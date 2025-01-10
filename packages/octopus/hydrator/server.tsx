import React, { ComponentType } from 'react';
import { HydrationConfig, HydrationInput } from './types';

export function withHydrator<T extends object>(Component: ComponentType<T>, input: HydrationInput) {
  const getConfig = (input: HydrationInput): HydrationConfig => {
    if (typeof input === 'string') {
      return { name: input, hydrationType: 'lazyinview' };
    }
    return input;
  };

  const config = getConfig(input);
  return function HydratedComponent(props: T) {
    return (
      <section data-island={JSON.stringify({ ...config, props })}>
        <Component {...props} />
      </section>
    );
  };
}
export default withHydrator;
