import React, { useState } from 'react';
import _ from 'lodash';
import { useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Resizable } from 're-resizable';
import { Button, Tabs, Form } from 'antd';

import { NAME_SPACE } from '../constants';
import Meta from '../components/Meta';
import QueryBuilder from './QueryBuilder';
import Graph from './Graph';
import Table from './Table';
import { useMysqlAiDock } from './aiDock';

import './style.less';

interface IProps {
  datasourceValue: number;
}

export default function Prometheus(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceValue } = props;
  const form = Form.useFormInstance();
  const [mode, setMode, getMode] = useGetState<string>('table');
  const [refreshFlag, setRefreshFlag] = useState<string>();
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('tdengine-meta-sidebar') || 200));
  const refresh = () => setRefreshFlag(_.uniqueId('refreshFlag_'));
  const ai = useMysqlAiDock({
    form,
    datasourceValue,
    // Rows are the honest view of a statement: the graph needs a value column
    // the assistant never chose, and would silently draw nothing.
    commit: () => {
      setMode('table');
      refresh();
    },
    refresh,
  });
  // Every hand the user lays on the panel: a dock turn that started earlier may not write.
  const invalidate = ai.invalidate;
  const executeQuery = () => {
    invalidate();
    form.validateFields().then(refresh);
  };

  return (
    <div className={`${NAME_SPACE}-explorer-container`}>
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
              datasourceValue={datasourceValue}
              onTreeNodeClick={(nodeData) => {
                invalidate();
                const query = form.getFieldValue(['query']);
                _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} limit 20;`);
                form.setFieldsValue({
                  query,
                });
                refresh();
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
          <div ref={ai.queryRowRef}>
            <QueryBuilder
              extra={
                <Button type='primary' onClick={executeQuery} ref={ai.queryButtonRef}>
                  {t('query.execute')}
                </Button>
              }
              executeQuery={executeQuery}
              onUserContextChange={invalidate}
              queryExtra={ai.trigger}
              noticeBanner={ai.dock}
              datasourceValue={datasourceValue}
              getMode={getMode}
            />
          </div>
          <Tabs
            destroyInactiveTabPane
            tabBarGutter={0}
            activeKey={mode}
            onChange={(key: 'table' | 'graph') => {
              invalidate();
              setMode(key);
              // TODO 不清楚这里为什么要加延迟 200ms
              setTimeout(refresh, 200);
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
                <Table form={form} datasourceValue={datasourceValue} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} queryRequest={ai.queryRequest} />
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
