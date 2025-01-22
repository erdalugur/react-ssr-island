import { Request, Response } from 'express';
import { JSX } from 'react';

export interface Context {
  req: Request;
  res: Response;
}

export interface DocumentProps {
  main: () => JSX.Element;
  scripts: () => JSX.Element;
  meta: () => JSX.Element;
  styles: () => JSX.Element[];
  pageProps: any;
}
