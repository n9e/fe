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
import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Card, Select, Col, Button, Row, message, DatePicker, Tooltip, Space, Radio, TimePicker, Checkbox, Alert, Affix } from 'antd';
import { PlusCircleOutlined, CaretDownOutlined, MinusCircleOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';

import { addShield, editShield, alertMuteTryrun } from '@/services/shield';
import { shieldItem } from '@/store/warningInterface';
import DatasourceValueSelect from '@/pages/alertRules/Form/components/DatasourceValueSelect';
import { CommonStateContext } from '@/App';
import { daysOfWeek } from '@/pages/alertRules/constants';
import { DatasourceCateSelect } from '@/components/DatasourceSelect';
import { scrollToFirstError } from '@/utils';
import AlertEventRuleTesterWithButton from '@/components/AlertEventRuleTesterWithButton';
import { KVTags } from '@/components/KVTagSelect';
import Markdown from '@/components/Markdown';
import AffixWrapper from '@/components/AffixWrapper';

import { timeLensDefault } from '../../const';
import { processFormValues } from './utils';
import PreviewMutedEvents from './PreviewMutedEvents';
import '../index.less';

const { Option } = Select;
const { TextArea } = Input;

interface Props {
  detail?: shieldItem;
  type?: number; // 1:编辑; 2:克隆 3:新增
}

const OperateForm: React.FC<Props> = ({ detail = {}, type }: any) => {
  const { t } = useTranslation('alertMutes');
  const btimeDefault = new Date().getTime();
  const etimeDefault = new Date().getTime() + 1 * 60 * 60 * 1000; // 默认时长1h
  const [form] = Form.useForm(null as any);
  const history = useHistory();
  const [timeLen, setTimeLen] = useState('1h');
  const { groupedDatasourceList, busiGroups, isPlus, businessGroupOnChange } = useContext(CommonStateContext);

  useEffect(() => {
    timeChange();
  }, [detail]);

  const timeChange = () => {
    const btime = form.getFieldValue('btime');
    const etime = form.getFieldValue('etime');
    if (!!etime && !!btime) {
      const y = Math.round(moment.duration(etime - btime).asYears());
      const d = Math.floor(moment.duration(etime - btime).asDays());
      const h = Math.floor(moment.duration(etime - btime).hours());
      const m = Math.floor(moment.duration(etime - btime).minutes());
      const s = Math.floor(moment.duration(etime - btime).seconds());
      if (y > 0) {
        const timeLen = `${y ? `${y}y ` : ''}`;
        setTimeLen(timeLen);
      } else {
        const timeLen = `${d ? `${d}d ` : ''}${h ? `${h}h ` : ''}${m ? `${m}m ` : ''}${s ? `${s}s` : ''}`;
        setTimeLen(timeLen);
      }
    }
  };

  const onFinish = (values) => {
    const params = processFormValues(values);
    const curBusiItemId = form.getFieldValue('group_id');
    const historyPushOptions = {
      pathname: '/alert-mutes',
      search: `?ids=${curBusiItemId}&isLeaf=true`,
    };
    if (type == 1) {
      editShield(params, curBusiItemId, detail.id).then((_) => {
        message.success(t('common:success.edit'));
        history.push(historyPushOptions);
      });
    } else {
      businessGroupOnChange(_.toString(curBusiItemId));
      addShield(params, curBusiItemId).then((_) => {
        message.success(t('common:success.add'));
        history.push(historyPushOptions);
      });
    }
  };
  const timeLenChange = (val: string) => {
    setTimeLen(val);
    const time = new Date().getTime();
    const unit = val.charAt(val.length - 1);
    const num = val.substr(0, val.length - 1);
    form.setFieldsValue({
      btime: moment(time),
      etime: moment(time).add({
        [unit]: num,
      }),
    });
  };

  const content = (
    <Form
      form={form}
      layout='vertical'
      className='operate-form'
      onFinish={onFinish}
      onFinishFailed={() => {
        scrollToFirstError();
      }}
      initialValues={{
        ...detail,
        prod: detail.prod || 'metric',
        severities: detail.severities || [1, 2, 3],
        btime: detail?.btime ? moment(detail.btime * 1000) : moment(btimeDefault),
        etime: detail?.etime ? moment(detail.etime * 1000) : moment(etimeDefault),
        mute_time_type: detail?.mute_time_type || 0,
        periodic_mutes: detail?.periodic_mutes
          ? _.map(detail?.periodic_mutes, (item) => {
              return {
                enable_days_of_week: _.split(item.enable_days_of_week, ' '),
                enable_stime: moment(item.enable_stime, 'HH:mm'),
                enable_etime: moment(item.enable_etime, 'HH:mm'),
              };
            })
          : [
              {
                enable_days_of_week: ['1', '2', '3', '4', '5', '6', '0'],
                enable_stime: moment('00:00', 'HH:mm'),
                enable_etime: moment('00:00', 'HH:mm'),
              },
            ],
      }}
    >
      <Card className='mb-4' title={t('basic_configs')}>
        <Alert type='info' message={t('alert_content')} className='mb-2' />
        <Form.Item label={t('common:business_group')} name='group_id' required>
          <Select
            disabled={type == 1}
            options={_.map(busiGroups, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            })}
            showSearch
            optionFilterProp='label'
          />
        </Form.Item>
        <Form.Item
          label={t('note')}
          name='note'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t('cause')} name='cause'>
          <TextArea rows={3} />
        </Form.Item>
      </Card>
      <Card
        className='mb-4'
        title={
          <Space>
            {t('filter_configs')}
            <Tooltip title={t('filter_configs_tip')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        }
      >
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
                return <DatasourceValueSelect mode='multiple' setFieldsValue={setFieldsValue} cate={cate} datasourceList={groupedDatasourceList[cate] || []} required={false} />;
              }}
            </Form.Item>
          </Col>
        </Row>
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
        <KVTags
          name={['tags']}
          keyLabel={t('tag.key.label')}
          keyLabelTootip={
            <div className='pt-2 px-1'>
              <Markdown content={t('tag.key.tip')} darkMode />
            </div>
          }
        />
      </Card>
      <Card title={t('mute_configs')}>
        <Form.Item label={t('mute_type.label')} name='mute_time_type'>
          <Radio.Group>
            <Radio value={0}>{t('mute_type.0')}</Radio>
            <Radio value={1}>{t('mute_type.1')}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const mute_type = getFieldValue('mute_time_type');
            return (
              <>
                <div style={{ display: mute_type === 0 ? 'block' : 'none' }}>
                  <Row gutter={10}>
                    <Col span={8}>
                      <Form.Item label={t('btime')} name='btime'>
                        <DatePicker showTime onChange={timeChange} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label={t('duration')}>
                        <Select suffixIcon={<CaretDownOutlined />} onChange={timeLenChange} value={timeLen}>
                          {timeLensDefault.map((item: any, index: number) => (
                            <Option key={index} value={item.value}>
                              {item.value}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label={t('etime')} name='etime'>
                        <DatePicker showTime onChange={timeChange} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div style={{ display: mute_type === 1 ? 'block' : 'none' }}>
                  <Form.List name='periodic_mutes'>
                    {(fields, { add, remove }) => (
                      <>
                        <Space>
                          <div style={{ width: 450 }}>
                            <Space align='baseline'>
                              {t('mute_type.days_of_week')}
                              <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
                            </Space>
                          </div>
                          <div style={{ width: 110 }}>{t('mute_type.start')}</div>
                          <div style={{ width: 110 }}>{t('mute_type.end')}</div>
                        </Space>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space
                            key={key}
                            style={{
                              display: 'flex',
                              marginBottom: 8,
                            }}
                            align='baseline'
                          >
                            <Form.Item
                              {...restField}
                              name={[name, 'enable_days_of_week']}
                              style={{ width: 450 }}
                              rules={[
                                {
                                  required: true,
                                  message: t('mute_type.days_of_week_msg'),
                                },
                              ]}
                            >
                              <Select mode='tags'>
                                {daysOfWeek.map((item) => {
                                  return (
                                    <Select.Option key={item} value={String(item)}>
                                      {t(`common:time.weekdays.${item}`)}
                                    </Select.Option>
                                  );
                                })}
                              </Select>
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'enable_stime']}
                              style={{ width: 110 }}
                              rules={[
                                {
                                  required: true,
                                  message: t('mute_type.start_msg'),
                                },
                              ]}
                            >
                              <TimePicker format='HH:mm' />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'enable_etime']}
                              style={{ width: 110 }}
                              rules={[
                                {
                                  required: true,
                                  message: t('mute_type.end_msg'),
                                },
                              ]}
                            >
                              <TimePicker format='HH:mm' />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Space>
                        ))}
                      </>
                    )}
                  </Form.List>
                </div>
              </>
            );
          }}
        </Form.Item>
      </Card>
      <AffixWrapper>
        <Card size='small' className='affix-bottom-shadow'>
          <Space>
            <PreviewMutedEvents
              form={form}
              onOk={() => {
                form.validateFields().then((values: any) => {
                  onFinish(values);
                });
              }}
            />
            <AlertEventRuleTesterWithButton
              onClick={() => {
                return form.validateFields();
              }}
              onTest={(eventID) => {
                return form.validateFields().then((values: any) => {
                  return alertMuteTryrun({
                    event_id: eventID,
                    config: processFormValues(values),
                  });
                });
              }}
            />
            <Button onClick={() => window.history.back()}>{t('common:btn.cancel')}</Button>
          </Space>
        </Card>
      </AffixWrapper>
    </Form>
  );
  return (
    <div className='operate-form-index' style={{ background: 'none' }}>
      {content}
    </div>
  );
};

export default OperateForm;
