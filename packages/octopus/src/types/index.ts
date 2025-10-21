import { JSX } from 'react';
import { IncomingMessage, ServerResponse } from 'http';

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
  getStaticParams?: GetStaticParams;
  Meta: (props: any) => JSX.Element;
  Page: (props: any) => JSX.Element;
}
export interface Routes {
  [route: string]: Route;
}

export type IncomingError = { context: string; message: string; status: number };

export type GetServerSideProps<T = any> = ({
  req,
  res,
  err,
  params
}: {
  req: HttpRequest;
  res: HttpResponse;
  err?: IncomingError;
  params?: Record<string, any>;
}) => Promise<{
  props?: T;
  notFound?: boolean;
  redirect?: {
    destination: string;
    status: number;
  };
}>;

export type GetStaticParams = () => Promise<any[]>;

export type GetStaticProps<T = any> = ({}: { params: Record<string, number | string> }) => Promise<{
  props: T;
}>;



export interface HttpRequest extends IncomingMessage {
  params: Record<string, any>;
  query?: Record<string, any>;
  body?: any;
}

export interface HttpResponse extends ServerResponse {
  status: (code: number) => HttpResponse;
  json: (body: any) => void;
  send: (body: any) => void;
  statusCode: number;
  redirect: (status: number, url: string) => void;
}
