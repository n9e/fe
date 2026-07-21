import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Switch, Space, Select, TimePicker, Tooltip } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useRequest } from 'ahooks';
import moment from 'moment-timezone';

import { CommonStateContext } from '@/App';

import SectionCard from '../components/SectionCard';
import { daysOfWeek } from '../../constants';
import { getTimezones } from '../../services';
import { useFormNGData } from '../context';

// @ts-ignore
import ServiceCalendarWithTimeSelect from 'plus:/pages/ServiceCalendar/ServiceCalendarWithTimeSelect';

interface Props {
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  initialValues?: any;
  expandSignal?: { key: string; ts: number } | null;
  toggleAllSignal?: { action: 'expand' | 'collapse'; ts: number } | null;
}

const isDefaultEffectiveTime = (effectiveTime: any) => {
  if (!Array.isArray(effectiveTime) || effectiveTime.length !== 1) {
    return false;
  }

  const item = effectiveTime[0];
  if (!item) {
    return false;
  }

  const isDefaultDays = _.isEqual(item.enable_days_of_week, ['0', '1', '2', '3', '4', '5', '6']);
  const isDefaultStart = moment.isMoment(item.enable_stime) && item.enable_stime.format('HH:mm') === '00:00';
  const isDefaultEnd = moment.isMoment(item.enable_etime) && item.enable_etime.format('HH:mm') === '00:00';

  return isDefaultDays && isDefaultStart && isDefaultEnd;
};

const isDefaultEffectiveConfig = (initialValues: any) => {
  if (!initialValues) {
    return false;
  }

  return initialValues.enable_status === true && initialValues.time_zone === 'Local' && isDefaultEffectiveTime(initialValues.effective_time);
};

export default function index({ sectionRefs, initialValues, expandSignal, toggleAllSignal }: Props) {
  const { t } = useTranslation('alertRules');
  const { isPlus } = useContext(CommonStateContext);
  const { permissions, serviceCals, refreshServiceCals } = useFormNGData();

  const [collapsed, setCollapsed] = useState(() => isDefaultEffectiveConfig(initialValues));

  const form = Form.useFormInstance();
  const time_zone = Form.useWatch('time_zone');

  // Expand this section when sidebar triggers expansion
  useEffect(() => {
    if (expandSignal?.key === 'effective') {
      setCollapsed(false);
    }
  }, [expandSignal]);

  // Respond to global collapse/expand all
  useEffect(() => {
    if (toggleAllSignal) {
      setCollapsed(toggleAllSignal.action === 'collapse');
    }
  }, [toggleAllSignal]);

  const { data: timezones } = useRequest(() => getTimezones());

  return (
    <SectionCard
      sectionKey='effective'
      sectionRef={(node) => {
        sectionRefs.current['effective'] = node;
      }}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      <div className='mb-4'>
        <Space>
          <span>{t('enable_status')}</span>
          <Form.Item name='enable_status' valuePropName='checked' noStyle>
            <Switch size='small' />
          </Form.Item>
        </Space>
      </div>
      <Form.Item label={t('time_zone')} name='time_zone' initialValue='Local' tooltip={t('time_zone_tip')}>
        <Select
          options={_.map(timezones, (item) => {
            return { label: item === 'Local' ? `${item} (${t('local_time')})` : item, value: item };
          })}
          showSearch
          optionFilterProp='label'
        />
      </Form.Item>
      <Form.List name='effective_time'>
        {(fields, { add, remove }) => (
          <>
            <Space>
              <div style={{ width: 450 }}>
                <Space align='baseline'>
                  {t('effective_time')}
                  <PlusCircleOutlined
                    className='control-icon-normal'
                    onClick={() =>
                      add({
                        enable_days_of_week: ['0', '1', '2', '3', '4', '5', '6'],
                        enable_stime: moment('00:00', 'HH:mm'),
                        enable_etime: moment('00:00', 'HH:mm'),
                      })
                    }
                  />
                </Space>
              </div>
              {!_.isEmpty(fields) && (
                <>
                  <div style={{ width: 110 }}>
                    <Space>
                      {t('effective_time_start')}
                      <Tooltip overlayClassName='ant-tooltip-max-width-600' title={t('effective_time_tip')}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  </div>
                  <div style={{ width: 110 }}>
                    <Space>
                      {t('effective_time_end')}
                      <Tooltip overlayClassName='ant-tooltip-max-width-600' title={t('effective_time_tip')}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  </div>
                </>
              )}
            </Space>
            {fields.map(({ key, name, ...restField }) => {
              const enable_stime = form.getFieldValue(['effective_time', name, 'enable_stime']);
              const enable_etime = form.getFieldValue(['effective_time', name, 'enable_etime']);
              let local_text = '';
              if (enable_stime && enable_etime && time_zone && time_zone !== 'Local') {
                const local_stime = moment.tz(enable_stime.format('HH:mm'), 'HH:mm', time_zone).local().format('HH:mm');
                const local_etime = moment.tz(enable_etime.format('HH:mm'), 'HH:mm', time_zone).local().format('HH:mm');
                local_text = `${local_stime} ~ ${local_etime}`;
              }

              return (
                <Space key={key} className='flex' align='baseline' wrap>
                  <Form.Item
                    {...restField}
                    name={[name, 'enable_days_of_week']}
                    style={{ width: 450 }}
                    rules={[
                      {
                        required: true,
                        message: t('effective_time_week_msg'),
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
                        message: t('effective_time_start_msg'),
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
                        message: t('effective_time_end_msg'),
                      },
                    ]}
                  >
                    <TimePicker format='HH:mm' />
                  </Form.Item>
                  {local_text && (
                    <div>
                      {t('local_time')}: {local_text}
                    </div>
                  )}
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              );
            })}
          </>
        )}
      </Form.List>
      {isPlus && (
        <div>
          <ServiceCalendarWithTimeSelect
            namePath={['extra_config', 'service_cal_configs']}
            time_zone={time_zone}
            serviceCals={serviceCals}
            refreshServiceCals={refreshServiceCals}
            showSetting={permissions.serviceCalendar}
          />
        </div>
      )}
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.cate !== curValues.cate} noStyle>
        {({ getFieldValue }) => {
          if (getFieldValue('cate') === 'prometheus') {
            return (
              <Form.Item label={t('enable_in_bg')}>
                <Space align='baseline'>
                  <Form.Item name='enable_in_bg' valuePropName='checked' noStyle>
                    <Switch size='small' />
                  </Form.Item>
                  {t('enable_in_bg_tip')}
                </Space>
              </Form.Item>
            );
          }
        }}
      </Form.Item>
    </SectionCard>
  );
}
