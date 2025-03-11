import { renderToString } from 'react-dom/server';
import React from 'react';
import path from 'path';
import fs from 'fs';
import { RenderPage } from '../types';
import { OctopusConfig } from '../config';
import Routing from './Routing';
export default class Renderer {
  private routing: Routing;
  private styles: Record<string, string> = {};
  private config: OctopusConfig;
  private assetPrefix: string;

  constructor({ routing, config }: { routing: Routing; config: OctopusConfig }) {
    this.routing = routing;
    this.config = config;
    this.assetPrefix = config.assetPrefix || '';
  }

  getScripts = (scripts: string[]) => {
    return (
      <>
        {scripts.map((s: string) => (
          <script key={s} defer src={`${this.assetPrefix}${s}`} />
        ))}
      </>
    );
  };

  getStyles = (css: string[]) => {
    const { outdir, inlineCss } = this.config;
    if (!inlineCss)
      return (
        <>
          {css.map((s: string, i) => (
            <link key={i} rel="stylesheet" href={`${this.assetPrefix}${s}`} />
          ))}
        </>
      );
    return (
      <>
        {css.map((s, i) => {
          if (!this.styles[s]) {
            const p = path.join(outdir as string, `${s}`);
            const style = fs.readFileSync(p, { encoding: 'utf-8' });
            this.styles[s] = style;
          }
          return <style key={i} dangerouslySetInnerHTML={{ __html: this.styles[s] }} />;
        })}
      </>
    );
  };

  renderToHTML = async ({ req, res, route }: RenderPage) => {
    const Document = this.routing.getRoute('/_document').Page;
    const { Page, Meta, loader, css, js, params } = route;
    const pageProps = await loader({ req, res, params });
    const html =  renderToString(
      <Document
        main={() => <Page {...pageProps.props} />}
        scripts={() => this.getScripts(js)}
        meta={() => <Meta {...pageProps.props} />}
        styles={() => this.getStyles(css)}
        pageProps={{
          ...pageProps,
          runtimeConfig: this.config.publicRuntimeConfig
        }}
      />
    );
    return `<!DOCTYPE html> ${html}`;
  };
}
