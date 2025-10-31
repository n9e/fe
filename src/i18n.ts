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
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ICU from 'i18next-icu';
import _ from 'lodash';
import { withTolgee, Tolgee, I18nextPlugin, DevTools } from '@tolgee/i18next';
import { InContextTools, ContextUi } from '@tolgee/web/tools';

const urlParams = new URLSearchParams(window.location.search);
const enableTolgeeEdit = urlParams.get('tolgee') === 'edit';

console.log('Tolgee edit mode:', enableTolgeeEdit, window.location);

// const languages = ['zh_CN', 'en_US', 'zh_HK', 'ru_RU', 'ja_JP'];
const languages = ['zh_CN', 'en_US', 'zh_HK'];
const localStorageLanguage = localStorage.getItem('language');
let language = 'zh_CN';
if (localStorageLanguage && _.includes(languages, localStorageLanguage)) {
  language = localStorageLanguage;
}

function getTolgeeTranslations() {
  const translations: any = import.meta.glob('../**/{locale,locales}/index.(ts|js)', { eager: true });
  const result = {};

  for (const path in translations) {
    const module = translations[path]?.default;
    for (const key in module?.languages) {
      result[`${key}:${module?.namespace}`] = module?.languages[key];
    }
  }
  console.log('result', result);
  return result;
}

function getI18nextTranslations() {
  const translations: any = import.meta.glob('../**/{locale,locales}/index.(ts|js)', { eager: true });
  const result = { en_US: {}, zh_CN: {}, zh_HK: {} };

  for (const path in translations) {
    const module = translations[path]?.default;
    languages?.forEach((language) => {
      result[language][module?.namespace] = module?.languages[language];
    });
  }
  // console.log('getI18nextTranslations', result);
  return result;
}

const API_URL = import.meta.env.VITE_TOLGEE_API_URL;
const API_KEY = import.meta.env.VITE_TOLGEE_API_KEY;
const staticData = getTolgeeTranslations();

// console.log('API_URL', API_URL);
// console.log('API_KEY', API_KEY);

let tolgee;

if (!!API_URL && !!API_KEY) {
  tolgee = Tolgee()
    .use(InContextTools()) // 可以在页面直接改翻译
    // .use(DevTools())
    .use(I18nextPlugin()) // 兼容 react-i18next
    .init({
      // for development
      apiUrl: API_URL,
      apiKey: API_KEY,
      // defaultLanguage: 'zh_CN',
      language,
      staticData,
      defaultNs: 'translation',
      ns: ['translation', 'common', 'datasource'],
    });
} else {
  tolgee = Tolgee()
    .use(I18nextPlugin())
    .init({
      staticData,
      defaultNs: 'translation',
      ns: ['translation', 'common', 'datasource'],
    });
}

const i18nInit = withTolgee(i18n, tolgee).use(ICU).use(initReactI18next);

i18nInit.init({
  lng: language,
  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

export { i18nInit, tolgee };
