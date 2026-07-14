import React, { useContext, useEffect, useState } from 'react';
import { Form, Select, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { getTeamInfoList } from '@/services/manage';

import { NS } from '../constants';

// SkillAuthFields 渲染「管理团队」(必填多选) + 「可见范围」(全员可见/仅管理团队可见单选) 两个字段，
// 必须置于外层 antd <Form> 内（字段名 user_group_ids / private，与后端及在线创建/编辑
// 表单一致）。导入、远程安装、替换、更新等各弹窗复用它，口径统一。
// 「可见范围」仅 admin 渲染；非 admin 提交时由各入口用 resolveSubmitPrivate 兜底：
// 新建默认私有，替换/更新沿用既有值（不改变可见性）。
export default function SkillAuthFields() {
  const { t } = useTranslation(NS);
  const { profile } = useContext(CommonStateContext);
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getTeamInfoList()
      .then((res) => {
        setUserGroups(res.dat ?? []);
      })
      .catch(() => {
        setUserGroups([]);
      });
  }, []);

  return (
    <>
      <Form.Item label={t('form.user_group_ids')} name='user_group_ids' rules={[{ required: true }]}>
        <Select
          showSearch
          optionFilterProp='label'
          mode='multiple'
          placeholder={t('form.user_group_ids_placeholder')}
          options={_.map(userGroups, (item) => ({ label: item.name, value: item.id }))}
        />
      </Form.Item>
      {profile.admin && (
        <Form.Item label={t('form.scope')} name='private' initialValue={1}>
          <Radio.Group>
            <Radio value={0}>{t('form.scope_public')}</Radio>
            <Radio value={1}>{t('form.scope_private')}</Radio>
          </Radio.Group>
        </Form.Item>
      )}
    </>
  );
}
