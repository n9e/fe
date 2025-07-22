import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import { useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Resizable } from 're-resizable';
import { Button, Tabs, Form, Space } from 'antd';
import { useLocation } from 'react-router-dom';

import { DatasourceCateEnum } from '@/utils/constant';
import Share from '@/pages/explorer/components/Share';
import Meta from '@/components/Meta';

import QueryBuilder from './QueryBuilder';
import Graph from './Graph';
import Table from './Table';
import { NAME_SPACE } from '../constants';
import './style.less';

interface IProps {
  datasourceValue: number;
  headerExtra: HTMLDivElement | null;
  defaultFormValuesControl?: {
    isInited?: boolean;
    setIsInited: () => void;
    defaultFormValues?: any;
    setDefaultFormValues?: (query: any) => void;
  };
}

export default function Prometheus(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const params = new URLSearchParams(useLocation().search);
  const { datasourceValue, headerExtra, defaultFormValuesControl } = props;
  const form = Form.useFormInstance();
  const [mode, setMode, getMode] = useGetState<string>('table');
  const [refreshFlag, setRefreshFlag] = useState<string>();
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('tdengine-meta-sidebar') || 200));
  const executeQuery = () => {
    form.validateFields().then(() => {
      setRefreshFlag(_.uniqueId('refreshFlag_'));
    });
  };

  useEffect(() => {
    if (defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      form.setFieldsValue(defaultFormValuesControl.defaultFormValues);
      defaultFormValuesControl.setIsInited();
    }
    if (params.get('__execute__')) {
      executeQuery();
    }
  }, []);

  return (
    <div className={`${NAME_SPACE}-explorer-container`}>
      {headerExtra &&
        createPortal(
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div />
            <Space>
              <Share />
            </Space>
          </div>,
          headerExtra,
        )}
      <div className='explorer-query-container'>
        <div className='explorer-meta-container'>
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
              datasourceCate={DatasourceCateEnum.doris}
              datasourceValue={datasourceValue}
              onTreeNodeClick={(nodeData) => {
                const query = form.getFieldValue(['query']);
                _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} limit 20;`);
                form.setFieldsValue({
                  query,
                });
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          </Resizable>
        </div>
        <div
          className='explorer-main'
          style={{
            width: `calc(100% - ${width + 8}px)`,
          }}
        >
          <QueryBuilder
            extra={
              <Button type='primary' onClick={executeQuery}>
                {t('query.execute')}
              </Button>
            }
            executeQuery={executeQuery}
            datasourceValue={datasourceValue}
            getMode={getMode}
          />
          <Tabs
            destroyInactiveTabPane
            tabBarGutter={0}
            activeKey={mode}
            onChange={(key: 'table' | 'graph') => {
              setMode(key);
              // TODO 不清楚这里为什么要加延迟 200ms
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
