import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Tree, Button, Modal, message } from 'antd';
import { getOperationsByRole, putOperationsByRole } from './services';
import { OperationType } from './types';

function transformOperations(operations: OperationType[]) {
  return _.map(operations, (item) => {
    return {
      title: item.cname,
      key: item.name,
      children: _.map(item.ops, (item) => {
        return {
          title: item,
          key: item,
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

  useEffect(() => {
    if (roleId) {
      getOperationsByRole(roleId).then((res) => {
        setOperations(res);
      });
    }
  }, [roleId]);

  if (!roleId) return <div>请先选择角色</div>;

  return (
    <div>
      <Tree
        checkable
        disabled={disabled}
        checkedKeys={operations}
        treeData={transformOperations(data)}
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
