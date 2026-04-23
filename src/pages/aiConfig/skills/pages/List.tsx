import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Dropdown, Empty, Menu, Popconfirm, Spin, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import { FileContent, Item, SkillDetail, deleteFile, deleteItem, getFile, getItem, getList, importItem, importItemToUpdate, putItem } from '../services';
import { SkillTreeNode } from '../types';
import { buildSkillTree, getSkillNodeKey, isMarkdownFile } from '../utils/tree';
import AddModal from './AddModal';
import DocumentPreviewPanel from './DocumentPreviewPanel';
import EditModal from './EditModal';
import SkillDetailPanel from './SkillDetailPanel';
import SkillSidebar from './SkillSidebar';
import UploadSkillModal from './UploadSkillModal';
import './style.less';

export default function List() {
  const { t } = useTranslation(NS);

  const [searchValue, setSearchValue] = useState('');
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [detailMap, setDetailMap] = useState<Record<number, SkillDetail | undefined>>({});
  const [detailLoadingMap, setDetailLoadingMap] = useState<Record<number, boolean>>({});
  const [addModalState, setAddModalState] = useState({ visible: false });
  const [editModalState, setEditModalState] = useState<{
    visible: boolean;
    id?: number;
  }>({ visible: false, id: undefined });
  const [mdFormat, setMdFormat] = useState<'formatted' | 'code'>('formatted');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const {
    data = [],
    loading,
    run,
    mutate,
  } = useRequest(getList, {
    refreshDeps: [],
  });

  const allTree = useMemo(() => buildSkillTree(data, detailMap), [data, detailMap]);
  const filteredSkills = useMemo(() => {
    return _.filter(data, (item) => _.includes(_.upperCase(item.name), _.upperCase(searchValue)));
  }, [data, searchValue]);
  const filteredTree = useMemo(() => buildSkillTree(filteredSkills, detailMap).treeData, [filteredSkills, detailMap]);
  const selectedNode = selectedNodeKey ? allTree.nodeMap[selectedNodeKey] : undefined;
  const selectedSkill = selectedNode ? _.find(data, { id: selectedNode.skillId }) : undefined;
  const selectedSkillData = selectedSkill
    ? {
        ...selectedSkill,
        ...(detailMap[selectedSkill.id] || {}),
        // List payload is the source of truth for builtin in current API contract.
        builtin: selectedSkill.builtin,
      }
    : undefined;

  const { data: fileContent, loading: fileLoading } = useRequest<FileContent | undefined, any>(
    () => {
      if (selectedNode?.nodeType !== 'resource-file' || !selectedNode.file?.id) {
        return Promise.resolve(undefined);
      }
      return getFile(selectedNode.file.id);
    },
    {
      refreshDeps: [selectedNodeKey],
      ready: selectedNode?.nodeType === 'resource-file' && !!selectedNode.file?.id,
    },
  );

  useEffect(() => {
    if (_.isEmpty(data)) {
      if (loading) {
        return;
      }
      setSelectedNodeKey(undefined);
      setExpandedKeys([]);
      return;
    }

    if (!selectedNodeKey || !selectedNode || !selectedSkill) {
      const firstSkill = data[0];
      const firstNodeKey = getSkillNodeKey(firstSkill.id);
      setSelectedNodeKey(firstNodeKey);
      setExpandedKeys((prev) => _.uniq([...prev, firstNodeKey]));
      setMdFormat('formatted');
      loadSkillDetail(firstSkill.id);
      return;
    }

    const rootKey = getSkillNodeKey(selectedNode.skillId);
    if (!_.includes(expandedKeys, rootKey)) {
      setExpandedKeys((prev) => _.uniq([...prev, rootKey]));
    }
  }, [data, loading, selectedNodeKey, selectedNode, selectedSkill]);

  function syncSkillToList(skill: Item) {
    mutate((prevData) => {
      if (!prevData) {
        return prevData;
      }

      return _.map(prevData, (item) => {
        if (item.id === skill.id) {
          return {
            ...item,
            ...skill,
            // Keep builtin stable to avoid detail payload overwriting it unexpectedly.
            builtin: item.builtin || skill.builtin,
          };
        }

        return item;
      });
    });
  }

  async function loadSkillDetail(skillId: number, force?: boolean) {
    if (!force && detailMap[skillId]) {
      return detailMap[skillId];
    }

    if (detailLoadingMap[skillId]) {
      return detailMap[skillId];
    }

    setDetailLoadingMap((prev) => ({
      ...prev,
      [skillId]: true,
    }));

    try {
      const detail = await getItem(skillId);
      setDetailMap((prev) => ({
        ...prev,
        [skillId]: detail,
      }));
      syncSkillToList(detail);
      return detail;
    } finally {
      setDetailLoadingMap((prev) => ({
        ...prev,
        [skillId]: false,
      }));
    }
  }

  async function refreshSkill(skillId: number) {
    await loadSkillDetail(skillId, true);
    await run();
  }

  async function handleImport(file: File) {
    try {
      await importItem(file);
      await run();
      message.success(t('upload_file_success'));
    } catch (_error) {
      message.error(t('upload_file_error'));
      throw _error;
    }
  }

  async function handleUpdateImport(skillId: number, file: File) {
    try {
      await importItemToUpdate(skillId, file);
      await refreshSkill(skillId);
      message.success(t('upload_file_success'));
    } catch (_error) {
      message.error(t('upload_file_error'));
      throw _error;
    }
  }

  async function handleToggleEnabled(item: Item) {
    const newEnabled = !item.enabled;
    await putItem(item.id, {
      ..._.pick(item, ['name', 'description', 'instructions', 'license', 'compatibility', 'allowed_tools', 'metadata']),
      enabled: newEnabled,
    });
    message.success(t('common:success.modify'));

    const nextItem = {
      ...item,
      enabled: newEnabled,
    };

    syncSkillToList(nextItem);
    setDetailMap((prev) => {
      const currentDetail = prev[item.id];
      if (!currentDetail) {
        return prev;
      }

      return {
        ...prev,
        [item.id]: {
          ...currentDetail,
          enabled: newEnabled,
        },
      };
    });
  }

  async function handleDeleteSkill(skillId: number) {
    await deleteItem(skillId);
    message.success(t('common:success.delete'));

    setDetailMap((prev) => _.omit(prev, [skillId]));
    mutate((prevData) => {
      if (!prevData) {
        return prevData;
      }
      return _.filter(prevData, (item) => item.id !== skillId);
    });
  }

  async function handleDeleteResource(skillId: number, fileId: number) {
    await deleteFile(fileId);
    message.success(t('common:success.delete'));
    await loadSkillDetail(skillId, true);
    setSelectedNodeKey(getSkillNodeKey(skillId));
  }

  function handleSelectNode(node: SkillTreeNode) {
    setSelectedNodeKey(node.key);
    setExpandedKeys((prev) => {
      const rootKey = getSkillNodeKey(node.skillId);
      return _.uniq([...prev, rootKey]);
    });
    loadSkillDetail(node.skillId);
  }

  function handleExpand(keys: string[], node: SkillTreeNode, expanded: boolean) {
    setExpandedKeys((prev) => {
      if (expanded) {
        return _.uniq([...prev, ...keys]);
      }
      return keys;
    });
    if (expanded && node.nodeType === 'skill') {
      loadSkillDetail(node.skillId);
    }
  }

  if (_.isEmpty(data)) {
    if (loading) {
      return (
        <PageLayout title={t('title')}>
          <div className='fc-page n9e'>
            <div className='bg-fc-100 rounded flex items-center justify-center h-[200px]'>
              <Spin spinning />
            </div>
          </div>
        </PageLayout>
      );
    }

    return (
      <>
        <PageLayout title={t('title')}>
          <div className='n9e'>
            <div className='bg-fc-100 rounded flex items-center justify-center'>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div>{t('common:nodata')}</div>
                    <div>{t('help')}</div>
                  </div>
                }
              >
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key='manual'
                        onClick={() => {
                          setAddModalState({ visible: true });
                        }}
                      >
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
                  <Button type='primary'>{t('create')}</Button>
                </Dropdown>
              </Empty>
            </div>
          </div>
        </PageLayout>
        <AddModal
          visible={addModalState.visible}
          onOk={() => {
            setAddModalState({ visible: false });
            run();
          }}
          onCancel={() => {
            setAddModalState({ visible: false });
          }}
        />
        <UploadSkillModal
          title={t('upload_skill')}
          visible={uploadModalVisible}
          onCancel={() => {
            setUploadModalVisible(false);
          }}
          onSubmit={handleImport}
        />
      </>
    );
  }

  return (
    <>
      <PageLayout title={t('title')}>
        <div className='n9e h-full overflow-hidden children:h-full mr-0'>
          <Spin spinning={loading}>
            <div className='flex flex-col h-full gap-4'>
              <Alert message={t('help')} type='info' showIcon />
              <div className='flex min-h-0 h-full overflow-hidden'>
                <SkillSidebar
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  treeData={filteredTree}
                  selectedNodeKey={selectedNodeKey}
                  expandedKeys={expandedKeys}
                  onSelectNode={handleSelectNode}
                  onExpand={handleExpand}
                  onCreate={() => {
                    setAddModalState({ visible: true });
                  }}
                  onImport={handleImport}
                />
                <div className='w-full min-w-0'>
                  {!selectedNode || !selectedSkillData ? (
                    <div className='h-full flex items-center justify-center bg-fc-100 rounded'>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common:nodata')} />
                    </div>
                  ) : selectedNode.nodeType === 'skill' ? (
                    <SkillDetailPanel
                      item={selectedSkillData}
                      onToggleEnabled={() => {
                        handleToggleEnabled(selectedSkillData);
                      }}
                      onEdit={() => {
                        setEditModalState({
                          visible: true,
                          id: selectedSkillData.id,
                        });
                      }}
                      onImport={(file) => {
                        handleUpdateImport(selectedSkillData.id, file);
                      }}
                      onDelete={() => {
                        handleDeleteSkill(selectedSkillData.id);
                      }}
                    />
                  ) : (
                    <DocumentPreviewPanel
                      title={selectedNode.file?.name || selectedNode.title}
                      content={fileContent?.content}
                      loading={fileLoading}
                      isMarkdown={isMarkdownFile(selectedNode.file?.name || '')}
                      previewMode={mdFormat}
                      onPreviewModeChange={setMdFormat}
                      extra={
                        selectedSkillData.builtin !== true && selectedNode.nodeType === 'resource-file' && selectedNode.file ? (
                          <Popconfirm
                            title={t('common:confirm.delete')}
                            onConfirm={() => {
                              if (selectedNode.file) {
                                handleDeleteResource(selectedNode.skillId, selectedNode.file.id);
                              }
                            }}
                          >
                            <Button size='small' icon={<DeleteOutlined />} />
                          </Popconfirm>
                        ) : undefined
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </PageLayout>
      <AddModal
        visible={addModalState.visible}
        onOk={() => {
          setAddModalState({ visible: false });
          run();
        }}
        onCancel={() => {
          setAddModalState({ visible: false });
        }}
      />
      <EditModal
        visible={editModalState.visible}
        id={editModalState.id}
        onOk={() => {
          const currentEditId = editModalState.id;
          if (currentEditId) {
            setDetailMap((prev) => _.omit(prev, currentEditId) as Record<number, SkillDetail | undefined>);
          }
          setEditModalState({ visible: false, id: undefined });
          run();
        }}
        onCancel={() => {
          setEditModalState({ visible: false, id: undefined });
        }}
      />
    </>
  );
}
