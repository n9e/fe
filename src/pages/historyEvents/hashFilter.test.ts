import { readFileSync } from 'node:fs';
import path from 'node:path';

// hash 筛选是纯 UI 接线，没有可单独调用的纯函数，沿用本仓库既有的源码断言方式守住关键约定
describe('历史告警 hash 筛选', () => {
  const root = path.resolve(__dirname, '../../..');

  it('hash 输入框由 showHashFilter 控制，回车才提交且提交前 trim', () => {
    const source = readFileSync(path.join(root, 'src/pages/historyEvents/ListNG/index.tsx'), 'utf8');

    expect(source).toContain('showHashFilter = false');
    expect(source).toContain('{showHashFilter && (');
    expect(source).toContain("placeholder={t('hash_placeholder')}");
    expect(source).toContain('hash: hashInput.trim() || undefined');
    // 清空时写 undefined，URL 上不会残留空的 hash= 参数
    expect(source).toContain('hash: undefined');
    // 输入过程中不能直接 setFilter，否则半截 hash 会不断触发必然为空的查询
    expect(source).not.toContain('hash: e.target.value');
  });

  it('hash 进入统一的 filterObj，列表与导出共用同一份筛选条件', () => {
    const source = readFileSync(path.join(root, 'src/pages/historyEvents/ListNG/index.tsx'), 'utf8');

    expect(source).toContain('filter.hash ? { hash: filter.hash } : {}');
  });

  it('历史告警页开启该筛选项并与 URL 双向同步', () => {
    const source = readFileSync(path.join(root, 'src/pages/historyEvents/index.tsx'), 'utf8');

    expect(source).toContain('hash: query.hash');
    expect(source).toContain('showHashFilter');
  });

  it('多语言文案齐全', () => {
    const localeDir = path.join(root, 'src/pages/historyEvents/locale');
    const langs = ['zh_CN', 'zh_HK', 'en_US', 'ja_JP', 'ko_KR', 'ru_RU', 'fr_FR', 'es_ES', 'pt_BR', 'id_ID'];

    langs.forEach((lang) => {
      const source = readFileSync(path.join(localeDir, `${lang}.ts`), 'utf8');
      expect(source).toContain('hash_placeholder');
    });
  });
});
