import zhCN from 'antd/lib/locale/zh_CN';
import zhHK from 'antd/lib/locale/zh_HK';
import enUS from 'antd/lib/locale/en_US';
import jaJP from 'antd/lib/locale/ja_JP';
import ruRU from 'antd/lib/locale/ru_RU';

const antdLocaleMap = {
  zh_CN: zhCN,
  zh_HK: zhHK,
  en_US: enUS,
  ja_JP: jaJP,
  ru_RU: ruRU,
};

export const getAntdLocale = (language?: string) => antdLocaleMap[language || ''] || zhCN;
