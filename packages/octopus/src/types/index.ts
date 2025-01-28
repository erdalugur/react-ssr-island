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

export interface Route {
  runtime: string;
  css: string[];
  js: string[];
  ssg: boolean;
  mod: any;
  destination: string;
  params: any;
  revalidate?: number;
  route: string;
  loader: (args: any) => Promise<any>;
  Meta: (props: any) => JSX.Element;
  Page: (props: any) => JSX.Element;
}
export interface Routes {
  [route: string]: Route;
}

export interface RenderPage {
  req: Request;
  res: Response;
  route: Route;
}

export type GetStaticPaths = () => Promise<{
  paths: {
    params: any;
    route?: string;
  }[];
}>;

export type GetStaticProps = ({ params }: any) => Promise<{
  props: any;
}>;

export type GetServerSideProps = ({ req, res }: Context) => Promise<{
  props: any;
}>;
