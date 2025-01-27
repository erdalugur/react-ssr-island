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
  dataLoader: (params: any) => Promise<any>;
  js: string[];
  css: string[];
  params: any;
}

export interface ManifestItem {
  runtime: string;
  css: string[];
  js: string[];
  params: any;
  ssg: boolean;
  destination: string;
}
export interface AppManifest {
  [route: string]: ManifestItem;
}

export interface RenderPage {
  req: Request;
  res: Response;
  route: ManifestItem;
}
