import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { Alert } from 'antd';
import { useTranslation, Trans } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import { getDefaultDatasourceValue } from '@/utils';
import PageLayout from '@/components/pageLayout';

import { DEFAULT_DATASOURCE_CATE, ENABLED_VIEW_CATES, NAME_SPACE } from './constants';
import { getLocalItems, setLocalItems } from './utils/getLocalItems';
import { getLocalActiveKey } from './utils/getLocalActiveKey';
import getDefaultDatasourceCate from './utils/getDefaultDatasourceCate';
import { isLogExplorerDatasourceCateSupported } from './utils/datasourceAvailability';
import Header from './Header';
import Explorer from './Explorer';

interface TabItem {
  key: string;
  isInited?: boolean;
  formValues?: any;
  /** 新增页签标记（仅运行时存在，不持久化）：激活时跳过自动查询 */
  isNewTab?: boolean;
}

/** P2 方案A：LRU 保活容量（最近 N 个页签保活挂载，其余卸载） */
const LRU_CAPACITY = 5;

/**
 * 单个页签的 Explorer 容器。
 * P2-1: defaultFormValuesControl 的回调用 useCallback 按 tabKey 稳定引用，
 * 避免每次父组件重渲都重建闭包；持久化走父级共享的防抖写入器（读最新 items），
 * 且仅在 formValues 真正变化时触发。
 */
function TabExplorer({
  item,
  itemIndex,
  active,
  setItems,
  persistItems,
}: {
  item: TabItem;
  itemIndex: number;
  active: boolean;
  setItems: React.Dispatch<React.SetStateAction<TabItem[]>>;
  /** 触发一次防抖持久化（写入的是最新 items） */
  persistItems: () => void;
}) {
  const setIsInited = useCallback(() => {
    setItems((prev) =>
      _.map(prev, (i) =>
        i.key === item.key
          ? {
              ...i,
              isInited: true,
              // 首次恢复（新增页签首次激活）后清除 isNewTab：
              // 新增页签首次激活仍跳过自动查询（恢复 effect 此时读到 isNewTab=true），
              // 之后被 LRU 换出再切回时 isNewTab=false → 正常自动查询，避免“切换标签不自动查询”。
              isNewTab: false,
            }
          : i,
      ),
    );
  }, [setItems, item.key]);

  const setDefaultFormValues = useCallback(
    (newValues: any) => {
      setItems((prev) => {
        const newItems = _.map(prev, (i) => (i.key === item.key ? { ...i, isInited: true, formValues: newValues } : i));
        // 仅在 formValues 真正变化时写 localStorage，避免每次 setItems 都全量序列化
        const prevItem = _.find(prev, { key: item.key });
        if (!_.isEqual(prevItem?.formValues, newValues)) {
          persistItems();
        }
        return newItems;
      });
    },
    [setItems, item.key, persistItems],
  );

  // P2 方案A：页签切走时由 Explorer 调用，快照当前表单值（含未执行的修改）
  const handleSnapshot = useCallback(
    (formValues: any) => {
      setItems((prev) => {
        const prevItem = _.find(prev, { key: item.key });
        if (_.isEqual(prevItem?.formValues, formValues)) {
          return prev;
        }
        const newItems = _.map(prev, (i) => (i.key === item.key ? { ...i, formValues } : i));
        persistItems();
        return newItems;
      });
    },
    [setItems, item.key, persistItems],
  );

  return (
    <Explorer
      active={active}
      tabKey={item.key}
      tabIndex={itemIndex}
      defaultFormValuesControl={{
        isInited: item?.isInited,
        setIsInited,
        defaultFormValues: item?.formValues,
        setDefaultFormValues,
        onSnapshot: handleSnapshot,
        isNewTab: item?.isNewTab,
      }}
    />
  );
}

export default function index() {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceList, groupedDatasourceList } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const params = queryString.parse(location.search) as { [index: string]: string | null };

  useEffect(() => {
    // mouted 后清空掉所有参数，这里是多 tabs 的设计，url search 只在外部链接进入时生效一次
    history.replace({ pathname: location.pathname });
  }, []);

  const datasourceManagePath = IS_ENT ? '/settings/source/log' : '/datasources';
  // 仅展示当前版本实际支持的数据源类型（graphPro 类型在开源版下过滤掉）
  const enabledDatasourceTypes = ENABLED_VIEW_CATES.filter((cate) => isLogExplorerDatasourceCateSupported(cate)).join(', ');

  const paramDatasourceCate = params['data_source_name'] || undefined;
  const useParamDatasource = paramDatasourceCate && isLogExplorerDatasourceCateSupported(paramDatasourceCate) && _.find(datasourceList, { plugin_type: paramDatasourceCate });
  const defaultDatasourceCate = useParamDatasource ? paramDatasourceCate : getDefaultDatasourceCate(datasourceList, DEFAULT_DATASOURCE_CATE);

  // 如果没有可用的数据源类型，直接提示错误
  if (defaultDatasourceCate === undefined) {
    return (
      <PageLayout title={t('title')} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/'>
        <div className='n9e'>
          <Alert
            showIcon
            className='m-4'
            type='error'
            message={t('no_supported_datasource_types_title')}
            description={
              <Trans
                ns={NAME_SPACE}
                i18nKey='no_supported_datasource_types_desc'
                values={{ types: enabledDatasourceTypes }}
                components={{
                  a: <a href={datasourceManagePath} target='_blank'></a>,
                }}
              />
            }
          />
        </div>
      </PageLayout>
    );
  }

  const defaultDatasourceValue =
    useParamDatasource && params['data_source_id'] ? _.toNumber(params['data_source_id']) : getDefaultDatasourceValue(defaultDatasourceCate, groupedDatasourceList);

  const defaultItems = getLocalItems(params, {
    datasourceCate: defaultDatasourceCate,
    datasourceValue: defaultDatasourceValue,
  });
  const [items, setItems] = useState<TabItem[]>(defaultItems);
  const [activeKey, setActiveKey] = useState<string>(getLocalActiveKey(params, defaultItems));

  // P2-1: 共享的防抖持久化器，写入时读取最新的 itemsRef，
  // 避免防抖快照与 Header 关闭/重命名页签时的同步直写相互覆盖。
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const persistItemsRef = useRef<ReturnType<typeof _.debounce> | null>(null);
  if (!persistItemsRef.current) {
    persistItemsRef.current = _.debounce(() => setLocalItems(itemsRef.current), 300);
  }
  const persistItems = useCallback(() => {
    persistItemsRef.current?.();
  }, []);
  useEffect(() => {
    return () => {
      // 页面卸载前 flush，避免防抖窗口内的最后一次写入丢失
      persistItemsRef.current?.flush();
    };
  }, []);

  // ---- P2 方案A：LRU 保活（容量 LRU_CAPACITY），超出容量的页签卸载，切回时基于 formValues 恢复并自动重查 ----
  const [recentKeys, setRecentKeys] = useState<string[]>(() => _.map(items, 'key'));
  const prevActiveKeyRef = useRef(activeKey);

  // items 增删时同步 recentKeys（新增补到队尾，关闭的移除）
  useEffect(() => {
    setRecentKeys((prev) => {
      const itemKeys = _.map(items, 'key');
      const next = _.filter(prev, (k) => _.includes(itemKeys, k));
      _.forEach(itemKeys, (k) => {
        if (!_.includes(next, k)) next.push(k);
      });
      return _.isEqual(next, prev) ? prev : next;
    });
  }, [items]);

  // activeKey 变化：把激活页签提到最近使用的最前
  useEffect(() => {
    if (prevActiveKeyRef.current === activeKey) return;
    prevActiveKeyRef.current = activeKey;
    setRecentKeys((prev) => [activeKey, ..._.without(prev, activeKey)]);
  }, [activeKey]);

  // LRU 淘汰：超出容量的页签标记 isInited=false，切回时走恢复链路自动重查（刷新/切回均自动查询）
  useEffect(() => {
    if (recentKeys.length <= LRU_CAPACITY) return;
    const evicted = recentKeys.slice(LRU_CAPACITY);
    setItems((prev) => {
      const needUpdate = _.some(prev, (i) => _.includes(evicted, i.key) && i.isInited !== false);
      if (!needUpdate) return prev;
      return _.map(prev, (i) => (_.includes(evicted, i.key) ? { ...i, isInited: false } : i));
    });
  }, [recentKeys]);

  // 只挂载最近 LRU_CAPACITY 个页签（激活页签始终保活）
  const mountedKeys = new Set(recentKeys.slice(0, LRU_CAPACITY));
  mountedKeys.add(activeKey);

  return (
    <PageLayout
      title={
        <Header
          items={items}
          setItems={setItems}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          defaultDatasourceCate={defaultDatasourceCate}
          defaultDatasourceValue={defaultDatasourceValue}
        />
      }
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/'
    >
      <div className='n9e'>
        {_.map(items, (item, itemIndex) => {
          // P2 方案A：不在 LRU 保活范围内的页签直接卸载（切回时基于 formValues 恢复重查）
          if (!mountedKeys.has(item.key)) {
            return null;
          }
          return (
            <div key={item.key} className='h-full w-full' style={{ display: item.key === activeKey ? 'block' : 'none' }}>
              <TabExplorer item={item} itemIndex={itemIndex} active={item.key === activeKey} setItems={setItems} persistItems={persistItems} />
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}
