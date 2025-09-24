import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Radio, Form, Space } from 'antd';
import { useLocation } from 'react-router-dom';

import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import Share from '@/pages/explorer/components/Share';
import { parseRange } from '@/components/TimeRangePicker';
import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import { setLocalQueryHistory as setLocalQueryHistoryUtil } from '@/components/HistoricalRecords';

import { useGlobalState } from '../globalState';
import { NAME_SPACE, QUERY_CACHE_KEY, QUERY_CACHE_PICK_KEYS, SQL_CACHE_KEY } from '../constants';
import Query from './Query';
import SQL from './SQL';

import './style.less';

// @ts-ignore
import ExportModal from 'plus:/components/LogDownload/ExportModal';
// @ts-ignore
import DrilldownBtn from 'plus:/pages/LogExploreLinkSetting/components/DrilldownBtn';

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

const HeaderExtra = ({ disabled, datasourceValue }) => {
  const { t } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();
  const mode = Form.useWatch(['query', 'mode']);

  return (
    <div className='flex justify-between'>
      <Space>
        <Form.Item name={['query', 'mode']} noStyle initialValue='query'>
          <Radio.Group
            onChange={(e) => {
              form.setFieldsValue({
                query: {
                  query: '',
                },
              });
            }}
            buttonStyle='solid'
            disabled={disabled}
          >
            <Radio.Button value='query'>{t('query.mode.query')}</Radio.Button>
            <Radio.Button value='sql'>{t('query.mode.sql')}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {mode === 'sql' && (
          <Form.Item name={['query', 'submode']} noStyle initialValue='raw'>
            <Radio.Group buttonStyle='solid' disabled={disabled}>
              <Radio.Button value='raw'>{t('query.submode.raw')}</Radio.Button>
              <Radio.Button value='timeSeries'>{t('query.submode.timeSeries')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        )}
      </Space>
      <Space>
        {IS_PLUS && <DrilldownBtn />}
        {IS_PLUS && <ExportModal datasourceValue={datasourceValue} />}
        <Share tooltip={t('explorer:share_tip_2')} />
      </Space>
    </div>
  );
};

export default function Prometheus(props: IProps) {
  const [, setExplorerParsedRange] = useGlobalState('explorerParsedRange');
  const [, setExplorerSnapRange] = useGlobalState('explorerSnapRange');
  const params = new URLSearchParams(useLocation().search);
  const { datasourceCate, datasourceValue, headerExtra, disabled, defaultFormValuesControl } = props;
  const form = Form.useFormInstance();
  const mode = Form.useWatch(['query', 'mode']); // query | sql
  const submode = Form.useWatch(['query', 'submode']); // raw | timeSeries
  const range = Form.useWatch(['query', 'range']);

  const executeQuery = () => {
    form.validateFields().then((values) => {
      // 设置 tabs 缓存值
      if (defaultFormValuesControl?.setDefaultFormValues) {
        defaultFormValuesControl.setDefaultFormValues({
          datasourceCate,
          datasourceValue,
          query: values.query,
        });
      }
      // 设置历史记录方法
      const queryValues = values.query;
      if (queryValues.mode === 'query') {
        if (queryValues.database && queryValues.table && queryValues.time_field) {
          setLocalQueryHistory(`${QUERY_CACHE_KEY}-${datasourceValue}`, _.pick(queryValues, QUERY_CACHE_PICK_KEYS));
        }
      } else if (queryValues.mode === 'sql') {
        if (queryValues.query) {
          setLocalQueryHistoryUtil(`${SQL_CACHE_KEY}-${datasourceValue}`, queryValues.query);
        }
      }

      // 如果是相对时间范围，则更新 explorerParsedRange
      const range = values.query?.range;
      if (_.isString(range?.start) && _.isString(range?.end)) {
        setExplorerParsedRange(parseRange(range));
      }
      // 每次执行查询，重置 explorerSnapRange
      setExplorerSnapRange({});
      form.setFieldsValue({
        refreshFlag: _.uniqueId('refreshFlag_'),
      });
    });
  };

  useEffect(() => {
    // 外部修改了 range，则更新 explorerParsedRange
    const parsedRange = range ? parseRange(range) : { start: undefined, end: undefined };
    setExplorerParsedRange(parsedRange);
  }, [JSON.stringify(range)]);

  useEffect(() => {
    if (defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      form.setFieldsValue({
        ...defaultFormValuesControl.defaultFormValues,
        refreshFlag: params.get('__execute__') ? _.uniqueId('refreshFlag_') : undefined,
      });
      defaultFormValuesControl.setIsInited();
    }
  }, []);

  return (
    <div className={`${NAME_SPACE}-explorer-container`}>
      <Form.Item name='refreshFlag' hidden>
        <div />
      </Form.Item>
      {headerExtra && createPortal(<HeaderExtra disabled={disabled} datasourceValue={datasourceValue} />, headerExtra)}
      {mode === 'query' && <Query disabled={disabled} datasourceValue={datasourceValue} executeQuery={executeQuery} />}
      {mode === 'sql' && <SQL submode={submode} disabled={disabled} datasourceValue={datasourceValue} executeQuery={executeQuery} />}
    </div>
  );
}
