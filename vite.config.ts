/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { defineConfig, loadEnv } from 'vite';
import { md } from './plugins/md';
import plusResolve from './plugins/plusResolve';
import prefixPlugin from './plugins/vite-plugin-prefix';
import lazyToEagerOnBuild from './plugins/vite-plugin-lazy-eager';
import devSingleLocale from './plugins/vite-plugin-dev-locale';
import getFontFamilyByEnv from './src/utils/getFontFamilyByEnv';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

const chunk2 = [
  '@codemirror/autocomplete',
  '@codemirror/highlight',
  '@codemirror/lint',
  '@codemirror/language',
  '@codemirror/state',
  '@codemirror/view',
  'codemirror-promql',
  '@codemirror/basic-setup',
];
const chunk3 = ['react-ace'];
const chunk1 = ['react', 'react-router-dom', 'react-dom', 'moment', '@ant-design/icons', 'umi-request', 'lodash', 'react-grid-layout', 'd3', 'ahooks', 'color'];
const antdChunk = ['antd'];
const excelChunk = ['file-saver', 'exceljs'];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // 后端接口地址
  // 也可以通过环境变量来设置，创建 `.env` 文件，内容为 `PROXY=http://localhost:8080`
  let proxyURL = env.PROXY || 'http://localhost:8080';
  if (env.VITE_IS_PRO) {
    proxyURL = env.PROXY_PRO;
  } else if (env.VITE_IS_ENT) {
    proxyURL = env.PROXY_ENT;
  }

  const baseName = env.VITE_PREFIX || '';

  return {
    base: baseName + '/',
    plugins: [
      lazyToEagerOnBuild(),
      devSingleLocale(env.VITE_DEV_LOCALE || 'zh_CN'),
      react(),
      svgr({
        svgrOptions: {
          svgoConfig: {
            floatPrecision: 2,
          },
        },
      }),
      md(),
      plusResolve(),
      prefixPlugin(baseName),
    ],
    define: {
      // 'process.env.NODE_ENV': JSON.stringify(mode), // 如确实需要兼容旧代码 NODE_ENV=production , 放开这个
    },
    resolve: {
      alias: [
        {
          find: '@assets',
          replacement: baseName,
        },
        {
          find: '@',
          replacement: '/src',
        },

        // 仅屏蔽postcss导致的浏览器控制台 node模块 警告
        { find: 'url', replacement: path.resolve(__dirname, 'src/empty-module.js') },
        { find: 'fs', replacement: path.resolve(__dirname, 'src/empty-module.js') },
        { find: 'path', replacement: path.resolve(__dirname, 'src/empty-module.js') },
        { find: 'source-map-js', replacement: path.resolve(__dirname, 'src/empty-module.js') },
      ],
    },
    server: {
      hmr: true,
      proxy: {
        '/api': {
          target: proxyURL,
          changeOrigin: true,
        },
      },
    },
    build: {
      commonjsOptions: {
        ignoreTryCatch: false, // https://github.com/wbkd/react-flow/issues/1840
      },
      outDir: 'pub',
      chunkSizeWarningLimit: 650,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: chunk1,
            vendor1: chunk2,
            vendor2: chunk3,
            antdChunk: antdChunk,
            excelChunk,
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "/src/global.variable.less";`,
          javascriptEnabled: true,
          modifyVars: {
            'primary-color': '#6C53B1',
            'primary-background': '#F0ECF9',
            'disabled-color': 'rgba(0, 0, 0, 0.5)',
            'tabs-ink-bar-color': 'linear-gradient(to right, #9F4CFC, #0019F4 )',
            'font-size-base': '12px',
            'menu-item-font-size': '14px',
            'radio-button-checked-bg': '#EAE6F3',
            'form-item-margin-bottom': '18px',
            'font-family': getFontFamilyByEnv(env.VITE_IS_ENT === 'true'),
            'text-color': '#262626',
            // 'table-row-hover-bg': '#EAE8F2',
            // 'table-header-bg': '#f0f0f0',
            'select-selection-item-bg': '#EAE6F3',
            'select-selection-item-border-color': '#6C53B1',
            'menu-item-color': '#8C8C8C',
            'menu-inline-submenu-bg': '#f0f0f0',
            'menu-bg': '#f0f0f0',
            'checkbox-check-bg': '#fff',
            'checkbox-check-color': '#6C53B1',
            'checkbox-color': 'fade(@checkbox-check-color, 10)',
            'btn-padding-horizontal-base': '12px',

            // 2026-05 table design
            'table-bg': 'var(--fc-fill-2)',
            'table-header-bg': 'var(--fc-fill-2-5)',
            'table-header-color': 'var(--fc-text-3)',
            'table-header-sort-bg': 'rgb(var(--fc-fill-5-rgb) / 0.4)',
            // sorted column tints only the HEADER (above); body cells stay normal so the
            // column doesn't look different from the rest (align design-system table spec —
            // body bg only reacts to row hover/selection, never to which column is sorted).
            'table-body-sort-bg': 'transparent',
            'table-row-hover-bg': 'rgb(var(--fc-fill-5-rgb) / 0.2)',
            'table-selected-row-color': 'inherit',
            // Keep Less color functions compile-safe; runtime CSS vars are patched in theme/default.less.
            'table-selected-row-bg': 'rgba(228, 228, 231, 0.15)',
            'table-body-selected-sort-bg': '@table-selected-row-bg',
            'table-selected-row-hover-bg': 'rgba(228, 228, 231, 0.25)',
            'table-expanded-row-bg': 'var(--fc-fill-2-5)',
            'table-border-color': '#e4e4e7',
            'table-padding-vertical': '16px',
            'table-padding-horizontal': '16px',
            'table-padding-vertical-md': '(@table-padding-vertical * 3 / 4)',
            'table-padding-horizontal-md': '(@table-padding-horizontal / 2)',
            'table-padding-vertical-sm': '(@table-padding-vertical / 2)',
            'table-padding-horizontal-sm': '(@table-padding-horizontal / 2)',
            'table-border-radius-base': '@border-radius-base',
            'table-footer-bg': '@table-header-bg',
            'table-footer-color': '@table-header-color',
            'table-header-bg-sm': '@table-header-bg',
            'table-font-size': '12px',
            'table-font-size-md': '14px',
            'table-font-size-sm': '@table-font-size',
            'table-header-cell-split-color': 'var(--fc-border-color)',
            'table-header-sort-active-bg': 'rgb(var(--fc-fill-5-rgb) / 0.4)',
            'table-fixed-header-sort-active-bg': 'var(--fc-fill-3)',
            'border-radius-base': '8px',
            'border-radius-sm': '4px',
            'checkbox-border-radius': '2px',
          },
        },
      },
    },
  };
});
