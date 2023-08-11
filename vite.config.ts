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
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { md } from './plugins/md';
import plusResolve from './plugins/plusResolve';
const reactSvgPlugin = require('./plugins/svg');

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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [md(), reactRefresh(), plusResolve(), reactSvgPlugin({ defaultExport: 'component' })],
  define: {},
  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src',
      },
    ],
  },
  server: {
    proxy: {
      '/api/n9e-plus': {
        target: 'http://10.206.16.17:17001/',
        changeOrigin: true,
      },
      '/api/n9e/proxy': {
        target: 'http://10.206.16.17:17001/',
        changeOrigin: true,
      },
      '/api/n9e/datasource': {
        target: 'http://10.206.16.17:17001/',
        changeOrigin: true,
      },
      '/api/n9e': {
        target: 'http://10.206.16.17:17001/',
        changeOrigin: true,
      },
      '/api/fc-brain': {
        target: 'http://10.206.16.17:28000/',
        changeOrigin: true,
      },
    },
  },
  build: {
    commonjsOptions: {
      ignoreTryCatch: false, // https://github.com/wbkd/react-flow/issues/1840
    },
    target: 'chrome58',
    outDir: 'pub',
    chunkSizeWarningLimit: 650,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: chunk1,
          vendor1: chunk2,
          vendor2: chunk3,
          antdChunk: antdChunk,
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
          'font-family': 'Monda-Regular,PingFangSC-Regular,microsoft yahei ui,microsoft yahei,simsun,"sans-serif"',
          'text-color': '#262626',
          'table-row-hover-bg': '#EAE8F2',
          'table-header-bg': '#f0f0f0',
          'select-selection-item-bg': '#EAE6F3',
          'select-selection-item-border-color': '#6C53B1',
          'menu-item-color': '#8C8C8C',
          'menu-inline-submenu-bg': '#f0f0f0',
          'menu-bg': '#f0f0f0',
          'checkbox-check-bg': '#fff',
          'checkbox-check-color': '#6C53B1',
          'checkbox-color': 'fade(@checkbox-check-color, 10)',
          'btn-padding-horizontal-base': '12px',
        },
      },
    },
  },
});
