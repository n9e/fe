import React, { useContext } from 'react';
import { Form, Card, Space, Switch, Button, Tag } from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';

import Trigger from './Trigger';
import NodataTrigger from './NodataTrigger';
import AnomalyTrigger from './AnomalyTrigger';

interface IProps {
  defaultActiveKey: string;
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
  const { defaultActiveKey, prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled, initialValue } = props;
  const [activeKey, setActiveKey] = React.useState(defaultActiveKey);

  const cate = Form.useWatch(['cate']);
  const exp_trigger_disable = Form.useWatch([...prefixName, 'exp_trigger_disable']);
  const nodata_trigger_enable = Form.useWatch([...prefixName, 'nodata_trigger', 'enable']);
  const anomaly_trigger_enable = Form.useWatch([...prefixName, 'anomaly_trigger', 'enable']);

  const showAnomalyTrigger = cate === 'prometheus' && feats?.fcBrain === true;

  return (
    <div>
      <FormItemLabel description={showAnomalyTrigger ? t('form_ng.triggers_desc_anomaly') : t('form_ng.triggers_desc')}>{t('form_ng.triggers')}</FormItemLabel>
      <Card
        size='small'
        tabProps={{
          size: 'small',
        }}
        tabList={_.concat(
          [
            {
              key: 'triggers',
              tab: (
                <Space>
                  {t('trigger.title')}
                  {exp_trigger_disable === false && <CheckCircleOutlined style={{ color: 'var(--fc-fill-success)', margin: 0 }} />}
                </Space>
              ),
            },
            {
              key: 'nodata_trigger',
              tab: (
                <Space>
                  {t('nodata_trigger.title')}
                  {nodata_trigger_enable === true && <CheckCircleOutlined style={{ color: 'var(--fc-fill-success)' }} />}
                </Space>
              ),
            },
          ],
          showAnomalyTrigger
            ? [
                {
                  key: 'anomaly_trigger',
                  tab: (
                    <Space>
                      {t('anomaly_trigger.title')}
                      {anomaly_trigger_enable === true && <CheckCircleOutlined style={{ color: 'var(--fc-fill-success)' }} />}
                    </Space>
                  ),
                },
              ]
            : [],
        )}
        activeTabKey={activeKey}
        onTabChange={(key) => {
          setActiveKey(key);
        }}
      >
        <div className='flex-col gap-4' style={{ display: activeKey === 'triggers' ? 'flex' : 'none' }}>
          <Space>
            <Form.Item
              noStyle
              name={[...prefixName, 'exp_trigger_disable']}
              valuePropName='checked'
              getValueFromEvent={(checked) => !checked}
              getValueProps={(value) => ({ checked: !value })}
            >
              <Switch size='small' />
            </Form.Item>
            {t('trigger.exp_trigger_disable')}
            <Tag color='purple'>{t('trigger.threshold_tip')}</Tag>
          </Space>
          <div style={{ display: exp_trigger_disable !== false ? 'none' : 'block' }}>
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
        </div>
        <div
          style={{
            display: activeKey === 'nodata_trigger' ? 'block' : 'none',
          }}
        >
          <NodataTrigger prefixName={prefixName} />
        </div>
        <div
          style={{
            display: activeKey === 'anomaly_trigger' ? 'block' : 'none',
          }}
        >
          <AnomalyTrigger prefixName={prefixName} active={activeKey === 'anomaly_trigger'} />
        </div>
      </Card>
    </div>
  );
}
