import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import { useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Resizable } from 're-resizable';
import { Button, Radio, Form, Space } from 'antd';
import { useLocation } from 'react-router-dom';

import { DatasourceCateEnum } from '@/utils/constant';
import Share from '@/pages/explorer/components/Share';
import Meta from '@/components/Meta';

import { getLocalstorageOptions } from './utils';
import QueryBuilder from './QueryBuilder';
import { NAME_SPACE } from '../constants';
import Content from './Content';
import './style.less';

interface IProps {
  datasourceCate: DatasourceCateEnum;
  datasourceValue: number;
  headerExtra: HTMLDivElement | null;
  disabled?: boolean;
  defaultFormValuesControl?: {
    isInited?: boolean;
    setIsInited: () => void;
    defaultFormValues?: any;
    setDefaultFormValues?: (query: any) => void;
  };
}

const HeaderExtra = ({ mode, setMode, submode, setSubmode, disabled }) => {
  const { t } = useTranslation(NAME_SPACE);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Space>
        <Radio.Group
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
          }}
          buttonStyle='solid'
          disabled={disabled}
        >
          <Radio.Button value='raw'>{t('query.mode.raw')}</Radio.Button>
          <Radio.Button value='metric'>{t('query.mode.metric')}</Radio.Button>
        </Radio.Group>
        {mode === 'metric' && (
          <Radio.Group
            value={submode}
            onChange={(e) => {
              setSubmode(e.target.value);
            }}
            buttonStyle='solid'
            disabled={disabled}
          >
            <Radio.Button value='table'>{t('logs.settings.submode.table')}</Radio.Button>
            <Radio.Button value='timeSeries'>{t('logs.settings.submode.timeSeries')}</Radio.Button>
          </Radio.Group>
        )}
      </Space>
      <Space>
        <Share tooltip={t('explorer:share_tip_2')} />
      </Space>
    </div>
  );
};

export default function Prometheus(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const params = new URLSearchParams(useLocation().search);
  const { datasourceCate, datasourceValue, headerExtra, disabled, defaultFormValuesControl } = props;
  const form = Form.useFormInstance();
  const [mode, setMode] = useGetState<string>('raw'); // raw | metric
  const [submode, setSubmode, getSubmode] = useGetState<string>('table'); // table | chart
  const metricRef = useRef<any>();
  const [refreshFlag, setRefreshFlag] = useState<string>();
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('tdengine-meta-sidebar') || 200));
  const [options, setOptions] = useState(getLocalstorageOptions());
  const [executeLoading, setExecuteLoading] = useState(false);
  const executeQuery = () => {
    form.validateFields().then((values) => {
      if (defaultFormValuesControl?.setDefaultFormValues) {
        defaultFormValuesControl.setDefaultFormValues({
          datasourceCate,
          datasourceValue,
          query: {
            ...values.query,
            query: mode === 'raw' ? values.query?.query : '', // TODO: 暂时只在日志原文模式下保存 query
          },
        });
      }
      setOptions(getLocalstorageOptions());
      if (mode === 'raw') {
        setRefreshFlag(_.uniqueId('refreshFlag_'));
      }
      if (mode === 'metric') {
        if (metricRef.current && metricRef.current.fetchData) {
          metricRef.current.fetchData(datasourceCate, datasourceValue, values);
        }
      }
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
          <HeaderExtra
            mode={mode}
            setMode={(newMode) => {
              setMode(newMode);
              form.setFieldsValue({ query: { query: '' } });
            }}
            submode={submode}
            setSubmode={setSubmode}
            disabled={disabled}
          />,
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
                executeQuery();
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
              <Button type='primary' onClick={executeQuery} disabled={disabled} loading={executeLoading}>
                {t('query.execute')}
              </Button>
            }
            executeQuery={executeQuery}
            datasourceValue={datasourceValue}
            getMode={getSubmode}
          />
          <Content
            mode={mode}
            submode={submode}
            metricRef={metricRef}
            setExecuteLoading={setExecuteLoading}
            refreshFlag={refreshFlag}
            setRefreshFlag={setRefreshFlag}
            options={options}
          />
        </div>
      </div>
    </div>
  );
}
