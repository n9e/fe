import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'antd';
import _ from 'lodash';

import { CommonStateContext } from '@/App';

import { NAME_SPACE } from './constants';
import { LogExplorerTabItem } from './types';
import getUUID from './utils/getUUID';
import { setLocalItems } from './utils/getLocalItems';
import { setLocalActiveKey } from './utils/getLocalActiveKey';

interface Props {
  items: LogExplorerTabItem[];
  setItems: React.Dispatch<React.SetStateAction<LogExplorerTabItem[]>>;
  activeKey: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
  defaultDatasourceCate: string;
  defaultDatasourceValue: number;
}

export default function Header(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange } = useContext(CommonStateContext);
  const { items, setItems, activeKey, setActiveKey, defaultDatasourceCate, defaultDatasourceValue } = props;

  return (
    <div className='log-explorer-ng-header w-full flex items-center gap-4'>
      <span className='flex-shrink-0'>{t('title')}</span>
      <Tabs
        className='log-explorer-ng-tabs min-w-0 flex-1'
        size='small'
        type='editable-card'
        activeKey={activeKey}
        onEdit={(targetKey: string, action: 'add' | 'remove') => {
          if (action === 'add') {
            const activeItem = _.find(items, { key: activeKey });
            const newActiveKey = getUUID();
            const newItem = activeItem
              ? {
                  ...activeItem,
                  key: newActiveKey,
                  isInited: false,
                }
              : {
                  key: newActiveKey,
                  isInited: false,
                  formValues: {
                    datasourceCate: defaultDatasourceCate,
                    datasourceValue: defaultDatasourceValue,
                    query: {
                      range: logsDefaultRange,
                    },
                  },
                };
            const newItems = [...items, newItem];
            setItems(newItems);
            setLocalItems(newItems);
            setActiveKey(newActiveKey);
            setLocalActiveKey(newActiveKey);
          } else {
            const newItems = _.filter(items, (item) => item.key !== targetKey);
            setItems(newItems);
            setLocalItems(newItems);
            if (targetKey === activeKey) {
              setActiveKey(newItems?.[0]?.key);
              setLocalActiveKey(newItems?.[0]?.key);
            }
          }
        }}
        onChange={(key) => {
          setActiveKey(key);
          setLocalActiveKey(key);
        }}
        onTabClick={() => {
          // antd tabs 默认阻止了冒泡，导致外部的 useClickAway 无法触发，这里手动触发一次 click 事件
          document.dispatchEvent(new MouseEvent('click'));
        }}
      >
        {_.map(items, (item, idx) => {
          return (
            <Tabs.TabPane closable={items.length !== 1} tab={`Query ${idx + 1}`} key={item.key}>
              <></>
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </div>
  );
}
