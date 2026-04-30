import React, { useState, useEffect, useRef } from 'react';
import { Tree, Modal, Button, message } from 'antd';
import _ from 'lodash';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { useTranslation } from 'react-i18next';
import { DatasourceCateEnum } from '@/utils/constant';
import { getDatabases, getTables, getColumns } from '../../services';
import './style.less';

interface Props {
  datasourceValue: number;
  datasourceCate?: string;
  onTreeNodeClick?: (node: any) => void;
}

interface DataNode {
  title: string;
  key: string;
  children?: DataNode[];
  levelType?: 'tables' | 'table' | 'field';
  isLeaf?: boolean;
  selectable?: boolean;
  type?: string;
  database?: string;
  table?: string;
  field?: string;
}

const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => {
  return _.map(list, (node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });
};

const numberTypes = ['BIGINT', 'INT', 'INT UNSIGNED', 'BIGINT UNSIGNED', 'FLOAT', 'DOUBLE', 'SMALLINT', 'SMALLINT UNSIGNED', 'TINYINT', 'TINYINT UNSIGNED'];

export default function Meta(props: Props) {
  const { t } = useTranslation('db_iotdb');
  const { datasourceValue, datasourceCate = DatasourceCateEnum.iotdb, onTreeNodeClick } = props;
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const baseParams = {
    cate: datasourceCate,
    datasource_id: datasourceValue,
  };

  const onLoadData = async (node: DataNode) => {
    const { key, children } = node;
    if (children) {
      return;
    }

    try {
      if (node.levelType === 'tables' && node.database) {
        const tables = await getTables({
          ...baseParams,
          db: node.database,
        });
        setTreeData((origin) =>
          updateTreeData(
            origin,
            key,
            _.map(tables, (item) => {
              return {
                title: item,
                key: `${key}.${item}`,
                levelType: 'table',
                database: node.database,
                table: item,
                selectable: false,
              };
            }),
          ),
        );
      } else if (node.levelType === 'table' && node.database && node.table) {
        const columns = await getColumns({
          ...baseParams,
          db: node.database,
          table: node.table,
        });
        setTreeData((origin) =>
          updateTreeData(
            origin,
            key,
            _.map(columns, (item) => {
              return {
                title: `${item.name} (${item.type})`,
                key: `${key}.${item.name}`,
                isLeaf: true,
                levelType: 'field',
                database: node.database,
                table: node.table,
                field: item.name,
                type: item.type,
              };
            }),
          ),
        );
      }
    } catch (err) {
      message.error(_.get(err, 'message') || t('query.loadSchemaFailed'));
    }
  };

  useEffect(() => {
    getDatabases(baseParams)
      .then((res) => {
        const databases = _.map(res, (item) => ({
          title: item,
          key: item,
          selectable: false,
          children: [
            {
              title: t('query.table'),
              key: `${item}.table`,
              levelType: 'tables' as const,
              database: item,
              selectable: false,
            },
          ],
        }));
        setTreeData(databases);
      })
      .catch((err) => {
        setTreeData([]);
        message.error(_.get(err, 'message') || t('query.loadSchemaFailed'));
      });
  }, [datasourceCate, datasourceValue, t]);

  return (
    <div className='iotdb-discover-meta-content'>
      <div className='iotdb-discover-meta-tree'>
        <Tree
          blockNode
          loadData={onLoadData}
          treeData={treeData}
          titleRender={(nodeData) => {
            if (nodeData.levelType === 'field' && _.includes(numberTypes, nodeData.type)) {
              return (
                <span
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (onTreeNodeClick) {
                      onTreeNodeClick(nodeData);
                    }
                  }}
                >
                  {nodeData.title}
                </span>
              );
            }
            return <span>{nodeData.title}</span>;
          }}
        />
      </div>
    </div>
  );
}

export function MetaModal(props: Props) {
  const { t } = useTranslation('db_iotdb');
  const { datasourceValue, onTreeNodeClick } = props;
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);
  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <>
      <Modal
        width={400}
        wrapClassName='iotdb-discover-meta-modal'
        bodyStyle={{
          padding: 10,
          height: 500,
        }}
        mask={false}
        maskClosable={false}
        destroyOnClose
        title={
          <div
            className='iotdb-discover-meta-modal-title'
            style={{
              width: '100%',
              cursor: 'move',
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
            onFocus={() => {}}
            onBlur={() => {}}
          >
            {t('query.schema')}
          </div>
        }
        visible={open}
        onCancel={() => {
          setOpen(false);
        }}
        footer={null}
        modalRender={(modal) => (
          <Draggable disabled={disabled} bounds={bounds} onStart={(event, uiData) => onStart(event, uiData)}>
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        <Meta datasourceValue={datasourceValue} datasourceCate={props.datasourceCate} onTreeNodeClick={onTreeNodeClick} />
      </Modal>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        {t('query.schema')}
      </Button>
    </>
  );
}
