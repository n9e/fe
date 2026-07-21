import React, { createContext, useContext, useMemo } from 'react';
import _ from 'lodash';

export interface SectionItem {
  key: string;
  title: string;
  description: string;
  tag: 'default' | 'core' | 'optional' | 'recommended';
  icon?: React.ReactNode;
  helpDoc?: {
    documentPath: string;
  };
}

/**
 * 分区配置表：对象的 key 即分区 key，书写顺序即页面展示顺序（序号由此推导）
 * 调整分区顺序只需改这里的书写顺序，不需要同步任何下标
 */
export type SectionsConfig = Record<string, Omit<SectionItem, 'key'>>;

interface SectionsContextValue {
  /** 当前 Provider 内的有序分区列表（含 key），供侧边导航、滚动同步等使用 */
  sections: SectionItem[];
  getSection: (key: string) => SectionItem | undefined;
  /** 分区序号（从 1 开始），嵌套 Provider 时接着父级继续编号 */
  getSectionNumber: (key: string) => number | undefined;
  /** 含父级 Provider 在内的分区总数 */
  count: number;
}

const SectionsContext = createContext<SectionsContextValue | null>(null);

export function toSectionList(sections: SectionsConfig): SectionItem[] {
  return _.map(_.toPairs(sections), ([key, item]) => ({ ...item, key }));
}

/**
 * 分区配置 Provider。可嵌套：子 Provider（如 plus 侧按 license 动态渲染的分区）的序号接着父级继续编号
 */
export function SectionsProvider({ sections, children }: { sections: SectionsConfig; children?: React.ReactNode }) {
  const parent = useContext(SectionsContext);
  const value = useMemo<SectionsContextValue>(() => {
    const list = toSectionList(sections);
    const offset = parent?.count ?? 0;
    const numberMap = _.reduce(
      list,
      (result, item, index) => {
        result[item.key] = offset + index + 1;
        return result;
      },
      {} as Record<string, number>,
    );
    return {
      sections: list,
      getSection: (key) => _.find(list, { key }) ?? parent?.getSection(key),
      getSectionNumber: (key) => numberMap[key] ?? parent?.getSectionNumber(key),
      count: offset + list.length,
    };
  }, [sections, parent]);

  return <SectionsContext.Provider value={value}>{children}</SectionsContext.Provider>;
}

export function useSections(): SectionsContextValue {
  return (
    useContext(SectionsContext) ?? {
      sections: [],
      getSection: () => undefined,
      getSectionNumber: () => undefined,
      count: 0,
    }
  );
}
