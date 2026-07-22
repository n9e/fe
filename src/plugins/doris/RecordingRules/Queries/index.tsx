import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Form, Space, Input, Tooltip, InputNumber, Select, Alert, Button, Segmented, Modal } from 'antd';
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { SqlMonacoEditor, SqlMonacoPreview } from '@fc-components/monaco-editor';
import { WandSparkles } from 'lucide-react';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import DocumentDrawer from '@/components/DocumentDrawer';
import { normalizeTime } from '@/pages/alertRules/Form/utils';
import CardContainer from '@/pages/alertRules/FormNG/components/CardContainer';

import AdvancedSettings from '../../components/AdvancedSettings';
import BuilderModal from '../../components/BuilderModal';
import BuilderConfigRequiredItem from '../../components/BuilderConfigRequiredItem';
import GraphPreview from '../../AlertRule/GraphPreview';
import { NAME_SPACE, DORIS_SQL_MODE_DOC_URL } from '../../constants';

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
  const form = Form.useFormInstance();
  const query = Form.useWatch([...prefixPath, 'config']);
  const editMode = query?.editMode ?? 'code';
  const [builderModalVisible, setBuilderModalVisible] = useState(false);
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
      <div className='mb-4'>
        <Form.Item {...field} name={[...path, 'editMode']} initialValue='code' hidden>
          <input type='hidden' />
        </Form.Item>
        <Space>
          <Segmented
            value={editMode}
            options={[
              { label: 'Builder', value: 'builder' },
              { label: 'Code', value: 'code' },
            ]}
            onChange={(value) => {
              if (value === 'builder' && editMode === 'code') {
                const sqlValue = _.get(query, 'sql');
                if (sqlValue) {
                  Modal.confirm({
                    title: t('query.editMode.switch_to_builder_confirm_title'),
                    content: t('query.editMode.switch_to_builder_confirm_content'),
                    onOk: () => {
                      form.setFields([
                        {
                          name: [...prefixPath, 'config', 'editMode'],
                          value: 'builder',
                        },
                        {
                          name: [...prefixPath, 'config', 'sql'],
                          value: undefined,
                        },
                        {
                          name: [...prefixPath, 'config', 'builderConfig'],
                          value: undefined,
                        },
                      ]);
                    },
                  });
                  return;
                }
              }
              form.setFields([
                {
                  name: [...prefixPath, 'config', 'editMode'],
                  value,
                },
              ]);
            }}
          />
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
        </Space>
      </div>
      {editMode === 'code' && (
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
                    documentPath: DORIS_SQL_MODE_DOC_URL,
                  });
                }}
              />
            </Space>
          }
        >
          <Form.Item {...field} name={[...path, 'sql']}>
            <SqlMonacoEditor
              disabled={disabled}
              maxHeight={200}
              placeholder={t('query.query_placeholder')}
              theme={darkMode ? 'dark' : 'light'}
              enableAutocomplete={true}
              enableFormat
              renderFormatButton={() => {
                return (
                  <Tooltip title={t('common:format_sql')}>
                    <Button size='small' type='text' icon={<WandSparkles size={12} strokeWidth={1} />} />
                  </Tooltip>
                );
              }}
            />
          </Form.Item>
        </InputGroupWithFormItem>
      )}
      {editMode === 'builder' && (
        <div className='mb-4'>
          {query?.sql && (
            <CardContainer className='mb-4 bg-fc-150'>
              <SqlMonacoPreview theme={darkMode ? 'dark' : 'light'} value={query.sql} />
            </CardContainer>
          )}
          <Tooltip title={!datasourceValue ? t('query.datasource_disabled_tip') : undefined}>
            <Button
              disabled={!datasourceValue}
              onClick={() => {
                setBuilderModalVisible(true);
              }}
            >
              {t('builder.open_builder')}
            </Button>
          </Tooltip>
          <BuilderConfigRequiredItem name={[...path, 'builderConfig']} message={t('builder.config_required')} />
          <Form.Item name={[...path, 'sql']} hidden rules={[{ required: true, message: t('query.query_required') }]}>
            <input type='hidden' />
          </Form.Item>
          <BuilderModal
            visible={builderModalVisible}
            datasourceId={datasourceValue}
            builderConfig={query?.builderConfig}
            onCancel={() => {
              setBuilderModalVisible(false);
            }}
            onConfirm={(builderConfig, res) => {
              form.setFields([
                {
                  name: [...prefixPath, 'config', 'sql'],
                  value: res.sql,
                },
                {
                  name: [...prefixPath, 'config', 'builderConfig'],
                  value: builderConfig,
                  errors: [],
                },
                {
                  name: [...prefixPath, 'config', 'keys', 'valueKey'],
                  value: res.value_key,
                },
                {
                  name: [...prefixPath, 'config', 'keys', 'labelKey'],
                  value: res.label_key,
                },
              ]);
              setBuilderModalVisible(false);
            }}
          />
        </div>
      )}
      {sqlWarningI18nKey && (
        <Alert
          className='mb-4'
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
      <AdvancedSettings prefixField={field} prefixName={path} disabled={disabled} expanded showOffset span={8} />
      <GraphPreview cate={cate} datasourceValue={datasourceValue} sql={query?.sql} interval={intervalValue} offset={query?.offset} />
    </>
  );
}
