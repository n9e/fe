/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState, useImperativeHandle, ReactNode, useContext } from 'react';
import { Form, Input } from 'antd';
import { getTeamInfo } from '@/services/manage';
import { TeamProps, Team, TeamInfo } from '@/store/manageInterface';
import { useTranslation, Trans } from 'react-i18next';
import { CommonStateContext } from '@/App';

const TeamForm = React.forwardRef<ReactNode, TeamProps>((props, ref) => {
  const { siteInfo } = useContext(CommonStateContext);
  const { t } = useTranslation('user');
  const { teamId } = props;
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<Team>();
  const [loading, setLoading] = useState<boolean>(true);
  useImperativeHandle(ref, () => ({
    form: form,
  }));
  useEffect(() => {
    if (teamId) {
      getTeamInfoDetail(teamId);
    } else {
      setLoading(false);
    }
  }, []);

  const getTeamInfoDetail = (id: string) => {
    getTeamInfo(id).then((data: TeamInfo) => {
      setInitialValues(data.user_group);
      setLoading(false);
    });
  };

  return !loading ? (
    <Form layout='vertical' form={form} initialValues={initialValues} preserve={false}>
      <Form.Item
        label={t('common:table.name')}
        name='name'
        rules={[
          {
            required: true,
          },
        ]}
        tooltip={
          siteInfo?.teamDisplayMode === 'list' ? undefined : (
            <Trans
              ns='user'
              i18nKey='business.name_tip'
              components={{ 1: <br /> }}
              values={{
                separator: siteInfo?.teamSeparator || '-',
              }}
            />
          )
        }
      >
        <Input />
      </Form.Item>
      <Form.Item label={t('common:table.note')} name='note'>
        <Input />
      </Form.Item>
    </Form>
  ) : null;
});
export default TeamForm;
