import React from 'react';
import { Row, Col, Form, Select, Input } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  prefixField?: any;
  fullPrefixName?: (string | number)[];
  prefixName?: (string | number)[];
  disabled?: boolean;
}

export default function index(props: Props) {
  const { t } = useTranslation('alertRules');
  const { prefixField = {}, fullPrefixName = [], prefixName = [], disabled } = props;
  const judge_type = Form.useWatch([...fullPrefixName, 'recover_config', 'judge_type']);

  return (
    <div>
      <Row wrap={false} gutter={8}>
        <Col flex='none'>
          <div className='mt1'>{t('trigger.recover_config.label')}</div>
        </Col>
        <Col flex='200px'>
          <Form.Item {...prefixField} name={[...prefixName, 'recover_config', 'judge_type']} initialValue={0}>
            <Select
              disabled={disabled}
              options={[
                {
                  label: t('trigger.recover_config.judge_type.0'),
                  value: 0,
                },
                {
                  label: t('trigger.recover_config.judge_type.1'),
                  value: 1,
                },
                {
                  label: t('trigger.recover_config.judge_type.2'),
                  value: 2,
                },
              ]}
            />
          </Form.Item>
        </Col>
        {judge_type === 2 && (
          <Col flex='auto'>
            <Form.Item {...prefixField} name={[...prefixName, 'recover_config', 'recover_exp']}>
              <Input placeholder={t('trigger.recover_config.recover_exp_placeholder')} />
            </Form.Item>
          </Col>
        )}
      </Row>
    </div>
  );
}
