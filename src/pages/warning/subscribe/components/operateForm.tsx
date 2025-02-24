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
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Form, Card, Select, Col, Button, Row, message, Checkbox, Tooltip, Radio, Modal, Space, InputNumber, Input, Switch, Tag, Affix } from 'antd';
import { QuestionCircleOutlined, PlusCircleOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { addSubscribe, editSubscribe, deleteSubscribes } from '@/services/subscribe';
import { getNotifiesList, getTeamInfoList } from '@/services/manage';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import VersionSwitch from '@/pages/alertRules/Form/Notify/VersionSwitch';
import NotificationRuleSelect from '@/pages/alertRules/Form/Notify/NotificationRuleSelect';
import { CommonStateContext } from '@/App';
import { DatasourceCateSelect } from '@/components/DatasourceSelect';
import { panelBaseProps } from '@/pages/alertRules/constants';
import { scrollToFirstError } from '@/utils';
import RuleModal from './ruleModal';
import TagItem from './tagItem';
import BusiGroupsTagItem from './BusiGroupsTagItem';
import '../index.less';

// @ts-ignore
import NotifyExtra from 'plus:/parcels/AlertSubscribes/Extra';
// @ts-ignore
import NotifyChannelsTpl from 'plus:/parcels/AlertRule/NotifyChannelsTpl';

const { Option } = Select;
interface Props {
  detail?: subscribeItem;
  type?: number; // 1:编辑; 2:克隆
}

const OperateForm: React.FC<Props> = ({ detail = {} as subscribeItem, type }) => {
  const { t } = useTranslation('alertSubscribes');
  const [form] = Form.useForm(null as any);
  const history = useHistory();
  const { groupedDatasourceList, isPlus, businessGroup } = useContext(CommonStateContext);
  const curBusiId = detail.group_id || businessGroup.id!; // 修改和克隆是用 detail.group_id , 新增用 businessGroup.id
  const [ruleModalShow, setRuleModalShow] = useState<boolean>(false);
  const [selectedRules, setSelectedRules] = useState<any[]>([]); // 选中的规则
  const [contactList, setInitContactList] = useState([]);
  const [notifyGroups, setNotifyGroups] = useState<any[]>([]);
  const redefineSeverity = Form.useWatch(['redefine_severity'], form);
  const redefineChannels = Form.useWatch(['redefine_channels'], form);
  const redefineWebhooks = Form.useWatch(['redefine_webhooks'], form);
  const new_channels = Form.useWatch(['new_channels'], form);
  const notify_version = Form.useWatch(['notify_version'], form);

  useEffect(() => {
    getNotifyChannel();
    getGroups('');
    setSelectedRules(
      _.map(detail.rule_ids, (id, idx) => {
        return {
          id,
          name: detail.rule_names[idx],
        };
      }),
    );
  }, []);

  const notifyGroupsOptions = (detail.user_groups ? detail.user_groups.filter((item) => !notifyGroups.find((i) => item.id === i.id)) : []).concat(notifyGroups).map((ng: any) => (
    <Option value={String(ng.id)} key={ng.id}>
      {ng.name}
    </Option>
  ));

  const getNotifyChannel = async () => {
    const res = await getNotifiesList();
    let contactList = res || [];
    setInitContactList(contactList);
  };

  const getGroups = async (str) => {
    const res = await getTeamInfoList({ query: str });
    const data = res.dat || res;
    setNotifyGroups(data || []);
  };

  const debounceFetcher = useCallback(_.debounce(getGroups, 800), []);

  const onFinish = (values) => {
    const tags = values?.tags?.map((item) => {
      return {
        ...item,
        value: Array.isArray(item.value) ? item.value.join(' ') : item.value,
      };
    });
    const busi_groups = values?.busi_groups?.map((item) => {
      return {
        ...item,
        value: Array.isArray(item.value) ? item.value.join(' ') : item.value,
      };
    });

    const params = {
      ...values,
      tags,
      busi_groups,
      redefine_severity: values.redefine_severity ? 1 : 0,
      redefine_channels: values.redefine_channels ? 1 : 0,
      redefine_webhooks: values.redefine_webhooks ? 1 : 0,
      rule_ids: _.map(selectedRules, 'id'),
      user_group_ids: values.user_group_ids ? values.user_group_ids.join(' ') : '',
      new_channels: values.new_channels ? values.new_channels.join(' ') : '',
      cluster: '0',
    };
    if (type === 1) {
      editSubscribe([{ ...params, id: detail.id }], curBusiId).then((_) => {
        message.success(t('common:success.edit'));
        history.push('/alert-subscribes');
      });
    } else {
      addSubscribe(params, curBusiId).then((_) => {
        message.success(t('common:success.add'));
        history.push('/alert-subscribes');
      });
    }
  };

  const subscribeRule = (val) => {
    setSelectedRules(val);
    setRuleModalShow(false);
  };

  return (
    <main
      className='p2 subscription-rules-form'
      style={{
        overflow: 'hidden auto',
      }}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        onFinishFailed={() => {
          scrollToFirstError();
        }}
        initialValues={{
          notify_version: 1, // v8-beta.6 默认通知版本为1，旧版本为 0
          ...detail,
          busi_groups: _.map(detail.busi_groups || [{}], (item) => {
            return {
              ...item,
              value: _.includes(['in', 'not in'], item.func) ? item.value.split(' ') : item.value,
            };
          }),
          severities: detail.severities || [1, 2, 3],
          redefine_severity: detail?.redefine_severity ? true : false,
          redefine_channels: detail?.redefine_channels ? true : false,
          redefine_webhooks: detail?.redefine_webhooks ? true : false,
          user_group_ids: detail?.user_group_ids ? detail?.user_group_ids?.split(' ') : [],
          new_channels: detail?.new_channels ? detail?.new_channels?.split(' ') : [],
        }}
      >
        <Card {...panelBaseProps} title={t('basic_configs')} className='mb2'>
          <Form.Item label={t('note')} name='note'>
            <Input />
          </Form.Item>
        </Card>
        <Card {...panelBaseProps} title={t('filter_configs')} className='mb2'>
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item label={t('common:datasource.type')} name='cate' initialValue='prometheus'>
                <DatasourceCateSelect
                  scene='alert'
                  filterCates={(cates) => {
                    return _.filter(cates, (item) => {
                      return !!item.alertRule && (item.alertPro ? isPlus : true);
                    });
                  }}
                  onChange={() => {
                    form.setFieldsValue({
                      datasource_ids: [],
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
                {({ getFieldValue, setFieldsValue }) => {
                  const cate = getFieldValue('cate');
                  return <DatasourceValueSelect required={false} mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} />;
                }}
              </Form.Item>
            </Col>
          </Row>
          <div className='filter-settings-row'>
            <div className='filter-settings-row-connector'>
              <div className='filter-settings-row-connector-line' />
              <div className='filter-settings-row-connector-text-container'>
                <div className='filter-settings-row-connector-text'>{t('and')}</div>
              </div>
            </div>
            <div className='filter-settings-row-content'>
              <Form.Item label={t('severities')} name='severities' initialValue={[1, 2, 3]} rules={[{ required: true, message: t('severities_msg') }]}>
                <Checkbox.Group
                  options={[
                    {
                      label: t('common:severity.1'),
                      value: 1,
                    },
                    {
                      label: t('common:severity.2'),
                      value: 2,
                    },
                    {
                      label: t('common:severity.3'),
                      value: 3,
                    },
                  ]}
                />
              </Form.Item>
            </div>
          </div>
          <div className='filter-settings-row'>
            <div className='filter-settings-row-connector'>
              <div className='filter-settings-row-connector-line' />
              <div className='filter-settings-row-connector-text-container'>
                <div className='filter-settings-row-connector-text'>{t('and')}</div>
              </div>
            </div>
            <div className='filter-settings-row-content'>
              <Form.Item label={t('sub_rule_name')}>
                <Space wrap>
                  {_.map(selectedRules, (item) => (
                    <Tag
                      color='purple'
                      key={item.id}
                      closable
                      onClose={() => {
                        setSelectedRules(selectedRules.filter((row) => row.id !== item.id));
                      }}
                    >
                      <Link to={`/alert-rules/edit/${item.id}`} target='_blank'>
                        {item.name}
                      </Link>
                    </Tag>
                  ))}
                  <EditOutlined
                    style={{ cursor: 'pointer', fontSize: '18px' }}
                    onClick={() => {
                      setRuleModalShow(true);
                    }}
                  />
                </Space>
              </Form.Item>
            </div>
          </div>
          <div className='filter-settings-row'>
            <div className='filter-settings-row-connector'>
              <div className='filter-settings-row-connector-line' />
              <div className='filter-settings-row-connector-text-container'>
                <div className='filter-settings-row-connector-text'>{t('and')}</div>
              </div>
            </div>
            <div className='filter-settings-row-content'>
              <Form.List name='busi_groups'>
                {(fields, { add, remove }, { errors }) => (
                  <>
                    <Row gutter={10}>
                      {fields.length > 1 && <Col flex='48px' />}
                      <Col flex='auto'>
                        <Row gutter={10} className='mb1'>
                          <Col span={5}>
                            <Space>
                              <span>{t('group.key.label')}</span>
                              <PlusCircleOutlined
                                onClick={() =>
                                  add({
                                    key: 'groups',
                                  })
                                }
                              />
                            </Space>
                          </Col>
                          <Col span={4}>{t('group.func.label')}</Col>
                          <Col span={15}>{t('group.value.label')}</Col>
                        </Row>
                      </Col>
                      <Col flex='32px' />
                    </Row>
                    {fields.map((field, index) => (
                      <BusiGroupsTagItem key={index} field={field} fields={fields} index={index} remove={remove} add={add} form={form} />
                    ))}
                    <Form.ErrorList errors={errors} />
                  </>
                )}
              </Form.List>
            </div>
          </div>
          <div className='filter-settings-row'>
            <div className='filter-settings-row-connector'>
              <div className='filter-settings-row-connector-line' />
              <div className='filter-settings-row-connector-text-container'>
                <div className='filter-settings-row-connector-text'>{t('and')}</div>
              </div>
            </div>
            <div className='filter-settings-row-content'>
              <Form.List name='tags' initialValue={[{}]}>
                {(fields, { add, remove }, { errors }) => (
                  <>
                    <Row gutter={10}>
                      {fields.length > 1 && <Col flex='48px' />}
                      <Col flex='auto'>
                        <Row gutter={10} className='mb1'>
                          <Col span={5}>
                            <Space>
                              <span>{t('tag.key.label')}</span>
                              <Tooltip title={t(`tag.key.tip`)}>
                                <QuestionCircleOutlined
                                  style={{
                                    cursor: 'help',
                                  }}
                                />
                              </Tooltip>
                              <PlusCircleOutlined onClick={() => add()} />
                            </Space>
                          </Col>
                          <Col span={4}>{t('tag.func.label')}</Col>
                          <Col span={15}>{t('tag.value.label')}</Col>
                        </Row>
                      </Col>
                      <Col flex='32px' />
                    </Row>
                    {fields.map((field, index) => (
                      <TagItem key={index} field={field} fields={fields} index={index} remove={remove} add={add} form={form} />
                    ))}
                    <Form.ErrorList errors={errors} />
                  </>
                )}
              </Form.List>
            </div>
          </div>
          <div className='filter-settings-row'>
            <div className='filter-settings-row-connector'>
              <div className='filter-settings-row-connector-text-container'>
                <div className='filter-settings-row-connector-text'>{t('and')}</div>
              </div>
            </div>
            <div className='filter-settings-row-content'>
              <Form.Item label={t('for_duration')} tooltip={t('for_duration_tip')} name='for_duration'>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
        </Card>
        <Card {...panelBaseProps} title={t('notify_configs')} extra={<VersionSwitch />}>
          <div
            style={{
              display: notify_version === 0 ? 'block' : 'none',
            }}
          >
            <Form.Item label={t('user_group_ids')} name='user_group_ids'>
              <Select mode='multiple' showSearch optionFilterProp='children' filterOption={false} onSearch={(e) => debounceFetcher(e)} onBlur={() => getGroups('')}>
                {notifyGroupsOptions}
              </Select>
            </Form.Item>
            <div>
              <Space>
                {t('redefine_severity')}
                <Form.Item name='redefine_severity' valuePropName='checked' noStyle>
                  <Switch />
                </Form.Item>
              </Space>
              <div
                style={{
                  display: redefineSeverity ? 'block' : 'none',
                  marginTop: 10,
                }}
              >
                <Form.Item name='new_severity' noStyle initialValue={2}>
                  <Radio.Group>
                    <Radio value={1}>{t('common:severity.1')}</Radio>
                    <Radio value={2}>{t('common:severity.2')}</Radio>
                    <Radio value={3}>{t('common:severity.3')}</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </div>
            <div className='mt16 mb16'>
              <Space>
                {t('redefine_channels')}
                <Form.Item name='redefine_channels' valuePropName='checked' noStyle>
                  <Switch />
                </Form.Item>
              </Space>
              <div
                style={{
                  display: redefineChannels ? 'block' : 'none',
                  marginTop: 10,
                }}
              >
                <Form.Item name='new_channels' noStyle>
                  <Checkbox.Group>
                    {_.map(contactList, (item: any) => {
                      return (
                        <Checkbox value={item.key} key={item.label}>
                          {item.label}
                        </Checkbox>
                      );
                    })}
                  </Checkbox.Group>
                </Form.Item>
                <div className='mt16'>
                  <NotifyChannelsTpl contactList={contactList} notify_channels={new_channels} name={['extra_config', 'custom_notify_tpl']} />
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              display: notify_version === 1 ? 'block' : 'none',
            }}
          >
            <NotificationRuleSelect />
          </div>
          <div className='mb16'>
            <Space>
              {t('redefine_webhooks')}
              <Form.Item name='redefine_webhooks' valuePropName='checked' noStyle>
                <Switch />
              </Form.Item>
            </Space>
            <div
              style={{
                display: redefineWebhooks ? 'block' : 'none',
                marginTop: 10,
              }}
            >
              <Form.List name='webhooks' initialValue={[]}>
                {(fields, { add, remove }) => (
                  <>
                    <Row gutter={10} style={{ marginBottom: '8px' }}>
                      <Col span={5}>
                        <Space align='baseline'>
                          <span>{t('webhooks')}</span>
                          <PlusCircleOutlined onClick={() => add()} />
                        </Space>
                      </Col>
                    </Row>
                    {fields.map((field, index) => (
                      <Row gutter={10}>
                        <Col flex='auto'>
                          <Form.Item name={[field.name]} key={index} rules={[{ required: true, message: t('webhooks_msg') }]}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col flex='32px'>
                          <MinusCircleOutlined style={{ marginTop: '8px' }} onClick={() => remove(field.name)} />
                        </Col>
                      </Row>
                    ))}
                  </>
                )}
              </Form.List>
            </div>
          </div>
        </Card>
        <NotifyExtra />
        <Affix offsetBottom={0}>
          <Card size='small' className='affix-bottom-shadow'>
            <Space>
              <Button type='primary' htmlType='submit'>
                {type === 1 ? t('common:btn.edit') : type === 2 ? t('common:btn.clone') : t('common:btn.create')}
              </Button>
              {type === 1 && (
                <Button
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: t('common:confirm.delete'),
                      onOk: () => {
                        detail?.id &&
                          deleteSubscribes({ ids: [detail.id] }, curBusiId).then(() => {
                            message.success(t('common:success.delete'));
                            history.push('/alert-subscribes');
                          });
                      },

                      onCancel() {},
                    });
                  }}
                >
                  {t('common:btn.delete')}
                </Button>
              )}
              <Button onClick={() => window.history.back()}>{t('common:btn.cancel')}</Button>
            </Space>
          </Card>
        </Affix>
      </Form>
      <RuleModal
        visible={ruleModalShow}
        ruleModalClose={() => {
          setRuleModalShow(false);
        }}
        subscribe={subscribeRule}
        selectedRules={selectedRules}
      />
    </main>
  );
};

export default OperateForm;
