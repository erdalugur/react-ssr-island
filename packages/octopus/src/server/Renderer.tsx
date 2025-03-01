import { renderToString } from 'react-dom/server';
import React from 'react';
import path from 'path';
import fs from 'fs';
import { Routes, RenderPage } from '../types';
import { OctopusConfig } from '../config';

export default class Renderer {
  private routes: Routes;
  private styles: Record<string, string> = {};
  private octopusConfig: OctopusConfig;
  private assetPrefix: string;

  constructor({ routes, config }: { routes: Routes; config: OctopusConfig }) {
    this.routes = routes;
    this.octopusConfig = config;
    this.assetPrefix = config.assetPrefix || '';
  }
  
  getScripts = (scripts: string[]) => {
    const { publicRuntimeConfig } = this.octopusConfig;
    return (
      <>
        {scripts.map((s: string) => (
          <script key={s} defer src={`${this.assetPrefix}${s}`} />
        ))}
        <script
          id="__PRELOADED_STATE__"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              runtimeConfig: publicRuntimeConfig
            })
          }}
        />
      </>
    );
  };

  getStyles = (css: string[]) => {
    const { outdir, inlineCss } = this.octopusConfig;

    if (!inlineCss)
      return css.map((s: string) => (
        <link key={s} rel="stylesheet" href={`${this.assetPrefix}${s}`} />
      ));

    return css.map((s) => {
      if (!this.styles[s]) {
        const p = path.join(outdir as string, `${s}`);
        const style = fs.readFileSync(p, { encoding: 'utf-8' });
        this.styles[s] = style;
      }
      return <style key={s} dangerouslySetInnerHTML={{ __html: this.styles[s] }} />;
    });
  };

  renderToHTML = async ({ req, res, route }: RenderPage) => {
    const Document = this.routes['/_document'].Page;

    const { Page, Meta, loader, css, js, params } = route;

    const pageProps = await loader({ req, res, params });

    return renderToString(
      <Document
        main={() => <Page {...pageProps.props} />}
        scripts={() => this.getScripts(js)}
        meta={() => <Meta {...pageProps.props} />}
        styles={() => this.getStyles(css)}
        pageProps={{
          ...pageProps,
          runtimeConfig: this.octopusConfig.publicRuntimeConfig
        }}
      />
    );
  };
}
