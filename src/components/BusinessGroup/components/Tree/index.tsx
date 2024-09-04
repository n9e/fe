import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { TreeNode } from './types';
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
  expandedKeys?: string[],
  selectedKeys?: string[],
  onSelect?: (selectedKeys: string[], info: any) => void,
  onExpand?: (expandedKeys: string[]) => void,
) => {
  return _.map(treeData, (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = _.includes(expandedKeys, item.key);
    const isSelected = _.includes(selectedKeys, item.key);
    return (
      <div key={item.key} className='n9e-tree-node'>
        <div
          className={classNames('n9e-tree-node-title', {
            'n9e-tree-node-selected-title': isSelected,
          })}
        >
          <span
            className='n9e-tree-node-title-text'
            onClick={() => {
              onSelect && onSelect([item.key], { node: item });
            }}
          >
            {item.title}
          </span>
          {hasChildren && (
            <span
              className='n9e-tree-node-icon'
              onClick={() => {
                // 如果 item.key 在 defaultExpandedKeys 中，就从 defaultExpandedKeys 中移除，否则添加
                const newExpandedKeys = isExpanded ? _.without(expandedKeys, item.key) : [...(expandedKeys || []), item.key];
                onExpand && onExpand(newExpandedKeys);
              }}
            >
              {isExpanded ? <DownOutlined /> : <RightOutlined />}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && <div className='n9e-tree-children'>{renderTree(item.children || [], expandedKeys, selectedKeys, onSelect, onExpand)}</div>}
      </div>
    );
  });
};

function index(props: Props) {
  const { treeData, defaultExpandedKeys, selectedKeys, onSelect, onExpand } = props;
  const [expandedKeys, setExpandedKeys] = useState<string[]>(defaultExpandedKeys || []);

  useEffect(() => {
    setExpandedKeys(defaultExpandedKeys || []);
  }, [defaultExpandedKeys]);

  return (
    <div className='n9e-tree-container'>
      {renderTree(treeData, expandedKeys, selectedKeys, onSelect, (newExpandedKeys) => {
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
