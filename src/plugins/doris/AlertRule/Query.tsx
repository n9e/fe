import React, { useEffect, useState, useContext } from 'react';
import { Form, Select, Space, Tooltip, Alert, InputNumber, Button, Segmented, Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { SqlMonacoEditor, SqlMonacoPreview } from '@fc-components/monaco-editor';
import { WandSparkles } from 'lucide-react';

import { CommonStateContext } from '@/App';
import { IS_PLUS } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryName, { generateQueryName } from '@/components/QueryName';
import { normalizeTime } from '@/pages/alertRules/Form/utils';
import { FormStateContext } from '@/pages/alertRules/Form';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';

import { NAME_SPACE, DORIS_SQL_MODE_DOC_URL } from '../constants';
import AdvancedSettings from '../components/AdvancedSettings';
import BuilderModal from '../components/BuilderModal';
import BuilderConfigRequiredItem from '../components/BuilderConfigRequiredItem';
import GraphPreview from './GraphPreview';

interface Props {
  datasourceId: number;
  field: any;
  dbList: string[];
  disabled?: boolean;
  onClose?: () => void;
}

export default function Query(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { type } = useContext(FormStateContext);
  const { datasourceId, field, dbList, disabled, onClose } = props;
  const [sqlWarningI18nKey, setSqlWarningI18nKey] = useState<string>('');
  const [builderModalVisible, setBuilderModalVisible] = useState(false);
  const form = Form.useFormInstance();
  const queries = Form.useWatch(['rule_config', 'queries']);
  const query = queries?.[field.name];
  const editMode = query?.editMode ?? 'code';
  const sql = query?.sql;
  const database = query?.database;

  // 新增/查看规则时隐藏数据库字段；编辑/克隆规则时仅当已有数据库配置时才显示, 且仅在代码模式下显示
  const showDatabase = editMode === 'code' && (type === 1 || type === 2) ? !!database : false;

  useEffect(() => {
    if (!sql) {
      setSqlWarningI18nKey('');
      return;
    }
    // 如果查询条件中没包含关键字（不区分大小写，TIMESTAMP、DATE、INTERVAL、DATE_TRUNC、NOW()、$__timeFilter）
    const warningKeywords = ['TIMESTAMP', 'DATE', 'INTERVAL', 'DATE_TRUNC', 'NOW()', '$__timeFilter'];
    const hasKeyword = warningKeywords.some((keyword) => {
      return _.includes(_.upperCase(sql), _.upperCase(keyword));
    });
    if (!hasKeyword) {
      setSqlWarningI18nKey('query.sql_warning_1');
    } else if (_.includes(sql, '$__timeGroup')) {
      setSqlWarningI18nKey('query.sql_warning_2');
    } else {
      setSqlWarningI18nKey('');
    }
  }, [sql]);

  return (
    <CardContainer key={field.key} onClose={onClose}>
      <CardContainerHeader>
        <Form.Item {...field} name={[field.name, 'editMode']} initialValue='code' hidden>
          <input type='hidden' />
        </Form.Item>
        <Space>
          <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
            <QueryName existingNames={_.map(queries, 'ref')} />
          </Form.Item>
          {IS_PLUS && (
            <Form.Item>
              <Segmented
                value={editMode}
                disabled={disabled}
                options={[
                  { label: 'Builder', value: 'builder' },
                  { label: 'Code', value: 'code' },
                ]}
                onChange={(value) => {
                  if (value === 'builder' && editMode === 'code') {
                    const sqlValue = _.get(queries, [field.name, 'sql']);
                    if (sqlValue) {
                      Modal.confirm({
                        title: t('query.editMode.switch_to_builder_confirm_title'),
                        content: t('query.editMode.switch_to_builder_confirm_content'),
                        onOk: () => {
                          form.setFields([
                            {
                              name: ['rule_config', 'queries', field.name, 'editMode'],
                              value: 'builder',
                            },
                            {
                              name: ['rule_config', 'queries', field.name, 'sql'],
                              value: undefined,
                            },
                            {
                              name: ['rule_config', 'queries', field.name, 'builderConfig'],
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
                      name: ['rule_config', 'queries', field.name, 'editMode'],
                      value,
                    },
                  ]);
                }}
              />
            </Form.Item>
          )}
          {showDatabase && (
            <InputGroupWithFormItem label={t('query.database')}>
              <Form.Item {...field} name={[field.name, 'database']}>
                <Select style={{ width: 200 }} disabled={disabled}>
                  {dbList.map((db) => (
                    <Select.Option key={db} value={db}>
                      {db}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </InputGroupWithFormItem>
          )}
          <InputGroupWithFormItem
            label={
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
            addonAfter={
              <Form.Item {...field} name={[field.name, 'interval_unit']} initialValue='min'>
                <Select disabled={disabled} dropdownMatchSelectWidth={false}>
                  <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                  <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                  <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                </Select>
              </Form.Item>
            }
          >
            <Form.Item {...field} name={[field.name, 'interval']}>
              <InputNumber disabled={disabled} style={{ width: 80 }} min={0} />
            </Form.Item>
          </InputGroupWithFormItem>
        </Space>
      </CardContainerHeader>
      {editMode === 'builder' && (
        <div className='mb-4'>
          {sql && (
            <CardContainer className='mb-4 bg-fc-150'>
              <SqlMonacoPreview theme={darkMode ? 'dark' : 'light'} value={sql} />
            </CardContainer>
          )}
          <Tooltip title={!datasourceId ? t('query.datasource_disabled_tip') : undefined}>
            <Button
              disabled={disabled || !datasourceId}
              onClick={() => {
                setBuilderModalVisible(true);
              }}
            >
              {t('builder.open_builder')}
            </Button>
          </Tooltip>
          <BuilderConfigRequiredItem name={[field.name, 'builderConfig']} message={t('builder.config_required')} />
          <Form.Item name={[field.name, 'sql']} hidden rules={[{ required: true, message: t('datasource:query.query_required') }]}>
            <input type='hidden' />
          </Form.Item>
          <BuilderModal
            visible={builderModalVisible}
            datasourceId={datasourceId}
            builderConfig={query?.builderConfig}
            onCancel={() => {
              setBuilderModalVisible(false);
            }}
            onConfirm={(builderConfig, res) => {
              form.setFields([
                {
                  name: ['rule_config', 'queries', field.name, 'sql'],
                  value: res.sql,
                },
                {
                  name: ['rule_config', 'queries', field.name, 'builderConfig'],
                  value: builderConfig,
                  errors: [],
                },
                {
                  name: ['rule_config', 'queries', field.name, 'keys', 'valueKey'],
                  value: res.value_key,
                },
                {
                  name: ['rule_config', 'queries', field.name, 'keys', 'labelKey'],
                  value: res.label_key,
                },
              ]);
              setBuilderModalVisible(false);
            }}
          />
        </div>
      )}
      {editMode === 'code' && (
        <InputGroupWithFormItem
          label={
            <Space>
              SQL
              <Tooltip
                overlayClassName='ant-tooltip-with-link ant-tooltip-auto-width'
                title={
                  <Trans
                    ns='db_doris'
                    i18nKey='query.query_tip'
                    components={{
                      br: <br />,
                      a: <a href={DORIS_SQL_MODE_DOC_URL} target='_blank' />,
                    }}
                  />
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
        >
          <Form.Item
            {...field}
            name={[field.name, 'sql']}
            validateTrigger={['onBlur']}
            trigger='onChange'
            rules={[{ required: true, message: t('datasource:query.query_required') }]}
          >
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
      <AdvancedSettings prefixField={field} prefixName={[field.name]} disabled={disabled} showUnit={IS_PLUS} showOffset span={6} expanded />
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const cate = getFieldValue('cate');
          const sql = getFieldValue(['rule_config', 'queries', field.name, 'sql']);
          const database = getFieldValue(['rule_config', 'queries', field.name, 'database']);
          const interval = getFieldValue(['rule_config', 'queries', field.name, 'interval']);
          const interval_unit = getFieldValue(['rule_config', 'queries', field.name, 'interval_unit']);
          const intervalValue = normalizeTime(interval, interval_unit);
          const offset = getFieldValue(['rule_config', 'queries', field.name, 'offset']);

          return <GraphPreview cate={cate} datasourceValue={datasourceId} sql={sql} database={database} interval={intervalValue} offset={offset} />;
        }}
      </Form.Item>
    </CardContainer>
  );
}
