import i18next from 'i18next';
import { NS } from '../constants';
import en_US from './en_US';
import zh_CN from './zh_CN';
import zh_HK from './zh_HK';
import ja_JP from './ja_JP';

i18next.addResourceBundle('en_US', NS, en_US);
i18next.addResourceBundle('zh_CN', NS, zh_CN);
i18next.addResourceBundle('zh_HK', NS, zh_HK);
i18next.addResourceBundle('ja_JP', NS, ja_JP);
