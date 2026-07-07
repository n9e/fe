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
import React from 'react';
import ReactDOM from 'react-dom';
import { i18nInit } from './i18n'; // loaded and initialized first
import App from './App';
import { I18nextProvider } from 'react-i18next';
import { initTheme } from './utils/darkMode';
import { initFlashcatFrom } from './utils/flashcatFrom';

// 在页面渲染前初始化主题，避免样式闪烁
initTheme();

// 指向官网/Flashduty 的链接统一携带 from=n9e-user 渠道参数
initFlashcatFrom();

ReactDOM.render(
  <I18nextProvider i18n={i18nInit}>
    <App />
  </I18nextProvider>,
  document.getElementById('root'),
);
