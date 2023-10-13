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
import React, { useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Form, Button, Select, Row, Col, Switch, message } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import { CommonStateContext } from '@/App';
import { createRule } from './services';

interface IProps {
  data: any;
  busiGroups: any;
  groupedDatasourceList: any;
}

function Import(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('alertRulesBuiltin');
  const { visible, destroy, data, busiGroups, groupedDatasourceList } = props;
  const { datasourceCateOptions } = useContext(CommonStateContext);
  const datasourceCates = _.filter(datasourceCateOptions, (item) => _.includes(item.type, 'metric'));

  return (
    <Modal
      className='dashboard-import-modal'
      title={t('common:btn.clone')}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      <Form
        layout='vertical'
        initialValues={{
          import: data,
          cate: 'prometheus',
          datasource_ids: [0],
          enabled: false,
        }}
        onFinish={(vals) => {
          let data: any[] = [];
          try {
            data = JSON.parse(vals.import);
            if (!_.isArray(data)) {
              data = [data];
            }
            data = _.map(data, (item) => {
              const record = _.omit(item, ['id', 'group_id', 'create_at', 'create_by', 'update_at', 'update_by']);
              return {
                ...record,
                cate: vals.cate,
                datasource_ids: vals.datasource_ids,
                disabled: vals.enabled ? 0 : 1,
              };
            });
          } catch (e) {
            message.error(t('json_msg'));
            return;
          }
          createRule(vals.bgid, data).then((res) => {
            const failed = _.some(res, (val) => {
              return !!val;
            });
            if (failed) {
              Modal.error({
                title: t('common:error.clone'),
                content: (
                  <div>
                    {_.map(res, (val, key) => {
                      return (
                        <div key={key}>
                          {key}: {val}
                        </div>
                      );
                    })}
                  </div>
                ),
              });
            } else {
              message.success(t('common:success.clone'));
              destroy();
            }
          });
        }}
      >
        <Form.Item
          label={t('common:business_group')}
          name='bgid'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select showSearch optionFilterProp='children'>
            {_.map(busiGroups, (item) => {
              return (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Row gutter={10}>
          <Col span={8}>
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
          <Col span={12}>
            <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
              {({ getFieldValue, setFieldsValue }) => {
                const cate = getFieldValue('cate');
                return <DatasourceValueSelect mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} />;
              }}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label={t('json_label')}
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
    </Modal>
  );
}

export default ModalHOC(Import);
