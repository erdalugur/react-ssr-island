import React, { ComponentType, createElement } from 'react';
import { HydrationConfig, HydrationInput } from './types';

export function withHydrator<T extends object>(
  Component: ComponentType<T>,
  input: HydrationInput,
  tag: React.HTMLElementType = "div"
) {
  const getConfig = (input: HydrationInput): HydrationConfig => {
    if (typeof input === 'string') {
      return { name: input, hydrationType: 'lazyinview' };
    }
    return input;
  };

  const config = getConfig(input);
  return function HydratedComponent(props: T): JSX.Element {
    return createElement(tag, {
      "data-island": JSON.stringify({ ...config, props })
    }, createElement(Component, props))
  };
}
export default withHydrator;
