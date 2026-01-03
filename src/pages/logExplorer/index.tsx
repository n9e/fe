import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';

import Header from './Header';
import Explorer from './Explorer';
import { getLocalItems, setLocalItems } from './utils/getLocalItems';
import { getLocalActiveKey } from './utils/getLocalActiveKey';

export default function index() {
  const location = useLocation();
  const params = queryString.parse(location.search) as { [index: string]: string | null };
  const defaultItems = getLocalItems(params);
  const [items, setItems] = useState<{ key: string; isInited?: boolean; formValues?: any }[]>(defaultItems);
  const [activeKey, setActiveKey] = useState<string>(getLocalActiveKey(params, defaultItems));
  const viewSelectContainerRef = React.useRef<HTMLDivElement>(null);
  const [headerContainerMounted, setHeaderContainerMounted] = useState(false);

  const item = useMemo(() => {
    return _.find(items, (i) => i.key === activeKey);
  }, [items, activeKey]);
  const itemIndex = useMemo(() => {
    return _.findIndex(items, (i) => i.key === activeKey);
  }, [items, activeKey]);

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
        />
      }
    >
      <div className='n9e'>
        <Explorer
          headerContainerMounted={headerContainerMounted}
          tabKey={activeKey}
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
        />
      </div>
    </PageLayout>
  );
}
