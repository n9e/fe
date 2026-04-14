import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Empty, Input, Menu, Space, Tag, Tree } from 'antd';
import { FileTextOutlined, FolderOpenOutlined, FolderOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { NS } from '../constants';
import { SkillTreeNode } from '../types';
import UploadSkillModal from './UploadSkillModal';

interface Props {
  searchValue: string;
  onSearchChange: (value: string) => void;
  treeData: SkillTreeNode[];
  selectedNodeKey?: string;
  expandedKeys: string[];
  onSelectNode: (node: SkillTreeNode) => void;
  onExpand: (expandedKeys: string[], node: SkillTreeNode, expanded: boolean) => void;
  onCreate: () => void;
  onImport: (file: File) => void;
}

export default function SkillSidebar(props: Props) {
  const { t } = useTranslation(NS);
  const { searchValue, onSearchChange, treeData, selectedNodeKey, expandedKeys, onSelectNode, onExpand, onCreate, onImport } = props;
  const [uploadModalVisible, setUploadModalVisible] = React.useState(false);

  return (
    <div className='skills-sidebar w-[280px] min-w-[280px] flex flex-col pr-4 mr-4'>
      <div className='flex gap-2 mb-3 flex-shrink-0'>
        <Input
          className='min-w-0'
          placeholder={t('search_placeholder')}
          allowClear
          value={searchValue}
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
        />
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key='manual' onClick={onCreate}>
                {t('write_skill')}
              </Menu.Item>
              <Menu.Item
                key='upload'
                onClick={() => {
                  setUploadModalVisible(true);
                }}
              >
                <span>{t('upload_skill')}</span>
              </Menu.Item>
            </Menu>
          }
        >
          <Button className='flex-shrink-0' icon={<PlusOutlined />} />
        </Dropdown>
      </div>
      <div className='min-h-0 h-full overflow-auto best-looking-scroll'>
        {_.isEmpty(treeData) ? (
          <div className='h-full flex items-center justify-center bg-fc-100 rounded'>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common:nodata')} />
          </div>
        ) : (
          <Tree
            blockNode
            switcherIcon={<DownOutlined />}
            selectedKeys={selectedNodeKey ? [selectedNodeKey] : []}
            expandedKeys={expandedKeys}
            treeData={treeData}
            onSelect={(_selectedKeys, info) => {
              const node = info.node as SkillTreeNode;
              if (node.selectable) {
                onSelectNode(node);
              }
            }}
            onExpand={(keys, info) => {
              onExpand(keys as string[], info.node as SkillTreeNode, info.expanded);
            }}
            titleRender={(nodeData) => {
              const node = nodeData as SkillTreeNode;

              if (node.nodeType === 'skill') {
                return (
                  <div className='min-w-0 flex items-center justify-between gap-2 py-1'>
                    <div className='truncate font-medium'>{node.title}</div>
                    <Space size={4}>
                      {node.builtin === true && (
                        <Tag className='m-0' color='purple'>
                          {t('builtin')}
                        </Tag>
                      )}
                      {node.enabled === false && <Tag className='m-0'>OFF</Tag>}
                    </Space>
                  </div>
                );
              }

              if (node.nodeType === 'directory') {
                const isExpanded = _.includes(expandedKeys, node.key);
                return (
                  <div
                    className='min-w-0 flex items-center gap-2 py-1'
                    onClick={(event) => {
                      event.stopPropagation();
                      const nextExpandedKeys = isExpanded ? _.without(expandedKeys, node.key) : _.uniq([...expandedKeys, node.key]);
                      onExpand(nextExpandedKeys, node, !isExpanded);
                    }}
                  >
                    {isExpanded ? <FolderOpenOutlined className='text-[var(--fc-text-color-secondary)]' /> : <FolderOutlined className='text-[var(--fc-text-color-secondary)]' />}
                    <span className='truncate'>{node.title}</span>
                  </div>
                );
              }

              return (
                <div className='min-w-0 flex items-center gap-2 py-1'>
                  <FileTextOutlined className='text-[var(--fc-text-color-secondary)]' />
                  <span className='truncate'>{node.title}</span>
                </div>
              );
            }}
          />
        )}
      </div>
      <UploadSkillModal
        title={t('upload_skill')}
        visible={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
        }}
        onSubmit={onImport}
      />
    </div>
  );
}
