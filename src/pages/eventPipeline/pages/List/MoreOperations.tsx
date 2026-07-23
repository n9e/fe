import React from 'react';
import _ from 'lodash';
import { Dropdown, Menu, Button, Modal, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { Export } from '@/components/ExportImport';

import { NS } from '../../constants';
import { Item, deleteItems } from '../../services';

interface MoreOperationsProps {
  selectedRows: Item[];
  /** 批量操作完成后刷新列表并清空选择 */
  onFinished?: () => void;
}

const ignoreFields = ['id', 'create_at', 'create_by', 'update_at', 'update_by'];

export default function MoreOperations(props: MoreOperationsProps) {
  const { t } = useTranslation(NS);
  const { selectedRows, onFinished } = props;
  const hasSelected = selectedRows.length > 0;

  const handleExport = () => {
    if (!hasSelected) {
      message.warning(t('batch.not_select'));
      return;
    }
    const exportData = selectedRows.map((item) => _.omit(item, ignoreFields));
    Export({
      title: t('batch.export.title'),
      data: JSON.stringify(exportData, null, 2),
    });
  };

  const handleDelete = () => {
    if (!hasSelected) {
      message.warning(t('batch.not_select'));
      return;
    }
    // 与单行删除的「先停用再删除」保持一致：启用中的工作流可能仍被告警 / 通知规则引用
    const enabled = _.filter(selectedRows, (item) => item.disabled === false);
    if (enabled.length) {
      message.warning(t('batch.delete_enabled_tip', { names: _.map(enabled, 'name').join(', ') }));
      return;
    }
    Modal.confirm({
      title: t('batch.delete_confirm', { count: selectedRows.length }),
      okButtonProps: { danger: true },
      onOk: () => {
        return deleteItems(_.map(selectedRows, 'id'))
          .then(() => {
            message.success(t('common:success.delete'));
            onFinished?.();
          })
          .catch((err) => {
            console.error(err);
          });
      },
    });
  };

  const overlay = (
    <Menu>
      <Menu.Item key='export' onClick={handleExport}>
        {t('batch.export.title')}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key='delete' danger onClick={handleDelete}>
        {t('batch.delete')}
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={overlay} trigger={['click']}>
      <Button onClick={(e) => e.stopPropagation()}>
        {t('common:btn.more')} <DownOutlined />
      </Button>
    </Dropdown>
  );
}
