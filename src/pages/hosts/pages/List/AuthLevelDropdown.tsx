import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Menu, Modal, Table, Tooltip, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { NS } from '../../constants';
import { Item } from '../../types';
import { putAiTaskConfigs } from '../../services';
import getAuthLevelDisplayMap from '../../utils/getAuthLevelDisplayMap';
import Tags from './Tags';
// @ts-ignore
import UpgradeAgent from 'plus:/parcels/Targets/UpgradeAgent';

interface Props {
  selectedIdents: string[];
  selectedRows: Item[];
  onSuccess: () => void;
}

export default function AuthLevelDropdown(props: Props) {
  const { t } = useTranslation(NS);
  const { selectedIdents, selectedRows, onSuccess } = props;

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [targetLevel, setTargetLevel] = useState<number>(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [errorResultModal, setErrorResultModal] = useState<{ visible: boolean; data: Record<string, string> }>({ visible: false, data: {} });

  const displayMap = getAuthLevelDisplayMap(t);

  function handleMenuClick({ key }: { key: string }) {
    if (key === 'UpgradeAgent') return;
    const level = _.toNumber(key);
    setTargetLevel(level);
    setConfirmModalVisible(true);
  }

  function handleConfirm() {
    setConfirmLoading(true);
    putAiTaskConfigs({ idents: selectedIdents, auth_level: targetLevel })
      .then((res) => {
        if (_.isEmpty(res)) {
          setConfirmModalVisible(false);
          setConfirmLoading(false);
          onSuccess();
        } else {
          setConfirmModalVisible(false);
          setConfirmLoading(false);
          setErrorResultModal({ visible: true, data: res as Record<string, string> });
        }
      })
      .catch(() => {
        setConfirmLoading(false);
        message.error(t('common:error'));
      });
  }

  function handleCancel() {
    setConfirmModalVisible(false);
    setTargetLevel(0);
  }

  return (
    <>
      {selectedIdents.length === 0 ? (
        <Tooltip title={t('auth_level_action_tip')} placement='left'>
          <Button disabled>
            {t('auth_level_action')} <DownOutlined />
          </Button>
        </Tooltip>
      ) : (
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu onClick={handleMenuClick}>
              <Menu.Item key='1'>
                <div>
                  <div>{t('auth_level_action_1_label')}</div>
                  <div className='text-soft text-xs'>{t('auth_level_action_1_help')}</div>
                </div>
              </Menu.Item>
              <Menu.Item key='2'>
                <div>
                  <div>{t('auth_level_action_2_label')}</div>
                  <div className='text-soft text-xs'>{t('auth_level_action_2_help')}</div>
                </div>
              </Menu.Item>
              <Menu.Item key='3'>
                <div>
                  <div>{t('auth_level_action_3_label')}</div>
                  <div className='text-soft text-xs'>{t('auth_level_action_3_help')}</div>
                </div>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key='0'>
                <div>
                  <div>{t('auth_level_action_0_label')}</div>
                  <div className='text-soft text-xs'>{t('auth_level_action_0_help')}</div>
                </div>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key='UpgradeAgent'>
                <UpgradeAgent selectedIdents={selectedIdents} onOk={onSuccess} />
              </Menu.Item>
            </Menu>
          }
        >
          <Button>
            {t('auth_level_action')} <DownOutlined />
          </Button>
        </Dropdown>
      )}
      <Modal title={t('auth_level_modal_title')} visible={confirmModalVisible} confirmLoading={confirmLoading} onOk={handleConfirm} onCancel={handleCancel}>
        {targetLevel === 0 ? (
          <p className='mb-2 text-hint'>{t('auth_level_modal_content_close')}</p>
        ) : (
          <p className='mb-2 text-hint'>{t('auth_level_modal_content', { level: t(`auth_level_${targetLevel}` as any) })}</p>
        )}
        <Table
          className='n9e-table-last-row-no-border'
          size='small'
          columns={[
            {
              dataIndex: 'ident',
              title: t('auth_level_channel_ident'),
            },
            {
              title: t('auth_level_current'),
              render: (_: any, record: Item) => {
                const val = (record as any).ai_task_auth_level as number;
                if (val === null || val === undefined) {
                  return <span>-</span>;
                }
                const cfg = displayMap[val];
                return cfg ? <Tags type='fill' data={[cfg.text]} bgColor={cfg.bgColor} fontColor={cfg.fontColor} /> : <span>-</span>;
              },
            },
          ]}
          dataSource={selectedRows}
          pagination={false}
          rowKey='ident'
        />
      </Modal>
      <Modal
        title={t('auth_level_modal_failed_title')}
        visible={errorResultModal.visible}
        footer={
          <Button type='primary' onClick={() => setErrorResultModal({ visible: false, data: {} })}>
            {t('common:btn.ok')}
          </Button>
        }
        onCancel={() => setErrorResultModal({ visible: false, data: {} })}
      >
        <Table
          className='n9e-table-last-row-no-border'
          size='small'
          columns={[{ dataIndex: 'key' }, { dataIndex: 'value' }]}
          dataSource={_.map(errorResultModal.data, (value, key) => ({ key, value }))}
          pagination={false}
          rowKey='key'
          showHeader={false}
        />
      </Modal>
    </>
  );
}
