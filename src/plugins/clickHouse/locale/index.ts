import i18next from 'i18next';
import { NAME_SPACE } from '../constants';
import en_US from './en_US';
import zh_CN from './zh_CN';
import zh_HK from './zh_HK';
import ja_JP from "./ja_JP";

i18next.addResourceBundle('en_US', NAME_SPACE, en_US);
i18next.addResourceBundle('zh_CN', NAME_SPACE, zh_CN);
i18next.addResourceBundle('zh_HK', NAME_SPACE, zh_HK);
i18next.addResourceBundle('ja_JP', NAME_SPACE, ja_JP);
