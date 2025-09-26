import React, { useState, useEffect } from 'react';
import { Form, Input, Alert, Row, Col, Switch, Tag } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';

import { useGlobalState } from '@/pages/dashboard/globalState';
import { getMonObjectList } from '@/services/targets';

import filterOptionsByReg from '../../utils/filterOptionsByReg';

interface Props {
  formatedReg: string;
}

export default function HostIdent(props: Props) {
  const { t } = useTranslation('dashboard');
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { formatedReg } = props;
  const anonymousAccess = dashboardMeta.public === 1 && dashboardMeta.public_cate === 0;
  const multi = Form.useWatch(['multi']);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [options, setOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    getMonObjectList({
      gids: dashboardMeta.group_id,
      p: 1,
      limit: 5000,
    })
      .then((res) => {
        const options = _.sortBy(_.uniq(_.map(res?.dat?.list, 'ident')));
        const itemOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), formatedReg), 'value');
        setOptions(itemOptions);
        setErrorMsg('');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Error fetching variable options');
      });
  }, [formatedReg]);

  return (
    <>
      {anonymousAccess && <Alert className='mb2' type='warning' message={t('var.hostIdent.invalid')} />}
      <Form.Item
        label={t('var.reg')}
        name='reg'
        tooltip={
          <Trans
            ns='dashboard'
            i18nKey='var.reg_tip'
            components={{ a: <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions' /> }}
          />
        }
        rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
      >
        <Input placeholder='/*.hna/' />
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
      </Row>
      <Form.Item label={t('common:btn.data_preview')}>
        <div className='max-h-[100px] overflow-y-auto'>
          {errorMsg && <Alert className='mb-4' type='error' message={errorMsg} />}
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
