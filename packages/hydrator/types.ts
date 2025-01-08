export type HydrationType = 'lazyinview' | 'domcontentloaded' | 'click' | 'static';

export const hydrationTypes = {
  static: 'static' as const,
  lazinview: 'lazyinview' as const,
  domcontentloaded: 'domcontentloaded' as const,
  click: 'click' as const
};

export type HydrationConfig = {
  name: string;
  hydrationType: HydrationType;
  dependsOn?: string[];
};

export interface GlobalState {
  page: string;
  chunk: string;
}

export type HydrationInput = string | HydrationConfig;
