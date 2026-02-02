import React, { useContext, useEffect } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button, Modal, message, Space, Select, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';

import { prometheusQuery } from '@/services/warning';
import { addOrEditRecordingRule, editRecordingRule, deleteRecordingRule } from '@/services/recording';
import PromQLInputNG from '@/components/PromQLInputNG';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import { CommonStateContext } from '@/App';
import CronPattern from '@/components/CronPattern';
import KVTagSelect, { validatorOfKVTagSelect } from '@/components/KVTagSelect';
import { getBusiGroups } from '@/components/BusinessGroup/services';

const DATASOURCE_ALL = 0;

interface Props {
  initialValues?: any;
  type?: number; // 1:编辑 2:克隆
}

function getFirstDatasourceId(datasourceIds = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList?.[0]?.id : datasourceIds?.[0];
}

const goListPath = '/recording-rules';

const operateForm: React.FC<Props> = ({ type, initialValues = {} }) => {
  const { t } = useTranslation('recordingRules');
  const history = useHistory(); // 创建的时候默认选中的值
  const [form] = Form.useForm();
  const { groupedDatasourceList } = useContext(CommonStateContext);

  const addSubmit = () => {
    form.validateFields().then(async (values) => {
      const datasourceId = getFirstDatasourceId(values.datasource_ids, groupedDatasourceList?.prometheus || []);
      const res = await prometheusQuery({ query: values.prom_ql }, datasourceId);
      if (res.error) {
        notification.error({
          message: res.error,
        });
        return false;
      }

      const d = {
        ...values,
        cluster: '0',
      };
      let reqBody,
        method = 'Post';
      if (type === 1) {
        reqBody = d;
        method = 'Put';
        const res = await editRecordingRule(reqBody, initialValues.id);
        if (res.err) {
          message.error(res.error);
        } else {
          message.success(t('common:success.edit'));
          history.push({
            pathname: goListPath,
            search: `ids=${values.group_id}&isLeaf=true`,
          });
        }
      } else {
        reqBody = [d];
        const { dat } = await addOrEditRecordingRule(reqBody, values.group_id, method);
        let errorNum = 0;
        const msg = Object.keys(dat).map((key) => {
          dat[key] && errorNum++;
          return dat[key];
        });
        if (!errorNum) {
          message.success(`${type === 2 ? t('common:success.clone') : t('common:success.add')}`);
          history.push({
            pathname: goListPath,
            search: `ids=${values.group_id}&isLeaf=true`,
          });
        } else {
          message.error(t(msg));
        }
      }
    });
  };

  const { data: busiGroups } = useRequest(() => getBusiGroups(), {
    refreshDeps: [],
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        datasource_ids: initialValues.datasource_ids || [DATASOURCE_ALL],
      });
    }
  }, []);

  return (
    <div>
      <div className='fc-border p-4'>
        <Form form={form} className='strategy-form' layout='vertical'>
          <Space direction='vertical' style={{ width: '100%' }}>
            <Form.Item label={t('group_id')} name='group_id' rules={[{ required: true, message: t('group_id_required') }]}>
              <Select
                options={_.map(busiGroups, (item) => {
                  return { label: item.name, value: item.id };
                })}
                showSearch
                optionFilterProp='label'
              />
            </Form.Item>
            <Form.Item
              required
              label={t('name')}
              tooltip={t('name_tip')}
              name='name'
              rules={[
                {
                  required: true,
                },
                { pattern: new RegExp(/^[0-9a-zA-Z_:]{1,}$/, 'g'), message: 'name_msg' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={t('note')} name='note'>
              <Input />
            </Form.Item>
            <DatasourceValueSelect mode='multiple' setFieldsValue={form.setFieldsValue} cate='prometheus' datasourceList={groupedDatasourceList?.prometheus || []} />

            <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.datasource_ids !== curValues.datasource_ids}>
              {({ getFieldValue, validateFields }) => {
                const datasourceIds = getFieldValue('datasource_ids');
                return (
                  <Form.Item label='PromQL' name='prom_ql' validateTrigger={['onBlur']} trigger='onChange' rules={[{ required: true }]}>
                    <PromQLInputNG
                      datasourceValue={getFirstDatasourceId(datasourceIds, groupedDatasourceList?.prometheus)}
                      onChange={(val) => {
                        if (val) {
                          validateFields(['prom_ql']);
                        }
                      }}
                      showBuiltinMetrics
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
            <CronPattern name='cron_pattern' />
            <Form.Item label={t('append_tags')} name='append_tags' rules={[validatorOfKVTagSelect]}>
              <KVTagSelect />
            </Form.Item>
            <Form.Item>
              <Button type='primary' onClick={addSubmit} style={{ marginRight: '8px' }}>
                {t('common:btn.save')}
              </Button>
              {type === 1 && (
                <Button
                  danger
                  style={{ marginRight: '8px' }}
                  onClick={() => {
                    Modal.confirm({
                      title: t('common:confirm.delete'),
                      onOk: () => {
                        deleteRecordingRule([initialValues.id], initialValues.group_id).then(() => {
                          message.success(t('common:success.delete'));
                          history.push('/recording-rules');
                        });
                      },

                      onCancel() {},
                    });
                  }}
                >
                  {t('common:btn.delete')}
                </Button>
              )}

              <Button
                onClick={() => {
                  history.push('/recording-rules');
                }}
              >
                {t('common:btn.cancel')}
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </div>
    </div>
  );
};

export default operateForm;
