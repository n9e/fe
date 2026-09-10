import React, { useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import LogQL from '@/components/LogQL';
import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';

import DocumentDrawer from '../components/DocumentDrawer';
import HistoricalRecords from '../components/HistoricalRecords';
import { CACHE_KEY, NAME_SPACE } from '../constants';
import { useGlobalState } from '../globalState';

interface Props {
  extra?: React.ReactNode;
  executeQuery: () => void;
  /** The user typed in the box or moved the window: the panel is theirs again. */
  onUserContextChange?: () => void;
  /** Sits inside the SQL box at its right end (e.g. the AI trigger). */
  queryExtra?: React.ReactNode;
  /** Hangs under the SQL box, as wide as it. */
  noticeBanner?: React.ReactNode;
  datasourceValue: number;
  getMode: () => string;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const [mySQLTableFields, setMySQLTableFields] = useGlobalState('mySQLTableFields');
  const form = Form.useFormInstance();
  const { extra, executeQuery, onUserContextChange, queryExtra, noticeBanner, datasourceValue, getMode } = props;
  const { darkMode } = useContext(CommonStateContext);

  return (
    <div style={{ width: '100%' }}>
      <div className='explorer-query'>
        <div className={`min-w-0 flex-1${queryExtra ? ' ai-query-dock-host' : ''}`}>
          <InputGroupWithFormItem
            label={
              <Space>
                {t('query.query')}
                <InfoCircleOutlined
                  onClick={() => {
                    DocumentDrawer({
                      darkMode,
                    });
                  }}
                />
              </Space>
            }
          >
            <div className='relative'>
              <Form.Item
                name={['query', 'query']}
                rules={[
                  {
                    required: true,
                    message: t('query.query_required'),
                  },
                ]}
              >
                <LogQL
                  datasourceCate={DatasourceCateEnum.mysql}
                  datasourceValue={datasourceValue}
                  query={{}}
                  historicalRecords={[]}
                  onPressEnter={executeQuery}
                  onChange={() => {
                    onUserContextChange?.();
                    // 在 graph 视图里 sql 修改后清空缓存的 fields
                    if (getMode() === 'graph') {
                      setMySQLTableFields([]);
                    }
                  }}
                  placeholder={t('query.query_placeholder')}
                />
              </Form.Item>
              {queryExtra ? <span className='ai-query-dock-affix absolute right-2 top-0 flex h-8 items-center'>{queryExtra}</span> : null}
            </div>
          </InputGroupWithFormItem>
          {noticeBanner}
        </div>
        <HistoricalRecords
          localKey={CACHE_KEY}
          datasourceValue={datasourceValue}
          onSelect={(query) => {
            form.setFieldsValue({
              query: {
                query,
              },
            });
            executeQuery();
          }}
        />
        <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
          <TimeRangePicker onChange={onUserContextChange} />
        </Form.Item>
        {extra}
      </div>
    </div>
  );
}
