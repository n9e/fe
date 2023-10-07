import React, { useState, useEffect, useRef } from 'react';
import { Tree, Modal, Button } from 'antd';
import _ from 'lodash';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { DatasourceCateEnum } from '@/utils/constant';
import { getDatabases, getTables, getColumns } from '../../services';
import './style.less';

interface Props {
  datasourceValue: number;
  onTreeNodeClick?: (node: any) => void;
}

interface DataNode {
  title: string;
  key: string;
  children?: DataNode[];
  levelType?: 'table' | 'field';
  isLeaf?: boolean;
  type?: string;
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
  const { datasourceValue, onTreeNodeClick } = props;
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const baseParams = {
    cate: DatasourceCateEnum.tdengine,
    datasource_id: datasourceValue,
  };

  const onLoadData = ({ key, children, pos, paranetKey }: any) => {
    return new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }
      if (_.split(pos, '-')?.length === 3) {
        const keyArr = key.split('.');
        getTables({
          ...baseParams,
          db: keyArr[0],
          is_stable: keyArr[1] === 'stable',
        }).then((res) => {
          setTreeData((origin) =>
            updateTreeData(
              origin,
              key,
              _.map(res, (item) => {
                return {
                  title: item,
                  key: `${key}.${item}`,
                  paranetKey: key,
                  levelType: 'table',
                  database: keyArr[0],
                  table: item,
                  selectable: false,
                };
              }),
            ),
          );
          resolve();
          return;
        });
      } else if (_.split(pos, '-')?.length === 4) {
        getColumns({
          ...baseParams,
          db: key.split('.')[0],
          table: key.split('.')[2],
        }).then((res) => {
          setTreeData((origin) =>
            updateTreeData(
              origin,
              key,
              _.map(res, (item) => {
                return {
                  title: `${item.name} (${item.type})`,
                  key: `${key}.${item.name}`,
                  isLeaf: true,
                  levelType: 'field',
                  database: key.split('.')[0],
                  table: key.split('.')[2],
                  field: item.name,
                  type: item.type,
                };
              }),
            ),
          );
          resolve();
          return;
        });
      }
    });
  };

  useEffect(() => {
    getDatabases(baseParams).then((res) => {
      const databases = _.map(res, (item) => ({
        title: item,
        key: item,
        selectable: false,
        children: [
          {
            title: '普通表',
            key: `${item}.table`,
            database: item,
            selectable: false,
          },
          {
            title: '超级表',
            key: `${item}.stable`,
            database: item,
            selectable: false,
          },
        ],
      }));
      setTreeData(databases);
    });
  }, []);

  return (
    <div className='tdengine-discover-meta-content'>
      <div className='tdengine-discover-meta-tree'>
        <Tree
          blockNode
          loadData={onLoadData}
          treeData={treeData}
          showLine={{
            showLeafIcon: false,
          }}
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
        wrapClassName='tdengine-discover-meta-modal'
        bodyStyle={{
          padding: 10,
          height: 500,
        }}
        mask={false}
        maskClosable={false}
        destroyOnClose
        title={
          <div
            className='tdengine-discover-meta-modal-title'
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
            // fix eslintjsx-a11y/mouse-events-have-key-events
            // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
            onFocus={() => {}}
            onBlur={() => {}}
            // end
          >
            元信息
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
        <Meta datasourceValue={datasourceValue} onTreeNodeClick={onTreeNodeClick} />
      </Modal>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        元信息
      </Button>
    </>
  );
}
