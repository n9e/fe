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
import React, { useState } from 'react';
import { Button, Popover, message } from 'antd';
import { ExclamationCircleFilled, DeleteTwoTone } from '@ant-design/icons';
import { deleteUser, deleteTeam, deleteMember } from '@/services/manage';
import { PopoverProps } from '@/store/manageInterface';
import './index.less';
import { useTranslation } from 'react-i18next';

const DelPopover: React.FC<PopoverProps> = (props: PopoverProps) => {
  const { t } = useTranslation();
  const { userId, teamId, memberId, userType, onClose, isIcon } = props;
  const [visible, setVisible] = useState<boolean>(false);

  const handleDelete = () => {
    if (userType === 'user' && userId) {
      deleteUser(userId).then((_) => {
        message.success(t('用户删除成功'));
        onClose();
      });
    }

    if (userType === 'team' && teamId) {
      deleteTeam(teamId).then((_) => {
        message.success(t('团队删除成功'));
        onClose();
      });
    }

    if (userType === 'member' && teamId && memberId) {
      let params = {
        ids: [memberId],
      };
      deleteMember(teamId, params).then((_) => {
        message.success(t('成员删除成功'));
        onClose();
      });
    }
  };

  return (
    <Popover
      trigger='click'
      visible={visible}
      content={
        <div className='popover-wrapper'>
          <ExclamationCircleFilled
            style={{
              marginRight: '4px',
              color: '#E6A23C',
            }}
          />
          {t('确定要删除么？')}
          <div className='popover-content'>
            <Button type='primary' size='small' onClick={() => handleDelete()}>
              {t('确定')}
            </Button>
            <Button size='small' onClick={() => setVisible(false)}>
              {t('取消')}
            </Button>
          </div>
        </div>
      }
    >
      {isIcon ? (
        <DeleteTwoTone
          style={{
            marginLeft: '8px',
            fontSize: '16px',
          }}
          twoToneColor='#ff4d4f'
          onClick={() => setVisible(true)}
        />
      ) : (
        <Button className='oper-name' type='text' danger onClick={() => setVisible(true)}>
          {t('删除')}
        </Button>
      )}
    </Popover>
  );
};

export default DelPopover;
