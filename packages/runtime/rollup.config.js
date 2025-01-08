import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

const config = [
  {
    input: "./src/index.ts", // Giriş dosyası
    output: [
      {
        file: "./dist/index.js", // ESM formatında dosya
        format: "esm",
        sourcemap: true,
      },
      {
        file: "./dist/index.cjs", // CommonJS formatında dosya
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(), // Node modüllerini çözmek için
      commonjs(), // CommonJS desteği
      typescript({ tsconfig: "./tsconfig.json" }), // TypeScript desteği
    ],
  },
  // Tip tanımlamaları (d.ts) için yapılandırma
  {
    input: "./src/index.ts", // Giriş dosyası
    output: {
      file: "./dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];

export default config;
