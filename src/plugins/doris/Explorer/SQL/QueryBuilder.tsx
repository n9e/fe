import React, { useContext } from 'react';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { Form, Space, Tooltip } from 'antd';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import LogQL from '@/components/LogQL';
import { DatasourceCateEnum } from '@/utils/constant';
import HistoricalRecords from '@/components/HistoricalRecords';
import DocumentDrawer from '@/components/DocumentDrawer';

import { SQL_CACHE_KEY, NAME_SPACE } from '../../constants';

interface Props {
  extra?: React.ReactNode;
  executeQuery: () => void;
  datasourceValue: number;
  labelInfo?: React.ReactNode;
  submode: string;
}

export default function QueryBuilder(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { logsDefaultRange, darkMode } = useContext(CommonStateContext);
  const form = Form.useFormInstance();
  const { extra, executeQuery, datasourceValue, labelInfo, submode } = props;

  return (
    <div style={{ width: '100%' }}>
      <div className='explorer-query'>
        <InputGroupWithFormItem
          label={
            <Space>
              {t('query.query')}
              {labelInfo}
            </Space>
          }
        >
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
              key={submode}
              datasourceCate={DatasourceCateEnum.doris}
              datasourceValue={datasourceValue}
              query={{}}
              historicalRecords={[]}
              onPressEnter={executeQuery}
              placeholder={
                submode === 'raw'
                  ? 'SELECT count(*) as count FROM db_name.table_name WHERE $__timeFilter(timestamp)'
                  : 'SELECT count(*) as cnt, $__timeGroup(timestamp, 1m) as time FROM db_name.table_name WHERE $__timeFilter(timestamp) GROUP BY time ORDER BY time'
              }
            />
          </Form.Item>
        </InputGroupWithFormItem>
        <HistoricalRecords
          localKey={SQL_CACHE_KEY}
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
        <Tooltip
          overlayClassName='ant-tooltip-with-link ant-tooltip-auto-width'
          title={
            <Trans
              ns={NAME_SPACE}
              i18nKey='query.time_field_tip'
              components={{
                span: (
                  <span
                    style={{
                      color: 'var(--fc-orange-5-color)',
                    }}
                  />
                ),
                br: <br />,
                a: (
                  <a
                    onClick={() => {
                      DocumentDrawer({
                        language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                        darkMode,
                        title: t('common:document_link'),
                        type: 'iframe',
                        documentPath: `/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/`,
                        anchor: '#2-时间宏',
                      });
                    }}
                  />
                ),
              }}
            />
          }
        >
          <Form.Item name={['query', 'range']} initialValue={logsDefaultRange}>
            <TimeRangePicker />
          </Form.Item>
        </Tooltip>
        {extra}
      </div>
    </div>
  );
}
