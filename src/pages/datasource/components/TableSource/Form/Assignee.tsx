import React, { useEffect, useState } from 'react';
import { Cascader } from 'antd';
import { useTranslation } from 'react-i18next';
import useAssigneeList from '../useAssigneeList';
interface Props {
  value?: any;
  onChange?: (value: any) => void;
}

export default function (props: Props) {
  const { value, onChange } = props;
  const { t } = useTranslation('datasourceManage');
  const { userList, teamList, busiGroupList } = useAssigneeList();
  const filter = (inputValue: string, path) => {
    return path.some((option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };

  return (
    <Cascader
      multiple
      value={value}
      onChange={onChange}
      options={[
        {
          value: 'user',
          label: t('auth.alluser'),
          children: userList,
        },
        {
          value: 'user_group',
          label: t('auth.allusergroup'),
          children: teamList,
        },
        {
          value: 'busi_group',
          label: t('auth.allbusigroup'),
          children: busiGroupList,
        },
      ]}
      showSearch={{
        filter,
      }}
      allowClear
      placeholder={t('auth.assignplaceholder')}
    />
  );
}
