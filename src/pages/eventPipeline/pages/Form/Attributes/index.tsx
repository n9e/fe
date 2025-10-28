import React from 'react';
import { Form, Row, Col, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';

import { NS } from '../../../constants';
import TagItem from './TagItem';

interface Props {
  disabled?: boolean;
  field?: any;
  name?: string[];
}

export default function index(props: Props) {
  const { t } = useTranslation('KVTagSelect');
  const { disabled, field = {}, name = [] } = props;

  return (
    <Form.List {...field} name={name}>
      {(fields, { add, remove }) => (
        <>
          <Row gutter={10} className='mb-2'>
            <Col span={8}>
              <Space align='baseline' size={4}>
                {t(`${NS}:attribute_filters`)}
                <Tooltip
                  className='n9e-ant-from-item-tooltip'
                  overlayClassName='ant-tooltip-auto-width'
                  title={<Trans ns={NS} i18nKey={`${NS}:attribute_filters_tip`} components={{ br: <br /> }} />}
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                {!disabled && (
                  <PlusCircleOutlined
                    onClick={() => {
                      add({
                        key: 'group_name',
                        func: '==',
                      });
                    }}
                  />
                )}
              </Space>
            </Col>
            {fields.length ? <Col span={4}>{t('tag.func.label')}</Col> : null}
            {fields.length ? <Col span={12}>{t(`${NS}:attribute_filters_value`)}</Col> : null}
          </Row>
          {fields.map((field) => (
            <TagItem key={field.key} disabled={disabled} fullName={name} field={field} remove={remove} />
          ))}
        </>
      )}
    </Form.List>
  );
}
