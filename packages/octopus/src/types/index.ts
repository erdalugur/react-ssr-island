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

export interface RouteProps {
  Component: <T>(props: T) => JSX.Element;
  Meta: <T>(props: T) => JSX.Element;
  getServerSideProps: (ctx: Context) => any;
  assets: { js: string[]; css: string[] };
}

export interface ServerPagesManifest {
  [route: string]: {
    runtime: string
    css: string[]
  }
}

export interface ClientPagesManifest {
  [route: string]: {
    js: string[]
  }
}

export interface RenderPage {
  req: Request;
  res: Response;
  route: string;
}