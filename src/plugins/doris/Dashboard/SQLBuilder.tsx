import React, { useContext, useState, useRef } from 'react';
import { Form, Select, Row, Col, Space, Modal, Button, Alert } from 'antd';
import { InfoCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { copy2ClipBoard } from '@/utils';
import { DatasourceCateEnum } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';
import LogQL from '@/components/LogQL';

import { NAME_SPACE } from '../constants';
import AdvancedSettings from '../components/AdvancedSettings';
import LegendInput from '../components/LegendInput';

interface Props {
  field: any;
  datasourceValue: number;
  mode: string;
}

export default function SQLBuilder(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { field, datasourceValue, mode } = props;
  const [queryWarnModalVisible, setQueryWarnModalVisible] = useState(false);
  const queryValueRef = useRef<string>();
  const chartForm = Form.useFormInstance();
  const type = Form.useWatch('type');

  return (
    <>
      <Form.Item
        className='n9e-doris-dashboard-querybuilder-query-item'
        label={
          <div className='w-full flex justify-between'>
            <Space>
              {t('query.query')}
              <InfoCircleOutlined
                onClick={() => {
                  DocumentDrawer({
                    language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                    darkMode,
                    title: t('common:document_link'),
                    type: 'iframe',
                    documentPath: `/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/`,
                    anchor: '#时间宏',
                  });
                }}
              />
            </Space>
            <Form.Item name={[field.name, 'query', 'mode']} initialValue={type === 'timeseries' ? 'timeSeries' : 'raw'} noStyle>
              <Select>
                <Select.Option value='timeSeries'>{t('query.dashboard.mode.timeSeries')}</Select.Option>
                <Select.Option value='raw'>{t('query.dashboard.mode.table')}</Select.Option>
              </Select>
            </Form.Item>
          </div>
        }
        {...field}
        name={[field.name, 'query', 'query']}
        validateTrigger={['onBlur']}
        rules={[
          {
            required: true,
            message: t('query.query_required'),
          },
        ]}
        style={{ flex: 1 }}
      >
        <LogQL
          key={mode}
          datasourceCate={DatasourceCateEnum.doris}
          datasourceValue={datasourceValue}
          query={{}}
          historicalRecords={[]}
          validateTrigger={[]}
          placeholder={
            mode === 'raw'
              ? 'SELECT count(*) as count FROM db_name.table_name WHERE $__timeFilter(timestamp)'
              : 'SELECT count(*) as count, $__timeGroup(timestamp, $__interval) as time FROM db_name.table_name WHERE $__timeFilter(`timestamp`) GROUP BY time'
          }
          validateBeforeChange={(val) => {
            if (val && !val.includes('$__time') && !val.includes('$__unixEpoch')) {
              queryValueRef.current = val;
              setQueryWarnModalVisible(true);
              return false;
            }
            return true;
          }}
        />
      </Form.Item>
      {mode === 'timeSeries' && <AdvancedSettings span={8} prefixField={field} prefixName={[field.name, 'query']} expanded />}
      <Row gutter={10}>
        <Col flex='auto'>
          <Form.Item
            label='Legend'
            {...field}
            name={[field.name, 'legend']}
            tooltip={{
              getPopupContainer: () => document.body,
              title: t('dashboard:query.legendTip2', {
                interpolation: { skipOnVariables: true },
              }),
            }}
          >
            <LegendInput />
          </Form.Item>
        </Col>
      </Row>
      <Modal
        width={700}
        visible={queryWarnModalVisible}
        footer={[
          <Button
            key='ok'
            onClick={() => {
              setQueryWarnModalVisible(false);
              chartForm.setFields([
                {
                  name: ['targets', field.name, 'query', 'query'],
                  value: queryValueRef.current,
                },
              ]);
            }}
          >
            {t('query.warn_message_btn_1')}
          </Button>,
          <Button
            key='cancel'
            type='primary'
            onClick={() => {
              setQueryWarnModalVisible(false);
              queryValueRef.current = undefined;
            }}
          >
            {t('query.warn_message_btn_2')}
          </Button>,
        ]}
        onCancel={() => {
          setQueryWarnModalVisible(false);
          queryValueRef.current = undefined;
        }}
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
                      documentPath: `/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/`,
                      anchor: '#时间宏',
                    });
                  }}
                />
              ),
            }}
          />
        </div>
      </Modal>
    </>
  );
}
