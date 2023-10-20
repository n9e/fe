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
import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Form, Table, Button, Divider, message, Select, Row, Col, Switch } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { importStrategy } from '@/services/warning';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';

interface IProps {
  busiId: number;
  refreshList: () => void;
  groupedDatasourceList: any;
  datasourceCateOptions: any;
}

function Import(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('alertRules');
  const { visible, destroy, busiId, refreshList, groupedDatasourceList, datasourceCateOptions } = props;
  const [importResult, setImportResult] = useState<{ name: string; msg: string }[]>();
  const datasourceCates = _.filter(datasourceCateOptions, (item) => !!item.alertRule);

  return (
    <Modal
      className='dashboard-import-modal'
      title={`${t('batch.import.title')} JSON`}
      visible={visible}
      onCancel={() => {
        refreshList();
        destroy();
      }}
      footer={null}
    >
      <Form
        layout='vertical'
        onFinish={async (vals) => {
          try {
            const importData = _.map(JSON.parse(vals.import), (item) => {
              return {
                ...item,
                cate: vals.cate,
                datasource_ids: vals.datasource_ids,
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
              refreshList();
              destroy();
            }
          } catch (error) {
            message.error(t('common:error.import') + error);
          }
        }}
        initialValues={{
          cate: 'prometheus',
          datasource_ids: [0],
          enabled: false,
        }}
      >
        <Row gutter={10}>
          <Col span={24}>
            <Form.Item label={t('common:datasource.type')} name='cate'>
              <Select>
                {_.map(datasourceCates, (item) => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
              {({ getFieldValue, setFieldsValue }) => {
                const cate = getFieldValue('cate');
                return <DatasourceValueSelect mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} />;
              }}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
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
        <Form.Item>
          <Button type='primary' htmlType='submit'>
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
    </Modal>
  );
}

export default ModalHOC(Import);
