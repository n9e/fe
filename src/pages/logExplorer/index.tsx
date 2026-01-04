import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { getDefaultDatasourceValue } from '@/utils';
import { DatasourceCateEnum } from '@/utils/constant';
import PageLayout from '@/components/pageLayout';

import Header from './Header';
import Explorer from './Explorer';
import { getLocalItems, setLocalItems } from './utils/getLocalItems';
import { getLocalActiveKey } from './utils/getLocalActiveKey';
import getDefaultDatasourceCate from './utils/getDefaultDatasourceCate';

export default function index() {
  const { datasourceList, groupedDatasourceList } = useContext(CommonStateContext);
  const location = useLocation();
  const params = queryString.parse(location.search) as { [index: string]: string | null };
  const defaultItems = getLocalItems(params);
  const [items, setItems] = useState<{ key: string; isInited?: boolean; formValues?: any }[]>(defaultItems);
  const [activeKey, setActiveKey] = useState<string>(getLocalActiveKey(params, defaultItems));
  const viewSelectContainerRef = React.useRef<HTMLDivElement>(null);
  const [headerContainerMounted, setHeaderContainerMounted] = useState(false);

  const defaultDatasourceCate = params['data_source_name'] || getDefaultDatasourceCate(datasourceList, DatasourceCateEnum.elasticsearch);
  const defaultDatasourceValue = params['data_source_id'] ? _.toNumber(params['data_source_id']) : getDefaultDatasourceValue(defaultDatasourceCate, groupedDatasourceList);

  return (
    <PageLayout
      title={
        <Header
          items={items}
          setItems={setItems}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          viewSelectContainerRef={viewSelectContainerRef}
          setHeaderContainerMounted={setHeaderContainerMounted}
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
                headerContainerMounted={headerContainerMounted && item.key === activeKey}
                tabKey={item.key}
                tabIndex={itemIndex}
                viewSelectContainerRef={viewSelectContainerRef}
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
                defaultDatasourceCate={defaultDatasourceCate}
                defaultDatasourceValue={defaultDatasourceValue}
              />
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}
