import { JSX } from 'react';
import { Request, Response } from 'express';

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