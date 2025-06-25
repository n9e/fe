import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Row, Col, Select, AutoComplete } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import { rangeOptions } from '@/components/TimeRangePicker/config';
import Vars from './Vars';

export default function LogExplore({ vars }: { vars: string[] }) {
  const { t } = useTranslation('inputEnlarge');
  const handleClickVar = (v: string) => {};
  return (
    <div>
      <Form.Item name={['logExplore', 'range']} label={t('时间范围')} initialValue={'from-to'}>
        <Select>
          <Select.Option value='from-to'>{t('继承当前查询时间')}</Select.Option>
          {rangeOptions.map((item) => (
            <Select.Option key={item.start} value={item.start}>
              {t(`timeRangePicker:rangeOptions.${item.display}`)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={['logExplore', 'weweweww']} label={t('请选择日志库')}></Form.Item>
      <Vars vars={vars} handleClickVar={handleClickVar} />
    </div>
  );
}
