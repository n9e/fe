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
import React, { useEffect, useState, useImperativeHandle, ReactNode, useCallback, useContext } from 'react';
import { Form, Input, Select, Switch, Tag, Space, Button, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusOutlined, CaretDownOutlined, PlusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getBusinessTeamInfo, getTeamInfoList } from '@/services/manage';
import { TeamProps, Team, ActionType } from '@/store/manageInterface';
import { useTranslation, Trans } from 'react-i18next';
import { debounce } from 'lodash';
import { CommonStateContext } from '@/App';

const { Option } = Select;
const TeamForm = React.forwardRef<ReactNode, TeamProps>((props, ref) => {
  const { siteInfo } = useContext(CommonStateContext);
  const { t } = useTranslation('user');
  const { businessId, action } = props;
  const [form] = Form.useForm();
  const [userTeam, setUserTeam] = useState<Team[]>([]);
  const [initialValues, setInitialValues] = useState({
    members: [{ perm_flag: true }],
    name: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState(true);
  useImperativeHandle(ref, () => ({
    form: form,
  }));

  useEffect(() => {
    if (action === ActionType.CreateBusiness || action === ActionType.AddBusinessMember) {
      getList('');
    } else if (businessId && action === ActionType.EditBusiness) {
      getTeamInfoDetail(businessId);
    } else {
      setLoading(false);
    }
  }, []);

  const getTeamInfoDetail = (id: string) => {
    getBusinessTeamInfo(id).then((data: { name: string; user_groups: { perm_flag: string; user_group: { id: number } }[] }) => {
      setInitialValues({
        name: data.name,
        members: data.user_groups.map((item) => ({
          perm_flag: item.perm_flag === 'rw',
          user_group_id: item.user_group?.id,
        })),
      });
      setLoading(false);
    });
  };

  const getList = (str: string) => {
    getTeamInfoList({ query: str }).then((res) => {
      setUserTeam(res.dat);
      setLoading(false);
    });
  };

  const debounceFetcher = useCallback(debounce(getList, 800), []);

  return !loading ? (
    <Form layout='vertical' form={form} initialValues={initialValues} preserve={false}>
      {action !== ActionType.AddBusinessMember && (
        <>
          <Form.Item
            label={t('business.name')}
            name='name'
            rules={[
              {
                required: true,
              },
            ]}
            tooltip={
              siteInfo?.businessGroupDisplayMode === 'list' ? undefined : (
                <Trans
                  ns='user'
                  i18nKey='business.name_tip'
                  components={{ 1: <br /> }}
                  values={{
                    separator: siteInfo?.businessGroupSeparator || '-',
                  }}
                />
              )
            }
          >
            <Input />
          </Form.Item>
        </>
      )}

      {(action === ActionType.CreateBusiness || action === ActionType.AddBusinessMember) && (
        <Form.Item required>
          <Form.List name='members'>
            {(fields, { add, remove }) => (
              <>
                <div className='mb8'>
                  <Space>
                    {t('business.team_name')}
                    <Tooltip title={t('business.team_name_tip')}>
                      <InfoCircleOutlined />
                    </Tooltip>
                    <PlusCircleOutlined
                      onClick={() =>
                        add({
                          perm_flag: true,
                        })
                      }
                    />
                  </Space>
                </div>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                    <Form.Item style={{ width: 450 }} {...restField} name={[name, 'user_group_id']} rules={[{ required: true, message: t('business.user_group_msg') }]}>
                      <Select
                        suffixIcon={<CaretDownOutlined />}
                        style={{ width: '100%' }}
                        filterOption={false}
                        onSearch={(e) => debounceFetcher(e)}
                        showSearch
                        onBlur={() => getList('')}
                      >
                        {userTeam.map((team) => (
                          <Option key={team.id} value={team.id}>
                            {team.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'perm_flag']}>
                      <Select
                        options={[
                          {
                            label: t('business.perm_flag_1'),
                            value: true,
                          },
                          {
                            label: t('business.perm_flag_0'),
                            value: false,
                          },
                        ]}
                      />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </Form.Item>
      )}
    </Form>
  ) : null;
});
export default TeamForm;
