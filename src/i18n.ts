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
import resources from './locales/resources';

const languages = ['zh_CN', 'en_US', 'zh_HK', 'ru_RU', 'ja_JP'];
const localStorageLanguage = localStorage.getItem('language');
const systemLanguage = (() => {
  // navigator.language return format 'en-US' or 'ru'
  const lang = navigator.language.replace('-', '_');
  if (_.includes(languages, lang)) {
    return lang;
  }

  const langPrefix = lang.split('_')[0] + '_';
  const matchedLang = languages.find(l => l.startsWith(langPrefix));
  return matchedLang || 'zh_CN';
})();

let language = 'zh_CN';
if (localStorageLanguage && _.includes(languages, localStorageLanguage)) {
  language = localStorageLanguage;
}
else if (_.includes(languages, systemLanguage)) {
  language = systemLanguage;
}

i18n.use(initReactI18next).init({
  resources,
  lng: language,
  interpolation: {
    escapeValue: false,
  },
});

export { i18n as i18nInit };
