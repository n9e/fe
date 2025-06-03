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
import moment from 'moment';
import { Dropdown, Button, Modal, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { json2csv } from 'json-2-csv';
import { deleteStrategy, updateAlertRules, updateServiceCal, updateNotifyChannels } from '@/services/warning';
import { CommonStateContext } from '@/App';
import Export from './Export';
import EditModal from './EditModal';
import CloneToHosts from './CloneToHosts';
import CloneToBgids from './CloneToBgids';
import { downloadFile } from './utils';

interface MoreOperationsProps {
  bgid?: number; // 如果 isLeaf 为 true，则 bgid 必须存在
  isLeaf: boolean;
  selectRowKeys: React.Key[];
  selectedRows: any[];
  getAlertRules: () => void;
}

const ignoreFields = [
  'id',
  'group_id',
  'datasource_ids',
  'cluster',
  'algorithm',
  'algo_params',
  'severity',
  'severities',
  'disabled',
  'prom_ql',
  'enable_stime',
  'enable_stimes',
  'enable_etime',
  'enable_etimes',
  'enable_days_of_week',
  'enable_days_of_weeks',
  'notify_channels',
  'notify_groups_obj',
  'notify_groups',
  'runbook_url',
  'extra_config',
  'create_at',
  'create_by',
  'update_at',
  'update_by',
];

export default function MoreOperations(props: MoreOperationsProps) {
  const { t } = useTranslation('alertRules');
  const { bgid, isLeaf, selectRowKeys, selectedRows, getAlertRules } = props;
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);
  const { isPlus, busiGroups } = useContext(CommonStateContext);

  return (
    <>
      <Dropdown
        overlay={
          <ul className='ant-dropdown-menu'>
            <li
              className='ant-dropdown-menu-item'
              onClick={() => {
                if (selectedRows.length) {
                  const exportData = selectedRows.map((item) => {
                    return _.omit(item, ignoreFields);
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
            {isLeaf && (
              <li
                className='ant-dropdown-menu-item'
                onClick={() => {
                  if (selectRowKeys.length) {
                    Modal.confirm({
                      title: t('batch.delete_confirm'),
                      onOk: () => {
                        deleteStrategy(selectRowKeys as number[], bgid!).then(() => {
                          message.success(t('batch.delete_success'));
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
            )}
            {isLeaf && (
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
            )}
            {isLeaf && (
              <li
                className='ant-dropdown-menu-item'
                onClick={() => {
                  if (selectRowKeys.length == 0) {
                    message.warning(t('batch.not_select'));
                    return;
                  }
                  CloneToBgids({
                    ids: selectRowKeys,
                    busiGroups,
                    onOk: getAlertRules,
                  });
                }}
              >
                <span>{t('batch.clone_to_bgids.title')}</span>
              </li>
            )}
            {isPlus && isLeaf && (
              <li
                className='ant-dropdown-menu-item'
                onClick={() => {
                  if (selectRowKeys.length == 0) {
                    message.warning(t('batch.not_select'));
                    return;
                  }
                  CloneToHosts({
                    gid: bgid!,
                    ids: selectRowKeys,
                    busiGroups,
                    onOk: getAlertRules,
                  });
                }}
              >
                <span>{t('batch.cloneToHosts.title')}</span>
              </li>
            )}
            <li
              className='ant-dropdown-menu-item'
              onClick={() => {
                if (selectRowKeys.length == 0) {
                  message.warning(t('batch.not_select'));
                  return;
                }
                json2csv(selectedRows, (err, csv) => {
                  if (err) {
                    message.error(t('export_failed'));
                  } else {
                    downloadFile(csv, `alert_rules_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
                  }
                });
              }}
            >
              <span>{t('batch.export_to_csv')}</span>
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
          if (isOk && bgid) {
            if (isPlus && fieldsData?.service_cal_ids) {
              const res = await updateServiceCal(
                {
                  ids: selectRowKeys,
                  service_cal_ids: fieldsData?.service_cal_ids || [],
                },
                bgid,
              );
              if (!res.err) {
                message.success('common:success.modify');
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
                message.success(t('common:success.modify'));
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
                message.success(t('common:success.modify'));
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
        selectedRows={selectedRows}
      />
    </>
  );
}
