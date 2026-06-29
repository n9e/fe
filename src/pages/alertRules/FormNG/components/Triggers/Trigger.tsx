import React from 'react';
import { Form, Radio, Space } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import Severity from '@/pages/alertRules/Form/components/Severity';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';

import Builder from './Builder';
import Code from './Code';
import RecoverConfig from './RecoverConfig';
import Joins from './Joins';

interface IProps {
  prefixField?: any;
  fullPrefixName?: (string | number)[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: (string | number)[]; // 列表字段名
  queries: any[];
  disabled?: boolean;
  onClose?: () => void;
}

export default function Trigger(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled, onClose } = props;
  const [expanded, setExpanded] = React.useState(false);

  return (
    <CardContainer onClose={onClose}>
      <CardContainerHeader>
        <Form.Item {...prefixField} name={[...prefixName, 'mode']}>
          <Radio.Group buttonStyle='solid' size='small' disabled={disabled}>
            <Radio.Button value={0}>{t('datasource:es.alert.trigger.builder')}</Radio.Button>
            <Radio.Button value={1}>{t('datasource:es.alert.trigger.code')}</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </CardContainerHeader>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const mode = getFieldValue([...fullPrefixName, 'mode']);
          if (mode == 0) {
            return <Builder prefixField={prefixField} prefixName={prefixName} queries={queries} disabled={disabled} />;
          }
          if (mode === 1) {
            return <Code prefixField={prefixField} prefixName={prefixName} disabled={disabled} />;
          }
        }}
      </Form.Item>
      <div className='mb-4'>
        <Severity field={prefixField} disabled={disabled} />
      </div>
      <div>
        <div className='mb-2'>
          <Space
            className='cursor-pointer'
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            {t('trigger.advanced_settings.label')}
            {expanded ? <DownOutlined /> : <RightOutlined />}
          </Space>
        </div>
        <div
          style={{
            display: expanded ? 'block' : 'none',
          }}
        >
          <RecoverConfig {...props} />
          <Joins {...props} />
        </div>
      </div>
    </CardContainer>
  );
}
