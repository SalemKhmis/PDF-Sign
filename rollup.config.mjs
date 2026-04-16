import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import babel from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ postcss: true }),
      compilerOptions: {
        dev: !production,
      },
    }),

    css({ output: 'bundle.css' }),

    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),

    commonjs({
      include: ['node_modules/**'],
      transformMixedEsModules: true,
    }),

    babel({
      presets: ['@babel/preset-env'],
      extensions: ['.js', '.mjs', '.html', '.svelte'],
      babelHelpers: 'bundled',
      include: ['src/**', 'node_modules/pdfjs-dist/**'],
    }),

    !production && livereload('public'),
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
