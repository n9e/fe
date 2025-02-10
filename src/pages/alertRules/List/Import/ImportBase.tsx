/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Input, Form, Table, Button, Divider, message, Select, Switch, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { importStrategy } from '@/services/warning';
import DatasourceValueSelectV2 from '@/pages/alertRules/Form/components/DatasourceValueSelect/V2';

export default function ImportBase({ busiId, onOk, groupedDatasourceList, reloadGroupedDatasourceList, datasourceCateOptions }) {
  const { t } = useTranslation('alertRules');
  const [importResult, setImportResult] = useState<{ name: string; msg: string }[]>();
  const datasourceCates = _.filter(datasourceCateOptions, (item) => !!item.alertRule);
  const [allowSubmit, setAllowSubmit] = React.useState(true);
  const [form] = Form.useForm();
  const datasourceCate = Form.useWatch('datasource_cate', form);
  const importContent = Form.useWatch('import', form);

  useEffect(() => {
    if (importContent) {
      try {
        const parsed = JSON.parse(importContent);
        const dataList = _.isArray(parsed) ? parsed : [parsed];
        const cates = _.union(
          _.map(
            _.filter(dataList, (item) => {
              return item.cate !== 'host';
            }),
            (item) => item.cate,
          ),
        );
        if (cates.length === 1) {
          form.setFieldsValue({
            datasource_cate: cates[0],
          });
          setAllowSubmit(true);
          return;
        } else if (cates.length > 1) {
          setAllowSubmit(false);
        }
        form.setFieldsValue({
          datasource_cate: undefined,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [importContent]);

  return (
    <>
      <Form
        form={form}
        layout='vertical'
        onFinish={async (vals) => {
          try {
            const importData = _.map(JSON.parse(vals.import), (item) => {
              return {
                ...item,
                cate: item.cate === 'host' ? 'host' : vals.datasource_cate,
                datasource_queries: vals?.datasource_queries,
                disabled: vals.enabled ? 0 : 1,
              };
            });
            const { dat } = await importStrategy(importData, busiId);
            const dataSource = _.map(dat, (val, key) => {
              return {
                name: key,
                msg: val,
              };
            });
            setImportResult(dataSource);
            if (_.every(dataSource, (item) => !item.msg)) {
              message.success(t('common:success.import'));
              onOk();
            }
          } catch (error) {
            message.error(t('common:error.import') + error);
          }
        }}
        initialValues={{
          enabled: false,
        }}
      >
        {!allowSubmit && <Alert className='mb1' message={t('builtInComponents:import_to_buisGroup_invaild')} type='error' showIcon />}
        <Form.Item
          label={`${t('batch.import.name')} JSON`}
          name='import'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.TextArea className='code-area' rows={16} />
        </Form.Item>
        {importContent && (
          <>
            <Form.Item label={t('common:datasource.type')} name='datasource_cate' hidden={!datasourceCate}>
              <Select disabled>
                {_.map(datasourceCates, (item) => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            {datasourceCate && (
              <DatasourceValueSelectV2
                datasourceCate={datasourceCate}
                datasourceList={groupedDatasourceList[datasourceCate] || []}
                reloadGroupedDatasourceList={reloadGroupedDatasourceList}
              />
            )}
            <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
              <Switch />
            </Form.Item>
          </>
        )}
        <Form.Item>
          <Button type='primary' htmlType='submit' disabled={!allowSubmit}>
            {t('common:btn.import')}
          </Button>
        </Form.Item>
      </Form>
      {importResult && (
        <>
          <Divider />
          <Table
            className='samll_table'
            dataSource={importResult}
            columns={[
              {
                title: t('batch.import.name'),
                dataIndex: 'name',
              },
              {
                title: t('batch.import.result'),
                dataIndex: 'msg',
                render: (data) => {
                  return !data ? <CheckCircleOutlined style={{ color: '#389e0d', fontSize: '18px' }} /> : <CloseCircleOutlined style={{ color: '#d4380d', fontSize: '18px' }} />;
                },
              },
              {
                title: t('batch.import.errmsg'),
                dataIndex: 'msg',
              },
            ]}
            pagination={false}
            size='small'
          />
        </>
      )}
    </>
  );
}
