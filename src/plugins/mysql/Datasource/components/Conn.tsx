import React from 'react';
import { Form, Tooltip, Space } from 'antd';
import { PlusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../constants';
import { defaultShardValues } from '../config';
import Shard from './Shard';

interface IProps {
  type: string;
}
export default function PermissionConn(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { type } = props;
  const form = Form.useFormInstance();
  const namePrefix = ['settings'];

  return (
    <div className='mb2'>
      <Form.List name={[...namePrefix, `${type}.shards`]} initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            <div className='page-title'>
              <Space>
                {t('datasource.shards.title')}
                <Tooltip placement='bottomLeft' title={t('datasource.shards.title_tip')}>
                  <InfoCircleOutlined />
                </Tooltip>
                <PlusCircleOutlined onClick={() => add(defaultShardValues(type))} />
              </Space>
            </div>
            {fields.map((field) => {
              return <Shard key={field.key} form={form} field={field} fields={fields} remove={remove} type={type} />;
            })}
          </>
        )}
      </Form.List>
    </div>
  );
}
