import React, { useMemo } from 'react';
import { Form, Select, Row, Col } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { getUserInfoList, getTeamInfoList } from '@/services/manage';
import { SIZE } from '@/utils/constant';

import { NS, OPTIONS_CACHE_STALE_TIME } from '../../../constants';

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
}

interface UserInfoItem {
  id: number;
  username: string;
}

interface UserGroupItem {
  id: number;
  name: string;
}

interface UserInfoResponse {
  dat?: {
    list?: UserInfoItem[];
  };
}

interface UserGroupResponse {
  dat?: UserGroupItem[];
}

export default function UserInfo(props: Props) {
  const { t } = useTranslation(NS);
  const { prefixNamePath = [], field } = props;
  const form = Form.useFormInstance();
  const { data: userData, error: userError } = useRequest<UserInfoResponse, []>(() => getUserInfoList({ limit: 5000 }), {
    cacheKey: 'notification-rule-user-info-list-5000',
    staleTime: OPTIONS_CACHE_STALE_TIME,
    onError: () => {},
  });
  const { data: teamData, error: teamError } = useRequest<UserGroupResponse, []>(() => getTeamInfoList({ limit: 5000, query: '' }), {
    cacheKey: 'notification-rule-user-group-list-5000-empty-query',
    staleTime: OPTIONS_CACHE_STALE_TIME,
    onError: () => {},
  });
  const userOptions = useMemo(
    () =>
      _.map(userError ? [] : userData?.dat?.list ?? [], (item) => {
        return {
          label: item.username,
          value: item.id,
        };
      }),
    [userData, userError],
  );
  const teamOptions = useMemo(
    () =>
      _.map(teamError ? [] : teamData?.dat ?? [], (item) => {
        return {
          label: item.name,
          value: item.id,
        };
      }),
    [teamData, teamError],
  );

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
