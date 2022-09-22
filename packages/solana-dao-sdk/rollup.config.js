import pkg from "./package.json";

export default [
  // browser-friendly UMD build
  {
    input: "./out-tsc/src/index.js",
    output: {
      name: "solana-dao-sdk",
      file: pkg.browser,
      format: "umd",
    },
    plugins: [],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: "./out-tsc/src/index.js",
    external: [],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
  },
];
