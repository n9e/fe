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

const languages = ['zh_CN', 'en_US', 'zh_HK', 'ru_RU', 'ja_JP'];
const localStorageLanguage = localStorage.getItem('language');
let language = 'zh_CN';
if (localStorageLanguage && _.includes(languages, localStorageLanguage)) {
  language = localStorageLanguage;
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

const i18nInit = i18n.use(initReactI18next);
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

export { i18nInit };
