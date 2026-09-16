import _ from 'lodash';

import { defaultColumnsConfigs } from './constants';
import resources from './locale';

// 「显示列」下拉的选项只从 defaultColumnsConfigs 生成，users.tsx 又按可见列名过滤列定义，
// 所以列名漏配在这里，该列既不会出现在表格里、也没法被勾选出来（「最后活跃时间」列就是这么丢的）。
const columnNames = _.map(defaultColumnsConfigs, 'name');

// 语言包里没有对应文案时 i18next 会把 key 原样吐到表头上，所以每个语言都要覆盖到。
const locales: Record<string, { user: Record<string, string> }> = resources.user;

describe('defaultColumnsConfigs', () => {
  it('lists the account source column so it can be rendered and toggled', () => {
    expect(columnNames).toContain('belong');
  });

  it('has no duplicate column names', () => {
    expect(columnNames).toEqual(_.uniq(columnNames));
  });

  it('translates every user-namespaced column title in all locales', () => {
    const userKeys = _.compact(_.map(defaultColumnsConfigs, (config) => (_.startsWith(config.i18nKey, 'user.') ? config.i18nKey.slice('user.'.length) : undefined)));
    _.forEach(locales, (locale, lang) => {
      _.forEach(userKeys, (key) => {
        expect([lang, key, locale.user[key]]).toEqual([lang, key, expect.any(String)]);
      });
    });
  });
});

describe('account source placeholder', () => {
  it('is translated in all locales so local accounts never render blank', () => {
    _.forEach(locales, (locale, lang) => {
      expect([lang, locale.user.belong_local]).toEqual([lang, expect.any(String)]);
    });
  });
});

// 禁用/启用行操作的文案同样只走 user 命名空间，缺翻译时按钮上会直接显示 key。
describe('user status actions', () => {
  it('translates the disable/enable labels and confirmations in all locales', () => {
    _.forEach(['status_normal', 'status_disabled', 'disable_action', 'enable_action', 'disable_confirm', 'enable_confirm', 'disable_success', 'enable_success'], (key) => {
      _.forEach(locales, (locale, lang) => {
        expect([lang, key, locale.user[key]]).toEqual([lang, key, expect.any(String)]);
      });
    });
  });

  it('keeps the username placeholder in the confirmation text', () => {
    _.forEach(locales, (locale, lang) => {
      expect([lang, _.includes(locale.user.disable_confirm, '{{username}}')]).toEqual([lang, true]);
      expect([lang, _.includes(locale.user.enable_confirm, '{{username}}')]).toEqual([lang, true]);
    });
  });
});
