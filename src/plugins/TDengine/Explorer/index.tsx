import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Resizable } from 're-resizable';
import { Button, Tabs } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import AdvancedSettings from '../components/AdvancedSettings';
import QueryBuilder from './QueryBuilder';
import Meta from '../components/Meta';
import Graph from './Graph';
import Table from './Table';
import './style.less';

interface IProps {
  datasourceValue: number;
  form: FormInstance;
}

export const cacheDefaultValues = (datasourceID, query: string) => {
  localStorage.setItem(`explorer_tdengine_${datasourceID}_query`, query);
};

export const setDefaultValues = (form: FormInstance) => {
  const datasourceID = form.getFieldValue('datasourceValue');
  const queryStr = localStorage.getItem(`explorer_tdengine_${datasourceID}_query`);
  form.setFieldsValue({
    query: {
      query: queryStr,
    },
  });
};

export default function Prometheus(props: IProps) {
  const { datasourceValue, form } = props;
  const [mode, setMode] = useState<string>('table');
  const [refreshFlag, setRefreshFlag] = useState<string>();
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('tdengine-meta-sidebar') || 200));

  useEffect(() => {
    setDefaultValues(form);
  }, []);

  return (
    <div className='tdengine-discover-container'>
      <div className='tdengine-discover-query-container'>
        <div className='tdengine-discover-meta-container'>
          <Resizable
            size={{ width, height: '100%' }}
            enable={{
              right: true,
            }}
            onResizeStop={(e, direction, ref, d) => {
              let curWidth = width + d.width;
              if (curWidth < 200) {
                curWidth = 200;
              }
              setWidth(curWidth);
              localStorage.setItem('tdengine-meta-sidebar', curWidth.toString());
            }}
          >
            <Meta
              datasourceValue={datasourceValue}
              onTreeNodeClick={(nodeData) => {
                const query = form.getFieldValue(['query']);
                _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} where _ts >= $from and _ts < $to`);
                if (nodeData.levelType === 'field') {
                  query.keys = {
                    ...(query?.keys || {}),
                    metricKey: [nodeData.field],
                  };
                }
                form.setFieldsValue({
                  query,
                });
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          </Resizable>
        </div>
        <div
          className='tdengine-discover-main'
          style={{
            width: `calc(100% - ${width + 8}px)`,
          }}
        >
          <QueryBuilder
            form={form}
            extra={
              <Button
                type='primary'
                onClick={() => {
                  setRefreshFlag(_.uniqueId('refreshFlag_'));
                }}
              >
                查询
              </Button>
            }
            setRefreshFlag={setRefreshFlag}
          />
          <Tabs
            destroyInactiveTabPane
            tabBarGutter={0}
            activeKey={mode}
            onChange={(key: 'table' | 'graph') => {
              setMode(key);
              setTimeout(() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }, 200);
            }}
            type='card'
          >
            <Tabs.TabPane tab='Table' key='table'>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <AdvancedSettings mode='table' span={8} prefixName={['query']} expanded expandTriggerVisible={false} />
                <Table form={form} datasourceValue={datasourceValue} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab='Graph' key='graph'>
              <Graph form={form} datasourceValue={datasourceValue} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
