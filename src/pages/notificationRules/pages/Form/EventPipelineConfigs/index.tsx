import React from 'react';
import { Form, Card, Space, Input, Select, Switch, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { NS } from '../../../constants';

export default function index() {
  const { t } = useTranslation(NS);

  return <Card className='mb2' title={<Space>{t('pipeline_configuration.title')}</Space>}></Card>;
}
