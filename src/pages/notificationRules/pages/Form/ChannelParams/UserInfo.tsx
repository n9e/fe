import React, { useEffect, useState } from 'react';
import { Form, Select, Row, Col } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { getUserInfoList, getTeamInfoList } from '@/services/manage';
import { SIZE } from '@/utils/constant';

import { NS } from '../../../constants';

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
}

export default function UserInfo(props: Props) {
  const { t } = useTranslation(NS);
  const { prefixNamePath = [], field } = props;
  const [userOptions, setUserOptions] = useState<any[]>();
  const [teamOptions, setTeamOptions] = useState<any[]>();
  const form = Form.useFormInstance();

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
    <Row gutter={SIZE}>
      <Col span={12}>
        <Form.Item {..._.omit(field, ['key'])} label={t('notification_configuration.user_info.user_ids')} name={[field.name, 'params', 'user_ids']}>
          <Select
            options={userOptions}
            showSearch
            optionFilterProp='label'
            mode='multiple'
            onChange={() => {
              // 校验 user_ids 和 user_group_ids
              form.validateFields([[...prefixNamePath, field.name, 'params', 'user_group_ids']]);
            }}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item {..._.omit(field, ['key'])} label={t('notification_configuration.user_info.user_group_ids')} name={[field.name, 'params', 'user_group_ids']}>
          <Select
            options={teamOptions}
            showSearch
            optionFilterProp='label'
            mode='multiple'
            onChange={() => {
              // 校验 user_ids 和 user_group_ids
              form.validateFields([[...prefixNamePath, field.name, 'params', 'user_ids']]);
            }}
          />
        </Form.Item>
      </Col>
    </Row>
  );
}
