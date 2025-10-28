import React from 'react';
import { Form, Tooltip, Space } from 'antd';
import { PlusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '@/plugins/mysql/constants';

import Shard from './Shard';
import { defaultShardValues } from './config';

interface IProps {
  type: string;
}
export default function PermissionConn(props: IProps) {
  const { t } = useTranslation();
  const { type } = props;
  const form = Form.useFormInstance();
  const namePrefix = ['settings'];

  return (
    <div className='mb-4'>
      <Form.List name={[...namePrefix, `${type}.shards`]} initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            <div className='page-title'>
              <Space>
                {t(`${NAME_SPACE}:datasource.shards.title`)}
                {!_.includes(['mysql', 'pgsql'], type) && (
                  <Space>
                    <Tooltip placement='bottomLeft' title={t(`${NAME_SPACE}:datasource.shards.title_tip`)}>
                      <InfoCircleOutlined />
                    </Tooltip>
                    <PlusCircleOutlined onClick={() => add(defaultShardValues(type))} />
                  </Space>
                )}
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
