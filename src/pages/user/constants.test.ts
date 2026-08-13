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
