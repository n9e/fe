import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DBTableSelect from './dbTableSelect';
import { ITreeSelect } from '../types';
import TreeSelectDesc from './treeSelectDesc';
import { DatasourceCateEnum } from '@/utils/constant';
import ModeRadio from './ModeRadio';
import Query from './Query';
import _ from 'lodash';
import { FormInstance } from 'antd/lib/form/Form';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Raw from './Raw';
import { useQuery } from '@/utils';

interface ExplorerProps {
  datasourceCate: DatasourceCateEnum;
  datasourceValue: number;
  disabled: boolean;
  headerExtra: HTMLDivElement | null;
  form: FormInstance;
  defaultFormValuesControl?: {
    isInited?: boolean;
    setIsInited: () => void;
    defaultFormValues?: any;
    setDefaultFormValues?: (query: any) => void;
  };
}
// 支持这样的默认参数带入：/log/explorer?data_source_name=doris&data_source_id=919&mode=condition&database=demo&table=nginx_access_log&condition=&time_field=date
export default function Explore(props: ExplorerProps) {
  const { datasourceCate, datasourceValue, disabled, headerExtra, form, defaultFormValuesControl } = props;
  const query = useQuery();
  const queryMode = query.get('mode'); // metric | sql | condition
  const [treeSelect, setTreeSelect] = useState<ITreeSelect>({ db: '', table: '', field: '' });
  const [mode, setMode] = useState<'raw' | 'metric'>(queryMode ? (queryMode === 'metric' ? 'metric' : 'raw') : 'raw'); // raw | metric
  const [subMode, setSubMode] = useState(queryMode && queryMode === 'sql' ? 'sql' : 'condition'); // sql | condition
  const [collapsed, setCollapsed] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(1);
  const [loading, setLoading] = useState(false);
  const onExecute = async () => {
    const values = await form.validateFields();
    if (treeSelect.table === '') {
      setDbError(true);
      return;
    }
    if (defaultFormValuesControl?.setDefaultFormValues) {
      defaultFormValuesControl.setDefaultFormValues({
        datasourceCate,
        datasourceValue,
        query: values.query,
        treeSelect,
      });
    }
    setRefreshFlag(refreshFlag + 1);
  };
  useEffect(() => {
    if (defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      form.setFieldsValue(defaultFormValuesControl.defaultFormValues);
      defaultFormValuesControl.setIsInited();
      if (query.get('database') && query.get('table')) {
        setTreeSelect({ db: query.get('database') as string, table: query.get('table') as string });
        setRefreshFlag(refreshFlag + 1);
      } else {
        setTreeSelect(defaultFormValuesControl.defaultFormValues.treeSelect);
      }
    }
  }, []);

  return (
    <div className='sls-discover-content'>
      {headerExtra ? createPortal(<ModeRadio mode={mode} setMode={setMode} disabled={disabled} />, headerExtra) : null}
      <div
        className='discover-sidebar'
        style={{
          border: !collapsed ? 'none' : dbError ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
          flexShrink: 0,
          position: 'relative',
          width: !collapsed ? 0 : undefined,
          overflowY: 'auto',
        }}
      >
        {collapsed && (
          <DBTableSelect
            mode={mode}
            datasourceCate={datasourceCate}
            datasourceValue={datasourceValue}
            onTreeClick={(v) => {
              setTreeSelect(v);
              setDbError(false);
            }}
            form={form}
          />
        )}
        <div
          className='doris-discover-collapse'
          onClick={() => {
            setCollapsed(!collapsed);
          }}
        >
          {collapsed ? <LeftOutlined /> : <RightOutlined />}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', marginLeft: !collapsed ? -16 : undefined }}>
        <Query mode={mode} disabled={disabled} onExecute={onExecute} subMode={subMode} setSubMode={setSubMode} form={form} treeSelect={treeSelect} loading={loading} />
        <TreeSelectDesc {...{ ...treeSelect, dbError }} />

        <div style={{ height: 'calc(100% - 70px)', overflowY: 'auto', overflowX: 'hidden', marginTop: 8 }}>
          <Raw form={form} setRefreshFlag={() => {}} refreshFlag={refreshFlag} treeSelect={treeSelect} mode={mode} subMode={subMode} setLoading={setLoading} loading={loading} />
        </div>
      </div>
    </div>
  );
}
