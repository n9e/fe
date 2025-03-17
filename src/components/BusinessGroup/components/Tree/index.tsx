import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { TreeNode } from './types';
import { RightIcon, DownIcon } from './constant';
import './style.less';

interface Props {
  treeData: TreeNode[];
  defaultExpandedKeys?: string[];
  selectedKeys?: string[];
  onSelect?: (selectedKeys: string[], info: any) => void;
  onExpand?: (expandedKeys: string[]) => void;
}

const renderTree = (
  treeData: TreeNode[],
  eachLevelIsLast: boolean[],
  level: number,
  expandedKeys?: string[],
  selectedKeys?: string[],
  onSelect?: (selectedKeys: string[], info: any) => void,
  onExpand?: (expandedKeys: string[]) => void,
) => {
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
              className={classNames('n9e-tree-node-title', {
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
              </div>
            </div>
            {hasChildren && isExpanded && renderTree(item.children || [], newEachLevelIsLast, level + 1, expandedKeys, selectedKeys, onSelect, onExpand)}
          </li>
        );
      })}
    </ul>
  );
};

function index(props: Props) {
  const { treeData, defaultExpandedKeys, selectedKeys, onSelect, onExpand } = props;
  const [expandedKeys, setExpandedKeys] = useState<string[]>(defaultExpandedKeys || []);

  useEffect(() => {
    setExpandedKeys(defaultExpandedKeys || []);
  }, [defaultExpandedKeys]);

  return (
    <div className='n9e-tree-container'>
      {renderTree(treeData, [false], 1, expandedKeys, selectedKeys, onSelect, (newExpandedKeys) => {
        setExpandedKeys(newExpandedKeys);
        onExpand && onExpand(newExpandedKeys);
      })}
    </div>
  );
}

export default React.memo(index, (prevProps, nextProps) => {
  const omitKeys = ['onSelect', 'onExpand'];
  return _.isEqual(_.omit(prevProps, omitKeys), _.omit(nextProps, omitKeys));
});
