import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, Form, Space } from 'antd';
import { useLocation } from 'react-router-dom';

import { DatasourceCateEnum } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import Share from '@/pages/explorer/components/Share';

import QueryBuilder from './QueryBuilder';
import Graph from './Graph';
import Logs from './Logs';
import { NAME_SPACE, STYLE_NAME_SPACE } from '../constants';
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

export default function Explorer(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const urlSearchParams = new URLSearchParams(useLocation().search);
  const { datasourceValue, headerExtra, defaultFormValuesControl } = props;
  const form = Form.useFormInstance();
  const range = Form.useWatch(['range']);
  const query = Form.useWatch(['query', 'query']);
  const limit = Form.useWatch(['query', 'limit']);
  const [refreshFlag, setRefreshFlag] = useState<string>();
  const executeQuery = () => {
    form.validateFields().then((values) => {
      if (defaultFormValuesControl?.setDefaultFormValues) {
        defaultFormValuesControl.setDefaultFormValues({
          datasourceCate: DatasourceCateEnum.victorialogs,
          datasourceValue,
          query: values.query,
          range: values.range,
        });
      }
      setRefreshFlag(_.uniqueId('refreshFlag_'));
    });
  };

  useEffect(() => {
    if (range) {
      executeQuery();
    }
  }, [JSON.stringify(range)]);

  useEffect(() => {
    if (defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      form.setFieldsValue(defaultFormValuesControl.defaultFormValues);
      defaultFormValuesControl.setIsInited();
      if (urlSearchParams.get('__execute__')) {
        executeQuery();
      }
    }
  }, []);

  return (
    <div className={STYLE_NAME_SPACE} style={{ height: '100%' }}>
      <div className='explorer-container'>
        {headerExtra &&
          createPortal(
            <div
              style={{
                textAlign: 'right',
              }}
            >
              <Space>
                <a target='_blank' href='https://docs.victoriametrics.com/victorialogs/logsql/'>
                  {t('explorer.query_lanaguage_docs')}
                </a>
                <Share tooltip={t('explorer:share_tip_2')} />
                <Form.Item name={['range']} initialValue={{ start: 'now-1h', end: 'now' }} noStyle>
                  <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' />
                </Form.Item>
                <Button
                  type='primary'
                  onClick={() => {
                    executeQuery();
                  }}
                >
                  {t('explorer.execute')}
                </Button>
              </Space>
            </div>,
            headerExtra,
          )}
        <QueryBuilder executeQuery={executeQuery} />
        <Graph
          refreshFlag={refreshFlag}
          datasourceValue={datasourceValue}
          query={query}
          range={range}
          onRangeChange={(newRange) => {
            form.setFieldsValue({
              range: newRange,
            });
          }}
        />
        <Logs refreshFlag={refreshFlag} datasourceValue={datasourceValue} query={query} limit={limit} range={range} />
      </div>
    </div>
  );
}
