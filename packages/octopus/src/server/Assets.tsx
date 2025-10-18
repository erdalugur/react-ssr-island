import React, { JSX } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import { OctopusConfig } from '../config';

type ConstructorArgs = {
  config: OctopusConfig;
};

export default class Assets {
  private config: OctopusConfig;
  private assetPrefix: string;
  private cssCache = new Map<string, string>();
  private linkCache = new Map<string, JSX.Element>();
  private scriptCache = new Map<string, JSX.Element>();

  constructor({ config }: ConstructorArgs) {
    this.config = config;
    this.assetPrefix = config.assetPrefix || '';
  }

  private loadCss = async (filePath: string) => {
    if (this.cssCache.has(filePath)) return this.cssCache.get(filePath)!;
    try {
      const absPath = path.join(this.config.outdir! as string, filePath);
      const style = await fs.readFile(absPath, 'utf-8');
      this.cssCache.set(filePath, style);
      return style;
    } catch (err) {
      console.error(`[Assets] Failed to read CSS: ${filePath}`, err);
      return '';
    }
  };

  getScriptTags = (scripts: string[]) => {
    return scripts.map((s) => {
      if (!this.scriptCache.has(s)) {
        this.scriptCache.set(s, <script key={s} defer src={`${this.assetPrefix}${s}`} />);
      }
      return this.scriptCache.get(s)!;
    });
  }

   getStyleTags = async (cssFiles: string[]) => {
    const { inlineCss } = this.config;

    if (!inlineCss) {
      return cssFiles.map((file) => {
        if (!this.linkCache.has(file)) {
          this.linkCache.set(
            file,
            <link key={file} rel="stylesheet" href={`${this.assetPrefix}${file}`} />
          );
        }
        return this.linkCache.get(file)!;
      });
    }

    const styles = await Promise.all(
      cssFiles.map(async (file, i) => {
        const style = await this.loadCss(file);
        return <style key={i} dangerouslySetInnerHTML={{ __html: style }} />;
      })
    );

    return styles;
  }
}
