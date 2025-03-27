import React, { useState, useEffect, useRef } from 'react';
import { Tree, Modal, Button, Space, Tooltip } from 'antd';
import { CopyOutlined, CompassOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { DatasourceCateEnum } from '@/utils/constant';
import { copyToClipBoard } from '@/utils';
import { getDatabases, getTables, getColumns } from '../../services';
import { NAME_SPACE } from '../../constants';
import './style.less';

interface Props {
  datasourceValue: number;
  onTreeNodeClick?: (node: any) => void;
  hideHeader?: boolean;
  allowSelect?: boolean;
}

interface DataNode {
  title: string;
  key: string;
  children?: DataNode[];
  levelType?: 'table' | 'field';
  isLeaf?: boolean;
  field: string;
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

export default function Meta(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceValue, onTreeNodeClick, hideHeader, allowSelect = true } = props;
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const baseParams = {
    cate: DatasourceCateEnum.ck,
    datasource_id: datasourceValue,
  };

  const onLoadData = ({ key, children, pos, paranetKey }: any) => {
    return new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }
      if (_.split(pos, '-')?.length === 2) {
        getTables({
          ...baseParams,
          query: [key],
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
                  database: key,
                  table: item,
                  field: item,
                  selectable: false,
                };
              }),
            ),
          );
          resolve();
          return;
        });
      } else if (_.split(pos, '-')?.length === 3) {
        getColumns({
          ...baseParams,
          query: [
            {
              database: key.split('.')[0],
              table: key.split('.')[1],
            },
          ],
        }).then((res) => {
          setTreeData((origin) =>
            updateTreeData(
              origin,
              key,
              _.map(res, (item) => {
                return {
                  title: `${item.field} (${item.type})`,
                  key: `${key}.${item.field}`,
                  isLeaf: true,
                  levelType: 'field',
                  database: key.split('.')[0],
                  table: key.split('.')[1],
                  field: item.field,
                  type: item.type,
                  type2: item.type2,
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
    getDatabases(baseParams)
      .then((res) => {
        const databases = _.map(res, (item) => ({
          title: item,
          key: item,
          field: item,
          selectable: false,
        }));
        setTreeData(databases);
      })
      .catch(() => {
        setTreeData([]);
      });
  }, [datasourceValue]);

  return (
    <>
      {!hideHeader && <div className='explorer-meta-header'>{t('query.schema')}</div>}
      <div className='explorer-meta-content'>
        <div className='explorer-meta-tree'>
          <Tree
            blockNode
            loadData={onLoadData}
            treeData={treeData}
            titleRender={(nodeData) => {
              return (
                <span
                  className='explorer-meta-tree-node'
                  style={{
                    cursor: 'text',
                  }}
                >
                  <Space>
                    {nodeData.title}
                    {allowSelect && onTreeNodeClick && nodeData.levelType === 'table' && (
                      <Tooltip title={t('query.compass_btn_tip')}>
                        <CompassOutlined
                          onClick={() => {
                            onTreeNodeClick(nodeData);
                          }}
                        />
                      </Tooltip>
                    )}
                    <CopyOutlined
                      onClick={() => {
                        copyToClipBoard(nodeData.field);
                      }}
                    />
                  </Space>
                </span>
              );
            }}
          />
        </div>
      </div>
    </>
  );
}

export function MetaModal(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceValue, onTreeNodeClick, allowSelect } = props;
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
        wrapClassName={`${NAME_SPACE}-explorer-meta-modal`}
        bodyStyle={{
          padding: 10,
          height: 500,
        }}
        mask={false}
        maskClosable={false}
        destroyOnClose
        title={
          <div
            className='explorer-meta-modal-title'
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
        <Meta datasourceValue={datasourceValue} onTreeNodeClick={onTreeNodeClick} hideHeader allowSelect={false} />
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
