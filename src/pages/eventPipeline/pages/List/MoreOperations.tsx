import React from 'react';
import _ from 'lodash';
import { Dropdown, Button, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { Export } from '@/components/ExportImport';

import { NS } from '../../constants';

interface MoreOperationsProps {
  selectedRows: any[];
}

const ignoreFields = ['id', 'create_at', 'create_by', 'update_at', 'update_by'];

export default function MoreOperations(props: MoreOperationsProps) {
  const { t } = useTranslation(NS);
  const { selectedRows } = props;

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
                    title: t('batch.export.title'),
                    data: JSON.stringify(exportData, null, 2),
                  });
                } else {
                  message.warning(t('batch.not_select'));
                }
              }}
            >
              <span>{t('batch.export.title')}</span>
            </li>
          </ul>
        }
        trigger={['click']}
      >
        <Button onClick={(e) => e.stopPropagation()} icon={<DownOutlined />}>
          {t('common:btn.more')}
        </Button>
      </Dropdown>
    </>
  );
}
