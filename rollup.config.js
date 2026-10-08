import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import clean from '@rollup-extras/plugin-clean';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import { dts } from 'rollup-plugin-dts';

const entries = ['index', 'core', 'react'];

export default [
  ...entries.map((entry) => ({
    input: `./src/${entry}.${entry === 'react' ? 'tsx' : 'ts'}`,
    output: [
      {
        file: `dist/${entry}.cjs.js`,
        format: 'cjs',
        interop: 'compat',
        exports: 'named',
        sourcemap: true,
        inlineDynamicImports: true,
        banner: entry === 'react' ? '"use client";' : undefined,
      },
      ...['esm.js', 'mjs'].map((extension) => ({
        file: `dist/${entry}.${extension}`,
        format: 'esm',
        exports: 'named',
        sourcemap: true,
        inlineDynamicImports: true,
        banner: entry === 'react' ? '"use client";' : undefined,
      })),
    ],
    plugins: [
      ...(entry === 'index' ? [clean('dist')] : []),
      peerDepsExternal(),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),
      typescript({
        tsconfig: './tsconfig.build.json',
      }),
      terser({ compress: { directives: false } }),
      postcss({
        plugins: [autoprefixer],
        modules: {
          namedExport: true,
          //minify classnames
          generateScopedName: '[hash:base64:8]',
        },
        //uncomment the following 2 lines if you want to extract styles into a separated file
        /*extract: 'styles.css',
        inject: false,*/
        minimize: true,
        sourceMap: true,
        extensions: ['.scss', '.css'],
        use: ['sass'],
      }),
    ],
  })),
  ...entries.map((entry) => ({
    input: `dist/${entry}.d.ts`,
    output: [{ file: `dist/${entry}.d.ts`, format: 'es' }],
    plugins: [dts()],
  })),
];
