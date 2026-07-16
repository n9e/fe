import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Modal, Tabs, Tooltip } from 'antd';
import { EditOutlined, HolderOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import _ from 'lodash';

import { CommonStateContext } from '@/App';

import { NAME_SPACE } from './constants';
import { LogExplorerTabItem } from './types';
import getUUID from './utils/getUUID';
import { setLocalItems } from './utils/getLocalItems';
import { setLocalActiveKey } from './utils/getLocalActiveKey';
import { createLogExplorerTabItem } from './utils/createLogExplorerTabItem';
import { getNextLogExplorerTabName, moveLogExplorerTabItems, resolveTabKey } from './utils/tabDnd';

interface Props {
  items: LogExplorerTabItem[];
  setItems: React.Dispatch<React.SetStateAction<LogExplorerTabItem[]>>;
  activeKey: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
  defaultDatasourceCate: string;
  defaultDatasourceValue: number;
}

const DragHandleContext = React.createContext<ReturnType<typeof useSortable> | null>(null);

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    _.forEach(refs, (ref) => {
      if (!ref) {
        return;
      }
      if (_.isFunction(ref)) {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

function TabDragHandle() {
  const sortable = useContext(DragHandleContext);
  if (!sortable) {
    return null;
  }

  return (
    <span
      className='log-explorer-ng-tab-drag-handle'
      ref={sortable.setActivatorNodeRef}
      {...sortable.attributes}
      {...sortable.listeners}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <HolderOutlined />
    </span>
  );
}

function SortableTabNode(props: { children: React.ReactElement; itemKeys: string[] }) {
  const { children, itemKeys } = props;
  const tabKey = resolveTabKey(children.key, itemKeys);
  const sortable = useSortable({ id: tabKey || `disabled-${String(children.key)}`, disabled: !tabKey });
  const { setNodeRef, transform, transition, isDragging } = sortable;
  if (!tabKey) {
    return children;
  }

  const horizontalTransform = transform
    ? {
        ...transform,
        y: 0,
      }
    : null;

  const style: React.CSSProperties = {
    ...children.props.style,
    transform: CSS.Translate.toString(horizontalTransform),
    transition,
    opacity: isDragging ? 0.6 : children.props.style?.opacity,
  };

  return (
    <DragHandleContext.Provider value={sortable}>
      {React.cloneElement(children, {
        ref: composeRefs((children as any).ref, setNodeRef),
        style,
      })}
    </DragHandleContext.Provider>
  );
}

export default function Header(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { logsDefaultRange, datasourceList } = useContext(CommonStateContext);
  const { items, setItems, activeKey, setActiveKey, defaultDatasourceCate, defaultDatasourceValue } = props;
  const [renameModalState, setRenameModalState] = useState<{
    visible: boolean;
    key?: string;
    name: string;
  }>({
    visible: false,
    name: '',
  });
  const [draggingKey, setDraggingKey] = useState<string>();
  const itemKeys = useMemo(() => _.map(items, 'key'), [items]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const getTabName = (item: LogExplorerTabItem, idx: number) => item.name || `Query ${idx + 1}`;
  const draggingItem = draggingKey ? _.find(items, { key: draggingKey }) : undefined;
  const draggingItemIndex = draggingItem ? _.findIndex(items, { key: draggingKey }) : -1;
  const draggingTabName = draggingItem ? getTabName(draggingItem, draggingItemIndex) : '';

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingKey(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingKey(undefined);
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setItems((prev) => {
      const activeId = String(active.id);
      const overId = String(over.id);
      const newItems = moveLogExplorerTabItems(prev, activeId, overId);
      if (newItems === prev) {
        return prev;
      }
      setLocalItems(newItems);
      return newItems;
    });
  };

  const handleRename = () => {
    const tabKey = renameModalState.key;
    if (!tabKey) {
      return;
    }

    setItems((prev) => {
      const newItems = _.map(prev, (item, idx) => {
        if (item.key !== tabKey) {
          return item;
        }
        const nextName = renameModalState.name.trim();
        return {
          ...item,
          name: nextName || getTabName(item, idx),
        };
      });
      setLocalItems(newItems);
      return newItems;
    });
    setRenameModalState({
      visible: false,
      name: '',
    });
  };

  return (
    <div className='log-explorer-ng-header w-full flex items-center gap-4'>
      <span className='flex-shrink-0'>{t('title')}</span>
      <Tabs
        className='log-explorer-ng-tabs min-w-0 flex-1'
        size='small'
        type='editable-card'
        activeKey={activeKey}
        renderTabBar={(tabBarProps, DefaultTabBar) => (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setDraggingKey(undefined)}>
            <SortableContext items={itemKeys} strategy={horizontalListSortingStrategy}>
              <DefaultTabBar {...tabBarProps}>
                {(node) => (
                  <SortableTabNode key={node.key as string} itemKeys={itemKeys}>
                    {node}
                  </SortableTabNode>
                )}
              </DefaultTabBar>
            </SortableContext>
            <DragOverlay>
              {draggingItem ? (
                <div className='log-explorer-ng-tab-drag-overlay'>
                  <HolderOutlined />
                  <span className='log-explorer-ng-tab-name'>{draggingTabName}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        onEdit={(targetKey: string, action: 'add' | 'remove') => {
          if (action === 'add') {
            const newActiveKey = getUUID();
            setItems((prev) => {
              const activeItem = _.find(prev, { key: activeKey });
              const newItem = createLogExplorerTabItem({
                activeItem,
                key: newActiveKey,
                name: getNextLogExplorerTabName(prev),
                defaultDatasourceCate,
                defaultDatasourceValue,
                logsDefaultRange,
                datasourceList,
              });
              const newItems = [...prev, newItem];
              setLocalItems(newItems);
              return newItems;
            });
            setActiveKey(newActiveKey);
            setLocalActiveKey(newActiveKey);
          } else {
            setItems((prev) => {
              const newItems = _.filter(prev, (item) => item.key !== targetKey);
              setLocalItems(newItems);
              if (targetKey === activeKey) {
                setActiveKey(newItems?.[0]?.key);
                setLocalActiveKey(newItems?.[0]?.key);
              }
              return newItems;
            });
          }
        }}
        onChange={(key) => {
          setActiveKey(key);
          setLocalActiveKey(key);
        }}
        onTabClick={() => {
          // antd tabs 默认阻止了冒泡，导致外部的 useClickAway 无法触发，这里手动触发一次 click 事件
          document.dispatchEvent(new MouseEvent('click'));
        }}
      >
        {_.map(items, (item, idx) => {
          const tabName = getTabName(item, idx);
          return (
            <Tabs.TabPane
              closable={items.length !== 1}
              tab={
                <span className='log-explorer-ng-tab-label'>
                  <TabDragHandle />
                  <span className='log-explorer-ng-tab-name' title={tabName}>
                    {tabName}
                  </span>
                  <Tooltip title={t('tab.rename')}>
                    <span
                      className='log-explorer-ng-tab-edit'
                      onClick={(event) => {
                        event.stopPropagation();
                        setRenameModalState({
                          visible: true,
                          key: item.key,
                          name: tabName,
                        });
                      }}
                    >
                      <EditOutlined />
                    </span>
                  </Tooltip>
                </span>
              }
              key={item.key}
            >
              <></>
            </Tabs.TabPane>
          );
        })}
      </Tabs>
      <Modal
        title={t('tab.rename')}
        visible={renameModalState.visible}
        okText={t('common:btn.save')}
        onOk={handleRename}
        onCancel={() => {
          setRenameModalState({
            visible: false,
            name: '',
          });
        }}
      >
        <Input
          autoFocus
          value={renameModalState.name}
          maxLength={50}
          onChange={(event) => {
            setRenameModalState((prev) => ({
              ...prev,
              name: event.target.value,
            }));
          }}
          onPressEnter={handleRename}
        />
      </Modal>
    </div>
  );
}
