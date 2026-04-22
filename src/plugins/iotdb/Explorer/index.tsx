import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Resizable } from 're-resizable';
import { Button, Tabs } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { DatasourceCateEnum } from '@/utils/constant';
import AdvancedSettings from '../components/AdvancedSettings';
import QueryBuilder from './QueryBuilder';
import Meta from '../components/Meta';
import Graph from './Graph';
import Table from './Table';
import './style.less';

interface Props {
  datasourceCate?: string;
  datasourceValue: number;
  form: FormInstance;
}

const getExplorerCacheKey = (datasourceCate: string, datasourceID: number) => {
  return `explorer_${datasourceCate}_${datasourceID}_query`;
};

export const cacheDefaultValues = (datasourceCate: string, datasourceID: number, query: string) => {
  localStorage.setItem(getExplorerCacheKey(datasourceCate, datasourceID), query);
};

export const setDefaultValues = (form: FormInstance, datasourceCate: string) => {
  const datasourceID = form.getFieldValue('datasourceValue');
  const queryStr = localStorage.getItem(getExplorerCacheKey(datasourceCate, datasourceID));
  form.setFieldsValue({
    query: {
      query: queryStr,
    },
  });
};

export default function IotDBExplorer(props: Props) {
  const { datasourceCate = DatasourceCateEnum.iotdb, datasourceValue, form } = props;
  const [mode, setMode] = useState<string>('table');
  const [refreshFlag, setRefreshFlag] = useState<string>();
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('tdengine-meta-sidebar') || 200));

  useEffect(() => {
    setDefaultValues(form, datasourceCate);
  }, [datasourceCate, form]);

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
              datasourceCate={datasourceCate}
              datasourceValue={datasourceValue}
              onTreeNodeClick={(nodeData) => {
                const query = form.getFieldValue(['query']);
                query.database = nodeData.database;
                if (nodeData.levelType === 'field') {
                  _.set(query, 'query', `select time, ${nodeData.field} from ${nodeData.table}`);
                  query.keys = {
                    ...(query?.keys || {}),
                    metricKey: [nodeData.field],
                    timeKey: 'time',
                  };
                } else {
                  _.set(query, 'query', `select * from ${nodeData.table}`);
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
            datasourceCate={datasourceCate}
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
                <AdvancedSettings mode='table' span={8} prefixName={['query']} expanded expandTriggerVisible={false} datasourceCate={datasourceCate} />
                <Table form={form} datasourceCate={datasourceCate} datasourceValue={datasourceValue} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab='Graph' key='graph'>
              <Graph form={form} datasourceCate={datasourceCate} datasourceValue={datasourceValue} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
