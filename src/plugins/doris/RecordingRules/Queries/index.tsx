import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Form, Row, Col, Space, Input, Tooltip, InputNumber, Select, Alert } from 'antd';
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import DocumentDrawer from '@/components/DocumentDrawer';
import { normalizeTime } from '@/pages/alertRules/Form/utils';

import AdvancedSettings from '../../components/AdvancedSettings';
import GraphPreview from '../../AlertRule/GraphPreview';
import { NAME_SPACE } from '../../constants';

interface IProps {
  datasourceValue: number;
  field: any;
  prefixPath: (string | number)[];
  path: (string | number)[];
}

export default function index(props: IProps) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { datasourceValue, field, prefixPath } = props;
  const disabled = false;
  const cate = DatasourceCateEnum.doris;
  const path = [field.name, 'config'];
  const query = Form.useWatch([...prefixPath, 'config']);
  const intervalValue = useMemo(() => {
    if (!query) {
      return undefined;
    }
    return normalizeTime(query.interval, query.interval_unit);
  }, [query?.interval, query?.interval_unit]);
  const [sqlWarningI18nKey, setSqlWarningI18nKey] = useState<string>('');

  useEffect(() => {
    if (!query?.sql) {
      setSqlWarningI18nKey('');
      return;
    }
    // 如果查询条件中没包含关键字（不区分大小写，TIMESTAMP、DATE、INTERVAL、DATE_TRUNC、NOW()、$__timeFilter）
    const warningKeywords = ['TIMESTAMP', 'DATE', 'INTERVAL', 'DATE_TRUNC', 'NOW()', '$__timeFilter'];
    const hasKeyword = warningKeywords.some((keyword) => {
      return _.includes(_.upperCase(query.sql), _.upperCase(keyword));
    });
    if (!hasKeyword) {
      setSqlWarningI18nKey('query.sql_warning_1');
    } else if (_.includes(query.sql, '$__timeGroup')) {
      setSqlWarningI18nKey('query.sql_warning_2');
    } else {
      setSqlWarningI18nKey('');
    }
  }, [query?.sql]);

  return (
    <>
      {sqlWarningI18nKey && (
        <Alert
          className='mb-2'
          type='warning'
          message={
            <Trans
              ns={NAME_SPACE}
              i18nKey={sqlWarningI18nKey}
              components={{
                b: <strong />,
              }}
            />
          }
        />
      )}
      <Row gutter={8} wrap={false}>
        <Col flex='auto' style={{ minWidth: 0 }}>
          <InputGroupWithFormItem
            label={
              <Space>
                {t('query.query')}
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
          >
            <Form.Item {...field} name={[...path, 'sql']}>
              <SqlMonacoEditor disabled={disabled} maxHeight={200} placeholder={t('query.query_placeholder')} theme={darkMode ? 'dark' : 'light'} enableAutocomplete={true} />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
          <Input.Group>
            <span className='ant-input-group-addon'>
              {
                <Space>
                  {t('query.interval')}
                  <Tooltip
                    title={
                      <Trans
                        ns={NAME_SPACE}
                        i18nKey='query.interval_tip'
                        components={{
                          br: <br />,
                        }}
                      />
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
            </span>
            <Form.Item {...field} name={[...path, 'interval']} noStyle initialValue={1}>
              <InputNumber disabled={disabled} style={{ width: 80 }} min={0} />
            </Form.Item>
            <span className='ant-input-group-addon'>
              <Form.Item {...field} name={[...path, 'interval_unit']} noStyle initialValue='min'>
                <Select disabled={disabled}>
                  <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                  <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                  <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                </Select>
              </Form.Item>
            </span>
          </Input.Group>
        </Col>
      </Row>
      <AdvancedSettings prefixField={field} prefixName={path} disabled={disabled} expanded showOffset span={8} />
      <GraphPreview cate={cate} datasourceValue={datasourceValue} sql={query?.sql} interval={intervalValue} offset={query?.offset} />
    </>
  );
}
