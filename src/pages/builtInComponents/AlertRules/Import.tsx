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
import React, { useMemo } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Form, Button, Select, Switch, message, Alert } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import DatasourceValueSelectV2 from '@/pages/alertRules/Form/components/DatasourceValueSelect/V2';
import { createRule } from './services';

interface IProps {
  data: string;
  busiGroups: any;
  groupedDatasourceList: any;
  reloadGroupedDatasourceList: any;
  datasourceCateOptions: any;
}

function Import(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('builtInComponents');
  const { visible, destroy, data, busiGroups, groupedDatasourceList, reloadGroupedDatasourceList, datasourceCateOptions } = props;
  const datasourceCates = _.filter(datasourceCateOptions, (item) => !!item.alertRule);
  const [allowSubmit, setAllowSubmit] = React.useState(true);
  const [form] = Form.useForm();
  const datasourceCate = Form.useWatch('datasource_cate', form);
  const defaultDatasourceCate = useMemo(() => {
    try {
      const parsed = JSON.parse(data);
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
        return cates[0];
      } else if (cates.length > 1) {
        setAllowSubmit(false);
      }
      return undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }, []);

  return (
    <Modal
      title={t('import_to_buisGroup')}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      {!allowSubmit && <Alert className='mb1' message={t('import_to_buisGroup_invaild')} type='error' showIcon />}
      <Form
        layout='vertical'
        form={form}
        initialValues={{
          import: data,
          datasource_cate: defaultDatasourceCate,
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
                cate: record.cate === 'host' ? 'host' : vals.datasource_cate,
                disabled: vals.enabled ? 0 : 1,
                rule_config: {
                  ...item.rule_config,
                  datasource_queries: vals?.datasource_queries,
                },
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
        {datasourceCate && <DatasourceValueSelectV2 datasourceList={groupedDatasourceList[datasourceCate] || []} reloadGroupedDatasourceList={reloadGroupedDatasourceList} />}
        <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
          <Switch />
        </Form.Item>
        <Form.Item
          label={t('content')}
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
          <Button type='primary' htmlType='submit' disabled={!allowSubmit}>
            {t('common:btn.import')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC(Import);
