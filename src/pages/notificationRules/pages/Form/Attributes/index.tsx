import React from 'react';
import { Form, Row, Col, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS } from '../../../constants';
import TagItem from './TagItem';

interface Props {
  disabled?: boolean;
  field?: any;
  fullName?: (string | number)[];
  name?: string | (string | number)[];
}

export default function index(props: Props) {
  const { t } = useTranslation('KVTagSelect');
  const { disabled, field = {}, fullName = [], name = [field.name, 'attributes'] } = props;
  const restField = _.omit(field, ['key', 'name']);

  return (
    <Form.List {...restField} name={name}>
      {(fields, { add, remove }) => (
        <>
          <Row gutter={[10, 10]} className='mb1'>
            <Col span={5}>
              <Space align='baseline' size={4}>
                {t(`${NS}:notification_configuration.attributes`)}
                <Tooltip className='n9e-ant-from-item-tooltip' title={t(`${NS}:notification_configuration.attributes_tip`)}>
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
            {fields.length ? <Col span={3}>{t('tag.func.label')}</Col> : null}
            {fields.length ? <Col span={16}>{t(`${NS}:notification_configuration.attributes_value`)}</Col> : null}
          </Row>
          {fields.map((field) => (
            <TagItem key={field.key} disabled={disabled} fullName={[...fullName, ...name]} field={field} remove={remove} />
          ))}
        </>
      )}
    </Form.List>
  );
}
