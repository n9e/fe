import moment from 'moment';
import 'moment/dist/locale/zh-hk';
import 'moment/dist/locale/ja';
import 'moment/dist/locale/ru';

// TimeRangePicker 长期使用的自定义 zh-cn 配置（未加载 moment 内置 zh-cn，保持原有展示行为）
export const momentLocaleZhCN = {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
  weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
  relativeTime: {
    future: '%s 内',
    past: '%s 前',
    s: '几秒',
    m: '1 分',
    mm: '%d 分',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    M: '1 个月',
    MM: '%d 个月',
    y: '1 年',
    yy: '%d 年',
  },
};

// moment.locale(name, config) 注册的同时会激活该 locale，实际生效语言以 syncMomentLocale 为准
moment.locale('zh-cn', momentLocaleZhCN);

const momentLocaleMap: { [key: string]: string } = {
  zh_CN: 'zh-cn',
  zh_HK: 'zh-hk',
  en_US: 'en',
  ja_JP: 'ja',
  ru_RU: 'ru',
};

export const syncMomentLocale = (language: string) => {
  moment.locale(momentLocaleMap[language] || 'en');
};
