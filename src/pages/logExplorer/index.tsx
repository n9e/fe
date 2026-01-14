import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { getDefaultDatasourceValue } from '@/utils';
import PageLayout from '@/components/pageLayout';

import { DEFAULT_DATASOURCE_CATE } from './constants';
import { getLocalItems, setLocalItems } from './utils/getLocalItems';
import { getLocalActiveKey } from './utils/getLocalActiveKey';
import getDefaultDatasourceCate from './utils/getDefaultDatasourceCate';
import Header from './Header';
import Explorer from './Explorer';

export default function index() {
  const { datasourceList, groupedDatasourceList } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const params = queryString.parse(location.search) as { [index: string]: string | null };

  const defaultDatasourceCate = params['data_source_name'] || getDefaultDatasourceCate(datasourceList, DEFAULT_DATASOURCE_CATE);
  const defaultDatasourceValue = params['data_source_id'] ? _.toNumber(params['data_source_id']) : getDefaultDatasourceValue(defaultDatasourceCate, groupedDatasourceList);

  const defaultItems = getLocalItems(params, {
    datasourceCate: defaultDatasourceCate,
    datasourceValue: defaultDatasourceValue,
  });
  const [items, setItems] = useState<{ key: string; isInited?: boolean; formValues?: any }[]>(defaultItems);
  const [activeKey, setActiveKey] = useState<string>(getLocalActiveKey(params, defaultItems));

  useEffect(() => {
    // mouted 后清空掉所有参数，这里是多 tabs 的设计，url search 只在外部链接进入时生效一次
    history.replace({ pathname: location.pathname });
  }, []);

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
    >
      <div className='n9e'>
        {_.map(items, (item, itemIndex) => {
          return (
            <div key={item.key} className='h-full w-full' style={{ display: item.key === activeKey ? 'block' : 'none' }}>
              <Explorer
                active={item.key === activeKey}
                tabKey={item.key}
                tabIndex={itemIndex}
                defaultFormValuesControl={{
                  isInited: item?.isInited,
                  setIsInited: () => {
                    const newItems = _.map(items, (i) => {
                      if (i.key === item?.key) {
                        return {
                          ...i,
                          isInited: true,
                        };
                      }
                      return i;
                    });
                    setItems(newItems);
                  },
                  defaultFormValues: item?.formValues,
                  setDefaultFormValues: (newValues) => {
                    const newItems = _.map(items, (i) => {
                      if (i.key === item?.key) {
                        return {
                          ...i,
                          isInited: true,
                          formValues: newValues,
                        };
                      }
                      return i;
                    });
                    setLocalItems(newItems);
                    setItems(newItems);
                  },
                }}
              />
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}
