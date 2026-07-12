import _ from 'lodash';

import dorisEnUS from '../../doris/locale/en_US';
import dorisJaJP from '../../doris/locale/ja_JP';
import dorisRuRU from '../../doris/locale/ru_RU';
import dorisZhCN from '../../doris/locale/zh_CN';
import dorisZhHK from '../../doris/locale/zh_HK';

import en_US from './en_US';
import ja_JP from './ja_JP';
import ru_RU from './ru_RU';
import zh_CN from './zh_CN';
import zh_HK from './zh_HK';

const explorerCopy = {
  en_US: { builder: { filters: { json_path: 'JSON path', json_path_placeholder: 'Enter a child-field path' } } },
  ja_JP: { builder: { filters: { json_path: 'JSON パス', json_path_placeholder: '子フィールドのパスを入力' } } },
  ru_RU: { builder: { filters: { json_path: 'Путь JSON', json_path_placeholder: 'Введите путь дочернего поля' } } },
  zh_CN: { builder: { filters: { json_path: 'JSON 路径', json_path_placeholder: '输入子字段路径' } } },
  zh_HK: { builder: { filters: { json_path: 'JSON 路徑', json_path_placeholder: '輸入子字段路徑' } } },
};

const resources = {
  'n9e-ck': {
    en_US: _.merge({}, dorisEnUS, en_US, explorerCopy.en_US),
    ja_JP: _.merge({}, dorisJaJP, ja_JP, explorerCopy.ja_JP),
    ru_RU: _.merge({}, dorisRuRU, ru_RU, explorerCopy.ru_RU),
    zh_CN: _.merge({}, dorisZhCN, zh_CN, explorerCopy.zh_CN),
    zh_HK: _.merge({}, dorisZhHK, zh_HK, explorerCopy.zh_HK),
  },
};

export default resources;
