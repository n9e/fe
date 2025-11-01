import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Tree, Button, Modal, message, Space } from 'antd';

import { getOperationsByRole, putOperationsByRole } from './services';
import { OperationType } from './types';

function transformOperations(operations: OperationType[]) {
  return _.map(operations, (item) => {
    return {
      title: item.cname,
      key: item.name,
      children: _.map(item.ops, (item) => {
        return {
          title: item.cname,
          key: item.name,
        };
      }) as {
        title: string;
        key: string;
      }[],
    };
  });
}

interface IProps {
  data: OperationType[];
  roleId?: number;
  disabled: boolean;
}

export default function Operations(props: IProps) {
  const { t } = useTranslation('permissions');
  const { data, roleId, disabled } = props;
  const [operations, setOperations] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (roleId) {
      getOperationsByRole(roleId).then((res) => {
        setOperations(res);
      });
    }
  }, [roleId]);

  if (!roleId) return <div>{t('unselect_role')}</div>;

  return (
    <div
      className='p-2 min-h-0 h-full overflow-y-auto'
      style={{
        background: 'var(--fc-fill-2)',
        border: '1px solid var(--fc-border-color)',
      }}
    >
      <div className='mb-2'>
        <Space size={0}>
          <Button
            size='small'
            type='text'
            onClick={() => {
              setExpandedKeys(_.map(data, 'name'));
            }}
          >
            {t('expand_all')}
          </Button>
          <Button
            size='small'
            type='text'
            onClick={() => {
              setExpandedKeys([]);
            }}
          >
            {t('collapse_all')}
          </Button>
        </Space>
      </div>
      <Tree
        checkable
        disabled={disabled}
        expandedKeys={expandedKeys}
        checkedKeys={operations}
        treeData={transformOperations(data)}
        onExpand={(expandedKeys: string[]) => {
          setExpandedKeys(expandedKeys);
        }}
        onCheck={(selectedKeys: string[]) => {
          setOperations(selectedKeys);
        }}
      />
      {!disabled && (
        <div style={{ marginTop: 16 }}>
          <Button
            type='primary'
            onClick={() => {
              Modal.confirm({
                title: t('common:confirm.save'),
                onOk: () => {
                  putOperationsByRole(
                    roleId,
                    _.filter(operations, (item) => {
                      return !_.includes(_.map(data, 'name'), item);
                    }),
                  ).then(() => {
                    message.success(t('common:success.save'));
                  });
                },
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
        </div>
      )}
    </div>
  );
}
