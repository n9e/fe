/**
 * 单行日志的展示组件
 * 用于 Raw 组件中展开单行日志的展示
 */

import React, { useState, useMemo, useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Table, Tabs, Tooltip } from 'antd';
import { CopyOutlined, QuestionOutlined } from '@ant-design/icons';
import moment from 'moment';

import { copyToClipBoard } from '@/utils';
import getTextWidth from '@/utils/getTextWidth';
import { parseRange } from '@/components/TimeRangePicker';

import { NAME_SPACE } from '../../../constants';
import { TYPE_MAP } from '../../FieldsList/constants';
import { typeIconMap } from '../../FieldsList/FieldsItem';
import { OnValueFilterParams } from '../types';
import { LogsViewerStateContext } from '../index';
import LogFieldValue from './LogFieldValue';
import HighLightJSON from './HighLightJSON';

interface Props {
  id_key: string;
  raw_key: string;
  value: Record<string, any>;
  rawValue?: Record<string, any>;
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  logViewerFilterFields?: (log: Record<string, any>) => string[];
  logViewerRenderCustomTagsArea?: (log: Record<string, any>) => React.ReactNode;
}

export default function LogView(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { fieldConfig, range, indexData } = useContext(LogsViewerStateContext);
  const { raw_key, id_key, value, rawValue = value, onValueFilter, logViewerFilterFields, logViewerRenderCustomTagsArea } = props;
  const [type, setType] = useState<string>('table');
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;
  const log = _.omit(value, [id_key, raw_key]);
  const data = useMemo(() => {
    const fields = logViewerFilterFields ? logViewerFilterFields(log) : _.keys(log);
    return _.map(fields, (key) => {
      return {
        field: key,
        value: log[key],
      };
    });
  }, [log]);

  const maxFieldLength = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map((item) => getTextWidth(item.field)));
  }, [data]);

  let jsonValue = '';
  try {
    jsonValue = JSON.stringify(value[raw_key], null, 4);
  } catch (e) {
    console.warn(e);
    jsonValue = '无法解析';
  }

  return (
    <div
      className='flex flex-col'
      style={{
        height: 'calc(100% - 20px)',
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {logViewerRenderCustomTagsArea && <div className='mb-2'>{logViewerRenderCustomTagsArea(log)}</div>}
      <Tabs
        className='min-h-0 flex flex-col n9e-log-explorer-log-viewer-tabs'
        activeKey={type}
        onChange={(val) => {
          setType(val);
        }}
        size='small'
        tabBarExtraContent={
          <Space
            onClick={() => {
              copyToClipBoard(jsonValue);
            }}
            style={{ cursor: 'pointer' }}
          >
            <CopyOutlined />
            {t('copy_to_clipboard')}
          </Space>
        }
      >
        <Tabs.TabPane tab='Table' key='table'>
          <div className='h-full overflow-auto'>
            <Table
              showHeader={false}
              rowKey='field'
              tableLayout='fixed'
              dataSource={data}
              columns={[
                {
                  title: 'Field',
                  dataIndex: 'field',
                  key: 'field',
                  width: maxFieldLength + 16 + 16 + 8, // 16px 是 padding, 16px 是图标宽度, 8px 容错
                  render: (val) => {
                    const fieldObject = _.find(indexData, (item) => item.field === val);
                    return (
                      <Tooltip
                        placement='left'
                        title={
                          fieldObject?.type2 ? (
                            <div className='break-all'>
                              <Space align='start'>
                                <span className='whitespace-nowrap'>{t('field_type')}:</span>
                                {fieldObject.type2}
                              </Space>
                            </div>
                          ) : undefined
                        }
                      >
                        <Space>
                          <span className='w-[16px] h-[16px] flex-shrink-0 bg-fc-200 rounded flex justify-center items-center'>
                            {fieldObject ? typeIconMap[TYPE_MAP[fieldObject.type]] ?? <QuestionOutlined /> : <QuestionOutlined />}
                          </span>
                          <span>{val}</span>
                        </Space>
                      </Tooltip>
                    );
                  },
                },
                {
                  title: 'Value',
                  dataIndex: 'value',
                  key: 'value',
                  render: (val, record) => {
                    return <LogFieldValue name={record.field} value={val} onTokenClick={onValueFilter} rawValue={rawValue} fieldValueClassName='whitespace-pre-wrap' />;
                  },
                },
              ]}
              size='small'
              pagination={false}
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab='JSON' key='json'>
          <div className='h-full overflow-auto'>
            <HighLightJSON value={value[raw_key]} query={{ start, end }} urlTemplates={fieldConfig?.linkArr} extractArr={fieldConfig?.regExtractArr} />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
