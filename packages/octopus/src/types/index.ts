import { JSX } from 'react';
import { Request, Response } from 'express';

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
  getServerSideProps: GetServerSideProps;
  Meta: (props: any) => JSX.Element;
  Page: (props: any) => JSX.Element;
}
export interface Routes {
  [route: string]: Route;
}

export type GetServerSideProps = ({ req, res }: { req: Request; res: Response }) => Promise<{
  props?: any;
  notFound?: boolean;
  redirect?: {
    destination: string;
    status: number;
  };
}>;
