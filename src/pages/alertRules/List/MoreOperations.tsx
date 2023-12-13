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
import React, { useContext, useState } from 'react';
import _ from 'lodash';
import { Dropdown, Button, Modal, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { deleteStrategy, updateAlertRules, updateServiceCal, updateNotifyChannels } from '@/services/warning';
import { CommonStateContext } from '@/App';
import Import from './Import';
import Export from './Export';
import EditModal from './EditModal';

interface MoreOperationsProps {
  bgid: number;
  selectRowKeys: React.Key[];
  selectedRows: any[];
  getAlertRules: () => void;
}

const exportIgnoreAttrsObj = {
  cluster: undefined,
  create_by: undefined,
  group_id: undefined,
  id: undefined,
  notify_groups_obj: undefined,
  notify_groups: undefined,
  notify_users: undefined,
  create_at: undefined,
  update_at: undefined,
  update_by: undefined,
};

export default function MoreOperations(props: MoreOperationsProps) {
  const { t } = useTranslation('alertRules');
  const { bgid, selectRowKeys, selectedRows, getAlertRules } = props;
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);
  const { groupedDatasourceList, datasourceCateOptions, isPlus } = useContext(CommonStateContext);

  return (
    <>
      <Dropdown
        overlay={
          <ul className='ant-dropdown-menu'>
            <li
              className='ant-dropdown-menu-item'
              onClick={() => {
                Import({
                  busiId: bgid,
                  refreshList: getAlertRules,
                  groupedDatasourceList,
                  datasourceCateOptions,
                });
              }}
            >
              <span>{t('batch.import.title')}</span>
            </li>
            <li
              className='ant-dropdown-menu-item'
              onClick={() => {
                if (selectedRows.length) {
                  const exportData = selectedRows.map((item) => {
                    return { ...item, ...exportIgnoreAttrsObj };
                  });
                  Export({
                    data: JSON.stringify(exportData, null, 2),
                  });
                } else {
                  message.warning(t('batch.not_select'));
                }
              }}
            >
              <span>{t('batch.export.title')}</span>
            </li>
            <li
              className='ant-dropdown-menu-item'
              onClick={() => {
                if (selectRowKeys.length) {
                  Modal.confirm({
                    title: t('batch.delete_confirm'),
                    onOk: () => {
                      deleteStrategy(selectRowKeys as number[], bgid).then(() => {
                        message.success(t('batch.delete.success'));
                        getAlertRules();
                      });
                    },
                  });
                } else {
                  message.warning(t('batch.not_select'));
                }
              }}
            >
              <span>{t('batch.delete')}</span>
            </li>
            <li
              className='ant-dropdown-menu-item'
              onClick={() => {
                if (selectRowKeys.length == 0) {
                  message.warning(t('batch.not_select'));
                  return;
                }
                setisModalVisible(true);
              }}
            >
              <span>{t('batch.update.title')}</span>
            </li>
          </ul>
        }
        trigger={['click']}
      >
        <Button onClick={(e) => e.stopPropagation()}>
          {t('common:btn.more')}
          <DownOutlined
            style={{
              marginLeft: 2,
            }}
          />
        </Button>
      </Dropdown>
      <EditModal
        isModalVisible={isModalVisible}
        editModalFinish={async (isOk, fieldsData) => {
          if (isOk) {
            if (isPlus && fieldsData?.service_cal_ids) {
              const res = await updateServiceCal(
                {
                  ids: selectRowKeys,
                  service_cal_ids: fieldsData?.service_cal_ids || [],
                },
                bgid,
              );
              if (!res.err) {
                message.success('修改成功！');
                getAlertRules();
                setisModalVisible(false);
              } else {
                message.error(res.err);
              }
            } else if (isPlus && fieldsData?.notify_channels) {
              const res = await updateNotifyChannels(
                {
                  ids: selectRowKeys,
                  notify_channels: _.split(fieldsData?.notify_channels, ' ') || [],
                  custom_notify_tpl: fieldsData?.custom_notify_tpl || {},
                },
                bgid,
              );
              if (!res.err) {
                message.success('修改成功！');
                getAlertRules();
                setisModalVisible(false);
              } else {
                message.error(res.err);
              }
            } else {
              const action = fieldsData.action;
              delete fieldsData.action;
              const res = await updateAlertRules(
                {
                  ids: selectRowKeys,
                  fields: fieldsData,
                  action,
                },
                bgid,
              );
              if (!res.err) {
                message.success('修改成功！');
                getAlertRules();
                setisModalVisible(false);
              } else {
                message.error(res.err);
              }
            }
          } else {
            setisModalVisible(false);
          }
        }}
      />
    </>
  );
}
