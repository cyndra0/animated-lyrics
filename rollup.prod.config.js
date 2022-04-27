import { defineConfig } from 'rollup'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from 'rollup-plugin-json'
import babel from '@rollup/plugin-babel'
import alias from '@rollup/plugin-alias'
import path from 'path'
import pkg from './package.json'
import { uglify } from 'rollup-plugin-uglify'

/** UMD bundle name here */
const UMD_BUNDLE_NAME = 'AnimatedLyrics'
const BABEL_RUNTIME_REG = /@babel\/runtime/
const isProd = process.env.BUILD === 'production'
/** should bundle runtime helpers? */
const babelHelpers = false

const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
  ],
  plugins: [],
}
if (babelHelpers) {
  babelConfig.plugins.push(['@babel/plugin-transform-runtime', { helpers: true }])
}

export const createConfig = (extraConfig, extraPlugins) => {
  const plugins = [
    commonjs(),
    typescript({ tsconfig: './tsconfig.build.json' }),
    resolve(),
    json(),
    alias({
      entries: {
        '@/': path.resolve(__dirname),
      },
    }),
  ]
  if (isProd) {
    plugins.push(
      babel({
        extensions: ['.ts', '.js', '.tsx', '.jsx'],
        exclude: ['**/node_modules/**'],
        babelHelpers: babelHelpers ? 'runtime' : 'bundled',
        ...babelConfig,
      })
    )
  }
  return defineConfig({
    input: 'src/index.ts',
    plugins: [...plugins, ...(extraPlugins || [])],
    ...extraConfig,
  })
}

export default [
  // cjs
  createConfig({
    output: {
      file: pkg.main,
      name: UMD_BUNDLE_NAME,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    external: [BABEL_RUNTIME_REG],
  }),
  // umd
  createConfig(
    {
      output: {
        file: pkg.unpkg,
        name: UMD_BUNDLE_NAME,
        format: 'umd',
        sourcemap: false,
        exports: 'default',
      },
      input: 'src/index.umd.ts',
    },
    [uglify()]
  ),
  // esm
  createConfig({
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      exports: 'auto',
    },
    external: [BABEL_RUNTIME_REG],
  }),
]
