import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, Tabs } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import AdvancedSettings from '../components/AdvancedSettings';
import QueryBuilder from './QueryBuilder';
import Meta from './Meta';
import Graph from './Graph';
import Table from './Table';
import './style.less';

interface IProps {
  datasourceValue: number;
  form: FormInstance;
}

export default function Prometheus(props: IProps) {
  const { datasourceValue, form } = props;
  const [mode, setMode] = useState<string>('graph');

  return (
    <div className='tdengine-discover-container'>
      <div className='tdengine-discover-query-container'>
        <div className='tdengine-discover-meta-container'>
          <Meta datasourceValue={datasourceValue} />
        </div>
        <div style={{ width: '100%', height: '100%' }}>
          <QueryBuilder extra={<Button type='primary'>查询</Button>} />
          <Tabs
            destroyInactiveTabPane
            tabBarGutter={0}
            activeKey={mode}
            onChange={(key: 'table' | 'graph') => {
              setMode(key);
            }}
            type='card'
          >
            <Tabs.TabPane tab='Graph' key='graph'>
              <AdvancedSettings mode='graph' span={8} prefixName={['query']} />
              <Graph form={form} datasourceValue={datasourceValue} />
            </Tabs.TabPane>
            <Tabs.TabPane tab='Table' key='table'>
              <AdvancedSettings mode='table' span={8} prefixName={['query']} />
              <Table form={form} datasourceValue={datasourceValue} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
