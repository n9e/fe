import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { EditOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';

import { TreeNode } from './types';
import { RightIcon, DownIcon } from './constant';
import './style.less';

interface Props {
  treeData: TreeNode[];
  defaultExpandedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (selectedKeys: string[], info: any) => void;
  onExpand?: (expandedKeys: string[]) => void;
  onEdit?: (selectedKeys: string[], info: any) => void;
}

const renderTree = (
  treeData: TreeNode[],
  eachLevelIsLast: boolean[],
  level: number,
  expandedKeys?: string[],
  selectedKeys?: string[],
  onSelect?: (selectedKeys: string[], info: any) => void,
  onExpand?: (expandedKeys: string[]) => void,
  onEdit?: (selectedKeys: string[], info: any) => void,
) => {
  const { darkMode } = useContext(CommonStateContext);
  return (
    <ul className='n9e-tree-nodes'>
      {_.map(treeData, (item, nodeIdx) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = _.includes(expandedKeys, item.key);
        const isSelected = _.includes(selectedKeys, item.key);
        const newEachLevelIsLast = [...eachLevelIsLast, nodeIdx === treeData.length - 1];
        return (
          <li key={item.key} className='n9e-tree-node'>
            <div
              className={classNames('n9e-tree-node-title group', {
                'n9e-tree-node-title-selected': isSelected,
              })}
              onClick={() => {
                onSelect && onSelect([item.key], { node: item });
              }}
            >
              {_.map(Array.from({ length: level }), (_, index) => {
                const realIndex = index + 1;
                return (
                  <div key={realIndex} className={classNames('n9e-tree-node-indent')}>
                    {index !== 0 && (
                      <>
                        {realIndex === level ? (
                          <>
                            <div
                              className={classNames('n9e-tree-node-indent-current-branch', {
                                'n9e-tree-node-indent-current-branch-active': isSelected,
                              })}
                            />
                            {treeData.length - 1 !== nodeIdx && (
                              <div
                                className={classNames('n9e-tree-node-indent-next-branch', {
                                  'n9e-tree-node-indent-next-branch-active': isSelected,
                                })}
                              />
                            )}
                          </>
                        ) : (
                          !eachLevelIsLast[realIndex] && (
                            <div
                              className={classNames('n9e-tree-node-indent-next-branch', {
                                'n9e-tree-node-indent-next-branch-active': isSelected,
                              })}
                            />
                          )
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              <div className='n9e-tree-node-title-content'>
                <span className='pr1 n9e-flex'>{item.title}</span>
                {hasChildren && (
                  <span
                    className='n9e-tree-node-icon'
                    onClick={(event) => {
                      event.stopPropagation();
                      // 如果 item.key 在 defaultExpandedKeys 中，就从 defaultExpandedKeys 中移除，否则添加
                      const newExpandedKeys = isExpanded ? _.without(expandedKeys, item.key) : [...(expandedKeys || []), item.key];
                      onExpand && onExpand(newExpandedKeys);
                    }}
                  >
                    {isExpanded ? <DownIcon /> : <RightIcon />}
                  </span>
                )}
                {!item.children && onEdit && (
                  <EditOutlined
                    className={classNames('opacity-0 absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer z-10 hover:opacity-100 group-hover:opacity-100 p-2 rounded')}
                    style={{ backgroundColor: isSelected ? (darkMode ? '#27292e' : '#f0eef7') : darkMode ? '#2f3137' : '#F7F7F7' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit([item.key], { node: item });
                    }}
                  />
                )}
              </div>
            </div>
            {hasChildren && isExpanded && renderTree(item.children || [], newEachLevelIsLast, level + 1, expandedKeys, selectedKeys, onSelect, onExpand, onEdit)}
          </li>
        );
      })}
    </ul>
  );
};

function index(props: Props) {
  const { treeData, defaultExpandedKeys, selectedKeys, onSelect, onExpand, onEdit } = props;
  const [expandedKeys, setExpandedKeys] = useState<string[]>(defaultExpandedKeys || []);

  useEffect(() => {
    setExpandedKeys(defaultExpandedKeys || []);
  }, [defaultExpandedKeys]);

  return (
    <div className='n9e-tree-container'>
      {renderTree(
        treeData,
        [false],
        1,
        expandedKeys,
        selectedKeys,
        onSelect,
        (newExpandedKeys) => {
          setExpandedKeys(newExpandedKeys);
          onExpand && onExpand(newExpandedKeys);
        },
        onEdit,
      )}
    </div>
  );
}

export default React.memo(index, (prevProps, nextProps) => {
  const omitKeys = ['onSelect', 'onExpand'];
  return _.isEqual(_.omit(prevProps, omitKeys), _.omit(nextProps, omitKeys));
});
