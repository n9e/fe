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
  const { t } = useTranslation('user');
  const { userId, teamId, memberId, userType, onClose, isIcon } = props;
  const [visible, setVisible] = useState<boolean>(false);

  const handleDelete = () => {
    if (userType === 'user' && userId) {
      deleteUser(userId).then((_) => {
        message.success(t('user.delete_success'));
        onClose();
      });
    }

    if (userType === 'team' && teamId) {
      deleteTeam(teamId).then((_) => {
        message.success(t('team.delete_success'));
        onClose();
      });
    }

    if (userType === 'member' && teamId && memberId) {
      let params = {
        ids: [memberId],
      };
      deleteMember(teamId, params).then((_) => {
        message.success(t('team.delete_member_success'));
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
          {t('delete_confirm')}
          <div className='popover-content'>
            <Button type='primary' size='small' onClick={() => handleDelete()}>
              {t('common:btn.ok')}
            </Button>
            <Button size='small' onClick={() => setVisible(false)}>
              {t('common:btn.cancel')}
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
          {t('common:btn.delete')}
        </Button>
      )}
    </Popover>
  );
};

export default DelPopover;
