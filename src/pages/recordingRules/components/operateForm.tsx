import React, { useState, useMemo, useContext } from 'react';
import _ from 'lodash';
import { useHistory, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Modal, message, Space, Tooltip, Tag, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { prometheusQuery } from '@/services/warning';
import { addOrEditRecordingRule, editRecordingRule, deleteRecordingRule } from '@/services/recording';
import PromQLInput from '@/components/PromQLInput';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import { CommonStateContext } from '@/App';

const DATASOURCE_ALL = 0;

interface Props {
  detail?: any;
  type?: number; // 1:编辑 2:克隆
}

// 校验单个标签格式是否正确
function isTagValid(tag) {
  const contentRegExp = /^[a-zA-Z_][\w]*={1}[^=]+$/;
  return {
    isCorrectFormat: contentRegExp.test(tag.toString()),
    isLengthAllowed: tag.toString().length <= 64,
  };
}

function getFirstDatasourceId(datasourceIds = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList?.[0]?.id : datasourceIds?.[0];
}

const operateForm: React.FC<Props> = ({ type, detail = {} }) => {
  const { t } = useTranslation('recordingRules');
  const history = useHistory(); // 创建的时候默认选中的值
  const [form] = Form.useForm();
  const { groupedDatasourceList, businessGroup } = useContext(CommonStateContext);
  const [refresh, setRefresh] = useState(true);
  const params: any = useParams();
  const strategyId = useMemo(() => {
    return params.id;
  }, [params]);
  const curBusiId = detail.group_id || businessGroup.id!;

  // 渲染标签
  function tagRender(content) {
    const { isCorrectFormat, isLengthAllowed } = isTagValid(content.value);
    return isCorrectFormat && isLengthAllowed ? (
      <Tag closable={content.closable} onClose={content.onClose}>
        {content.value}
      </Tag>
    ) : (
      <Tooltip title={isCorrectFormat ? t('append_tags_msg1') : t('append_tags_msg2')}>
        <Tag color='error' closable={content.closable} onClose={content.onClose} style={{ marginTop: '2px' }}>
          {content.value}
        </Tag>
      </Tooltip>
    );
  }

  // 校验所有标签格式
  function isValidFormat() {
    return {
      validator(_, value) {
        const isInvalid =
          value &&
          value.some((tag) => {
            const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
            if (!isCorrectFormat || !isLengthAllowed) {
              return true;
            }
          });
        return isInvalid ? Promise.reject(new Error(t('append_tags_msg'))) : Promise.resolve();
      },
    };
  }

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
        const res = await editRecordingRule(reqBody, curBusiId, strategyId);
        if (res.err) {
          message.error(res.error);
        } else {
          message.success(t('common:success.edit'));
          history.push('/recording-rules');
        }
      } else {
        reqBody = [d];
        const { dat } = await addOrEditRecordingRule(reqBody, curBusiId, method);
        let errorNum = 0;
        const msg = Object.keys(dat).map((key) => {
          dat[key] && errorNum++;
          return dat[key];
        });
        if (!errorNum) {
          message.success(`${type === 2 ? t('common:success.clone') : t('common:success.add')}`);
          history.push('/recording-rules');
        } else {
          message.error(t(msg));
        }
      }
    });
  };

  return (
    <div className='operate_con'>
      <Form
        form={form}
        className='strategy-form'
        layout='vertical'
        initialValues={{
          prom_eval_interval: 30,
          ...detail,
          datasource_ids: detail.datasource_ids || [DATASOURCE_ALL],
        }}
      >
        <Space direction='vertical' style={{ width: '100%' }}>
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
                  <PromQLInput
                    datasourceValue={getFirstDatasourceId(datasourceIds, groupedDatasourceList?.prometheus)}
                    onChange={(val) => {
                      if (val) {
                        validateFields(['prom_ql']);
                      }
                    }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item required label={t('prom_eval_interval')} tooltip={t('prom_eval_interval_tip', { num: form.getFieldValue('prom_eval_interval') })}>
            <Space>
              <Form.Item
                style={{ marginBottom: 0 }}
                name='prom_eval_interval'
                initialValue={30}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  onChange={() => {
                    setRefresh(!refresh);
                  }}
                />
              </Form.Item>
              s
            </Space>
          </Form.Item>
          <Form.Item label={t('append_tags')} name='append_tags' rules={[isValidFormat]}>
            <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={t('append_tags_placeholder')} tagRender={tagRender} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={addSubmit} style={{ marginRight: '8px' }}>
              {type === 1 ? t('common:btn.edit') : type === 2 ? t('common:btn.clone') : t('common:btn.add')}
            </Button>
            {type === 1 && (
              <Button
                danger
                style={{ marginRight: '8px' }}
                onClick={() => {
                  Modal.confirm({
                    title: t('common:confirm.delete'),
                    onOk: () => {
                      deleteRecordingRule([detail.id], curBusiId).then(() => {
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
  );
};

export default operateForm;
