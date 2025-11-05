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
import _ from 'lodash';
import { withTolgee, Tolgee, I18nextPlugin, DevTools } from '@tolgee/i18next';
import { InContextTools } from '@tolgee/web/tools';

const languages = ['zh_CN', 'en_US', 'zh_HK', 'ru_RU', 'ja_JP'];
const localStorageLanguage = localStorage.getItem('language');
let language = 'zh_CN';
if (localStorageLanguage && _.includes(languages, localStorageLanguage)) {
  language = localStorageLanguage;
}

function getTranslations() {
  const translations: any = import.meta.glob('../src/**/{locale,locales}/index.(ts|js)', { eager: true });
  const result = {};

  for (const path in translations) {
    const module = translations[path]?.default;
    for (const namespace in module) {
      for (const lang in module[namespace]) {
        result[`${lang}:${namespace}`] = module[namespace][lang];
      }
    }
  }
  return result;
}

function getI18nextTranslations() {
  const translations: any = import.meta.glob('../src/**/{locale,locales}/index.(ts|js)', { eager: true });
  const result = {};

  languages.forEach((lang) => {
    result[lang] = {};
  });

  for (const path in translations) {
    const module = translations[path]?.default;

    for (const namespace in module) {
      languages.forEach((lang) => {
        if (!!result[lang][namespace]) {
          result[lang][namespace] = {
            ...result[lang][namespace],
            ...module[namespace][lang],
          };
        } else {
          result[lang][namespace] = module[namespace][lang];
        }
      });
    }
  }
  return result;
}

const API_URL = import.meta.env.VITE_TOLGEE_API_URL;
const API_KEY = import.meta.env.VITE_TOLGEE_API_KEY;
const staticData = getTranslations();

let tolgee, i18nInit;
if (!!API_URL && !!API_KEY) {
  if (!!import.meta.env.DEV) {
    tolgee = Tolgee()
      .use(DevTools())
      .use(I18nextPlugin())
      .init({
        apiUrl: API_URL,
        apiKey: API_KEY,
        language,
        staticData,
        defaultNs: 'translation',
        ns: ['translation', 'common', 'datasource'],
      });
  } else {
    tolgee = Tolgee()
      .use(InContextTools())
      .use(I18nextPlugin())
      .init({
        apiUrl: API_URL,
        apiKey: API_KEY,
        language,
        staticData,
        defaultNs: 'translation',
        ns: ['translation', 'common', 'datasource'],
      });
  }

  i18nInit = withTolgee(i18n, tolgee).use(initReactI18next);
  i18nInit.init({
    lng: language,
    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });
} else {
  i18nInit = i18n.use(initReactI18next);
  i18nInit.init({
    lng: language,
    resources: getI18nextTranslations(),
    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });
}

export { i18nInit, tolgee };
