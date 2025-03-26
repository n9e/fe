import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { getUserInfoList, getTeamInfoList } from '@/services/manage';

import { NS } from '../../../constants';

interface Props {
  field: FormListFieldData;
}

export default function UserInfo(props: Props) {
  const { t } = useTranslation(NS);
  const { field } = props;
  const [userOptions, setUserOptions] = useState<any[]>();
  const [teamOptions, setTeamOptions] = useState<any[]>();
  const form = Form.useFormInstance();
  const user_ids = Form.useWatch(['notify_configs', field.name, 'params', 'user_ids']);
  const user_group_ids = Form.useWatch(['notify_configs', field.name, 'params', 'user_group_ids']);

  useEffect(() => {
    getUserInfoList({ limit: 5000 })
      .then((res) => {
        setUserOptions(
          _.map(res?.dat?.list, (item) => {
            return {
              label: item.username,
              value: item.id,
            };
          }),
        );
      })
      .catch(() => {
        setUserOptions([]);
      });
    getTeamInfoList({ limit: 5000, query: '' })
      .then((res) => {
        setTeamOptions(
          _.map(res?.dat, (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }),
        );
      })
      .catch(() => {
        setTeamOptions([]);
      });
  }, []);

  return (
    <>
      <Form.Item
        {..._.omit(field, ['key'])}
        label={t('notification_configuration.user_info.user_ids')}
        name={[field.name, 'params', 'user_ids']}
        rules={[
          {
            validator: (_rule, value) => {
              // 如果 user_ids 和 user_group_ids 都为空，则报错
              if (_.isEmpty(value) && _.isEmpty(user_group_ids)) {
                return Promise.reject(new Error(t('notification_configuration.user_info.error')));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Select
          options={userOptions}
          showSearch
          optionFilterProp='label'
          mode='multiple'
          onChange={() => {
            // 校验 user_ids 和 user_group_ids
            form.validateFields([['notify_configs', field.name, 'params', 'user_group_ids']]);
          }}
        />
      </Form.Item>
      <Form.Item
        {..._.omit(field, ['key'])}
        label={t('notification_configuration.user_info.user_group_ids')}
        name={[field.name, 'params', 'user_group_ids']}
        rules={[
          {
            validator: (_rule, value) => {
              // 如果 user_ids 和 user_group_ids 都为空，则报错
              if (_.isEmpty(value) && _.isEmpty(user_ids)) {
                return Promise.reject(new Error(t('notification_configuration.user_info.error')));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Select
          options={teamOptions}
          showSearch
          optionFilterProp='label'
          mode='multiple'
          onChange={() => {
            // 校验 user_ids 和 user_group_ids
            form.validateFields([['notify_configs', field.name, 'params', 'user_ids']]);
          }}
        />
      </Form.Item>
    </>
  );
}
