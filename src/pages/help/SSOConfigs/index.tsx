import React, { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import PageLayout from '@/components/pageLayout';

import { getSSOConfigs } from './services';
import { SSOConfigType } from './types';
import Item from './Item';
import './locale';

//@ts-ignore
import Global from 'plus:/parcels/SSOConfigs/Global';

export default function index() {
  const { t } = useTranslation('SSOConfigs');
  const [data, setData] = useState<SSOConfigType[]>([]);
  const [activeKey, setActiveKey] = useState<string>();

  useEffect(() => {
    getSSOConfigs().then((res) => {
      setData(res);
      setActiveKey(res?.[0]?.name);
    });
  }, []);

  return (
    <PageLayout title={t('title')}>
      <main className='p-4'>
        <Global SSOConfigs={data} />
        <Card
          bordered
          size='small'
          bodyStyle={{
            paddingTop: 2,
          }}
        >
          <Tabs
            activeKey={activeKey}
            onChange={(activeKey) => {
              setActiveKey(activeKey);
            }}
          >
            {data.map((item) => {
              return (
                <Tabs.TabPane tab={t(item.name)} key={item.name}>
                  <Item activeKey={activeKey} item={item} />
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </Card>
      </main>
    </PageLayout>
  );
}
