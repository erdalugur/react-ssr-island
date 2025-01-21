import React, { createContext, useContext, PropsWithChildren } from 'react';
import { OctopusConfig } from '../config';
import fs from 'fs';
import path from 'path';

interface AppContex {
  Component: any;
  css: string[];
  pageProps: { props: any };
  Meta: () => React.JSX.Element;
  assetPrefix: string;
  scripts: string[];
  octopusConfig: OctopusConfig;
  dev: boolean;
}
const contex = createContext<AppContex>({
  assetPrefix: '',
  Component: '',
  css: [],
  Meta: () => <></>,
  pageProps: { props: {} },
  octopusConfig: {},
  scripts: [],
  dev: true
});

const useAppContex = () => useContext(contex);

export function Provider({ children, value }: PropsWithChildren<{ value: AppContex }>) {
  return <contex.Provider value={value}>{children}</contex.Provider>;
}

export function Main() {
  const { Component, pageProps } = useAppContex();
  return <Component {...pageProps.props} />;
}

export function Scripts() {
  const { scripts, assetPrefix, octopusConfig } = useAppContex();
  return (
    <>
      {scripts.map((s: string) => (
        <script key={s} defer src={`${assetPrefix}${s}`} />
      ))}
      <script
        id="__PRELOADED_STATE__"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            runtimeConfig: octopusConfig.publicRuntimeConfig
          })
        }}
      />
    </>
  );
}

export function Meta() {
  const { Meta: MetaFn, pageProps } = useAppContex();
  return <MetaFn {...pageProps.props} />;
}

const styles: Record<string, string> = {};

export function Styles() {
  const { css, assetPrefix, octopusConfig, dev } = useAppContex();
  if (dev)
    return css.map((s: string) => <link key={s} rel="stylesheet" href={`${assetPrefix}${s}`} />);

  return css.map((s) => {
    if (!styles[s]) {
      const p = path.join(octopusConfig.outdir as string, `${s}`);
      const style = fs.readFileSync(p, { encoding: 'utf-8' });
      styles[s] = style;
    }
    return <style dangerouslySetInnerHTML={{ __html: styles[s] }} />;
  });
}
