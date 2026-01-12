import React, { useContext, useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Col, Row, Form, Space, Tooltip, Modal, Alert } from 'antd';
import { InfoCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { useSize } from 'ahooks';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';
import { copy2ClipBoard } from '@/utils';
import TimeRangePicker from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import DocumentDrawer from '@/components/DocumentDrawer';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { getOrganizeFieldsFromLocalstorage } from '../../utils/organizeFieldsLocalstorage';
import { NAME_SPACE } from '../../../constants';
import QueryInput from '../../components/QueryInput';
import MainMoreOperations from '../../components/MainMoreOperations';
import QueryInputAddonAfter from './QueryInputAddonAfter';
import Raw from './Raw';
import Timeseries from './Timeseries';

interface Props {
  tabKey: string;
  datasourceValue: number;
  organizeFields: string[];
  setOrganizeFields: (value: string[], setLocalstorage?: boolean) => void;
  executeQuery: () => void;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { logsDefaultRange, darkMode } = useContext(CommonStateContext);
  const { tabKey, datasourceValue, organizeFields, setOrganizeFields, executeQuery } = props;
  const form = Form.useFormInstance();
  const submode = Form.useWatch(['query', 'submode']);
  const [executeLoading, setExecuteLoading] = React.useState(false);
  const [queryWarnModalVisible, setQueryWarnModalVisible] = useState(false);
  const [rangeTooltipVisible, setRangeTooltipVisible] = useState(false);
  const timeRangeOpenRef = React.useRef<boolean>(false);
  const timeSeriesEleRef = React.useRef<HTMLDivElement>(null);
  const timeSeriesEleSize = useSize(timeSeriesEleRef);
  const handleExecuteQuery = () => {
    const queryValue = form.getFieldValue(['query', 'query']);
    // 如果 queryValue 里未包含关键字：$__time 或 $__unixEpoch，触发查询时阻断弹窗
    if (!queryValue.includes('$__time') && !queryValue.includes('$__unixEpoch')) {
      setQueryWarnModalVisible(true);
      return;
    }
    executeQuery();
  };

  useEffect(() => {
    if (datasourceValue) {
      setOrganizeFields(
        getOrganizeFieldsFromLocalstorage({
          datasourceValue,
          mode: 'sql',
        }),
        false,
      );
    }
  }, [datasourceValue]);

  return (
    <div className='flex flex-col h-full'>
      <Row gutter={SIZE} className='flex-shrink-0'>
        <Col flex='auto'>
          <InputGroupWithFormItem
            label={
              <Space>
                {t(`${logExplorerNS}:query`)}
                <InfoCircleOutlined
                  onClick={() => {
                    DocumentDrawer({
                      language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                      darkMode,
                      title: t('common:document_link'),
                      type: 'iframe',
                      documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/',
                    });
                  }}
                />
              </Space>
            }
            addonAfter={<QueryInputAddonAfter executeQuery={handleExecuteQuery} />}
          >
            <Form.Item name={['query', 'query']}>
              <QueryInput
                onChange={() => {
                  handleExecuteQuery();
                }}
                placeholder={
                  submode === 'raw'
                    ? 'SELECT count(*) as count FROM db_name.table_name WHERE $__timeFilter(timestamp)'
                    : 'SELECT count(*) as cnt, $__timeGroup(timestamp, 1m) as time FROM db_name.table_name WHERE $__timeFilter(timestamp) GROUP BY time ORDER BY time DESC'
                }
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
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
                          documentPath: `https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/`,
                          anchor: '#2-时间宏',
                        });
                      }}
                    />
                  ),
                }}
              />
            }
            visible={rangeTooltipVisible}
            onVisibleChange={(newVisible) => {
              if (timeRangeOpenRef.current) {
                setRangeTooltipVisible(false);
              } else {
                setRangeTooltipVisible(newVisible);
              }
            }}
          >
            <Form.Item name={['query', 'range']} initialValue={logsDefaultRange}>
              <TimeRangePicker
                onChange={handleExecuteQuery}
                onVisibleChange={(visible) => {
                  timeRangeOpenRef.current = visible;
                  if (visible) {
                    setRangeTooltipVisible(false);
                  }
                }}
              />
            </Form.Item>
          </Tooltip>
        </Col>
        <Col flex='none'>
          <Button type='primary' onClick={handleExecuteQuery} loading={executeLoading}>
            {t(`${logExplorerNS}:execute`)}
          </Button>
        </Col>
        <Col flex='none'>
          <MainMoreOperations />
        </Col>
      </Row>
      {submode === 'raw' && <Raw tabKey={tabKey} organizeFields={organizeFields} setOrganizeFields={setOrganizeFields} setExecuteLoading={setExecuteLoading} />}
      {submode === 'timeSeries' && (
        <div ref={timeSeriesEleRef} className='w-full h-full min-h-0'>
          {timeSeriesEleSize?.width && <Timeseries width={timeSeriesEleSize.width} setExecuteLoading={setExecuteLoading} />}
        </div>
      )}
      <Modal
        width={700}
        visible={queryWarnModalVisible}
        footer={[
          <Button
            key='ok'
            onClick={() => {
              setQueryWarnModalVisible(false);
              executeQuery();
            }}
          >
            {t('query.warn_message_btn_1')}
          </Button>,
          <Button
            key='cancel'
            type='primary'
            onClick={() => {
              setQueryWarnModalVisible(false);
            }}
          >
            {t('query.warn_message_btn_2')}
          </Button>,
        ]}
        onCancel={() => setQueryWarnModalVisible(false)}
      >
        <Alert className='mt-4 mb-4' type='warning' showIcon message={t('query.warn_message')} />
        <div className='mb-4'>{t('query.warn_message_content_1')}</div>
        <div className='mb-2'>{t('query.warn_message_content_2')}</div>
        <div className='mb-2'>
          <div>
            <Space>
              <code>{`$__timeFilter(dateColumn)`}</code>
              <CopyOutlined
                onClick={() => {
                  copy2ClipBoard(`$__timeFilter(dateColumn)`);
                }}
              />
            </Space>
          </div>
          <div>
            <Space>
              <code>{`$__unixEpochFilter(dateColumn) `}</code>
              <CopyOutlined
                onClick={() => {
                  copy2ClipBoard(`$__unixEpochFilter(dateColumn) `);
                }}
              />
            </Space>
          </div>
          <div>
            <Space>
              <code>{`$__unixEpochNanoFilter(dateColumn)`}</code>
              <CopyOutlined
                onClick={() => {
                  copy2ClipBoard(`$__unixEpochNanoFilter(dateColumn)`);
                }}
              />
            </Space>
          </div>
        </div>
        <div className='mb-2'>
          {t('query.warn_message_content_3')}
          <Space>
            <code>
              {`SELECT count(*) as count FROM db_name.table_name `}
              <span
                style={{
                  color: 'var(--fc-orange-5-color)',
                }}
              >{`WHERE $__timeFilter(timestamp) `}</span>
            </code>
            <CopyOutlined
              onClick={() => {
                copy2ClipBoard(`SELECT count(*) as count FROM db_name.table_name WHERE $__timeFilter(timestamp)`);
              }}
            />
          </Space>
        </div>
        <div>
          <Trans
            ns={NAME_SPACE}
            i18nKey='query.warn_message_content_4'
            components={{
              a: (
                <a
                  onClick={() => {
                    DocumentDrawer({
                      language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                      darkMode,
                      title: t('common:document_link'),
                      type: 'iframe',
                      documentPath: `https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/`,
                      anchor: '#2-时间宏',
                    });
                  }}
                />
              ),
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
