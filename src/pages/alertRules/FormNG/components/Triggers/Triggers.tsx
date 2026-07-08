import React, { useContext } from 'react';
import { Form, Switch, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import CardContainer from '@/pages/alertRules/FormNG/components/CardContainer';

import Trigger from './Trigger';
import NodataTrigger from './NodataTrigger';
import AnomalyTrigger from './AnomalyTrigger';

interface IProps {
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  queries: any[];
  disabled?: boolean;
  initialValue?: any;
}

export default function index(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { feats } = useContext(CommonStateContext);
  const { prefixField = {}, prefixName = [], queries, disabled, initialValue } = props;

  const cate = Form.useWatch(['cate']);
  const exp_trigger_disable = Form.useWatch([...prefixName, 'exp_trigger_disable']);
  const nodata_trigger_enable = Form.useWatch([...prefixName, 'nodata_trigger', 'enable']);
  const anomaly_trigger_enable = Form.useWatch([...prefixName, 'anomaly_trigger', 'enable']);

  const showAnomalyTrigger = cate === 'prometheus' && feats?.fcBrain === true;

  return (
    <div>
      <FormItemLabel>{t('form_ng.triggers')}</FormItemLabel>

      {/* 阈值判断 */}
      <CardContainer className='mb-2'>
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-center gap-2'>
            <span className='font-bold'>{t('trigger.title')}</span>
            <Form.Item
              noStyle
              name={[...prefixName, 'exp_trigger_disable']}
              valuePropName='checked'
              getValueFromEvent={(checked) => !checked}
              getValueProps={(value) => ({ checked: !value })}
            >
              <Switch size='small' />
            </Form.Item>
          </div>
          <div className='text-soft'>{t('form_ng.triggers_threshold_desc')}</div>
        </div>
        {exp_trigger_disable === false && (
          <div className='mt-4'>
            <div className='mb-4'>
              <Inhibit triggersKey='triggers' />
            </div>
            <Form.List {...prefixField} name={[...prefixName, 'triggers']} initialValue={initialValue}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => {
                    return (
                      <div key={field.key} className='relative'>
                        <Trigger
                          prefixField={_.omit(field, 'key')}
                          fullPrefixName={[...prefixName, 'triggers', field.name]}
                          prefixName={[field.name]}
                          queries={queries}
                          disabled={disabled}
                          onClose={fields.length > 1 ? () => remove(field.name) : undefined}
                        />
                      </div>
                    );
                  })}
                  <Button
                    className='w-full'
                    type='dashed'
                    icon={<PlusOutlined />}
                    onClick={() => {
                      add({
                        mode: 0,
                        expressions: [
                          {
                            ref: queries?.[0]?.ref || 'A',
                            comparisonOperator: '==',
                            logicalOperator: '&&',
                          },
                        ],
                        severity: 2,
                      });
                    }}
                  >
                    {t('form_ng.threshold_judgment')}
                  </Button>
                </>
              )}
            </Form.List>
          </div>
        )}
      </CardContainer>

      {/* 数据缺失 */}
      <CardContainer className='mb-2'>
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-center gap-2'>
            <span className='font-bold'>{t('nodata_trigger.title')}</span>
            <Form.Item noStyle name={[...prefixName, 'nodata_trigger', 'enable']} valuePropName='checked'>
              <Switch size='small' />
            </Form.Item>
          </div>
          <div className='text-soft'>{t('form_ng.triggers_nodata_desc')}</div>
        </div>
        {nodata_trigger_enable === true && (
          <div className='mt-4'>
            <NodataTrigger prefixName={prefixName} hideSwitch />
          </div>
        )}
      </CardContainer>

      {/* 智能告警 */}
      {showAnomalyTrigger && (
        <CardContainer className='mb-2'>
          <div className='flex flex-col gap-0.5'>
            <div className='flex items-center gap-2'>
              <span className='font-bold'>{t('anomaly_trigger.title')}</span>
              <Form.Item noStyle name={[...prefixName, 'anomaly_trigger', 'enable']} valuePropName='checked'>
                <Switch size='small' />
              </Form.Item>
            </div>
            <div className='text-soft'>{t('form_ng.triggers_anomaly_desc')}</div>
          </div>
          {anomaly_trigger_enable === true && (
            <div className='mt-4'>
              <AnomalyTrigger prefixName={prefixName} active hideSwitch />
            </div>
          )}
        </CardContainer>
      )}
    </div>
  );
}
