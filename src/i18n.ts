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

import { syncMomentLocale } from './utils/momentLocale';

const languages = ['zh_CN', 'en_US', 'zh_HK', 'ru_RU', 'ja_JP'];

// 缺失 key 时的回退链：繁体优先回退简体；其他语言（ja/ru 等）优先回退英文，最终兜底 zh_CN
const fallbackLng = {
  zh_HK: ['zh_CN'],
  default: ['en_US', 'zh_CN'],
};

function detectBrowserLanguage() {
  const browserLanguages = navigator.languages || [navigator.language];
  for (const browserLanguage of browserLanguages) {
    const lang = _.toLower(browserLanguage);
    if (_.startsWith(lang, 'zh')) {
      return _.includes(['zh-tw', 'zh-hk', 'zh-mo'], lang) ? 'zh_HK' : 'zh_CN';
    }
    if (_.startsWith(lang, 'ja')) return 'ja_JP';
    if (_.startsWith(lang, 'ru')) return 'ru_RU';
    if (_.startsWith(lang, 'en')) return 'en_US';
  }
  return 'en_US';
}

const localStorageLanguage = localStorage.getItem('language');
let language = detectBrowserLanguage();
if (localStorageLanguage && _.includes(languages, localStorageLanguage)) {
  language = localStorageLanguage;
}
// 开发环境仅加载单一语言（见 plugins/vite-plugin-dev-locale），此处需与之对齐，
// 否则运行时语言与已加载语言不一致会显示成翻译 key。可用 VITE_DEV_LOCALE 指定，默认 zh_CN。
if (import.meta.env.DEV) {
  const devLocale = import.meta.env.VITE_DEV_LOCALE as string | undefined;
  language = devLocale && _.includes(languages, devLocale) ? devLocale : 'zh_CN';
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
  fallbackLng,
  resources: getI18nextTranslations(),
  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

syncMomentLocale(language);
i18n.on('languageChanged', syncMomentLocale);

export { i18nInit };
