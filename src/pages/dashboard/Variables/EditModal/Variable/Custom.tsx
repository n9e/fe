import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Form, Input, Row, Col, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import filterOptionsByReg from '../../utils/filterOptionsByReg';
import Preview from '../Preview';

interface Props {
  footerExtraRef: React.RefObject<HTMLDivElement>;
}

export default function Custom(props: Props) {
  const { t } = useTranslation('dashboard');
  const multi = Form.useWatch(['multi']);
  const allOption = Form.useWatch(['allOption']);
  const definition = Form.useWatch(['definition']);
  const [options, setOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    const options = _.map(_.compact(_.split(definition, ',')), _.trim);
    const itemOptions = _.sortBy(filterOptionsByReg(options), 'value');

    setOptions(itemOptions);
  }, [JSON.stringify(definition)]);

  return (
    <>
      <Form.Item label={t('var.custom.definition')} name='definition' rules={[{ required: true }]}>
        <Input placeholder='1,10' />
      </Form.Item>
      <Row gutter={16}>
        <Col flex='120px'>
          <Form.Item label={t('var.multi')} name='multi' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
        {multi ? (
          <Col flex='120px'>
            <Form.Item label={t('var.allOption')} name='allOption' valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        ) : null}
        {multi && allOption ? (
          <Col flex='auto'>
            <Form.Item label={t('var.allValue')} name='allValue'>
              <Input placeholder='.*' />
            </Form.Item>
          </Col>
        ) : null}
      </Row>
      {createPortal(<Preview options={options} />, props.footerExtraRef.current!)}
    </>
  );
}
