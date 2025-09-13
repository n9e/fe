import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, Switch, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import filterOptionsByReg from '../../utils/filterOptionsByReg';

export default function Custom() {
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
      <Form.Item label={t('common:btn.data_preview')}>
        <div className='max-h-[100px] overflow-y-auto'>
          {_.isEmpty(options) ? (
            <span className='text-gray-400'>{t('common:nodata')}</span>
          ) : (
            _.map(options, (optionsItem) => {
              return (
                <Tag key={optionsItem.value} className='mb-2'>
                  {optionsItem.label}
                </Tag>
              );
            })
          )}
        </div>
      </Form.Item>
    </>
  );
}
