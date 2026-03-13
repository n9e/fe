import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Dropdown, Menu, Switch, Popconfirm, Empty, Tag, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Markdown from '@/components/Markdown';
import { AISkill, getAISkills, getAISkill, deleteAISkill, updateAISkill, importAISkill } from './services';
import WriteSkillModal from './WriteSkillModal';
import ResourceFiles from './ResourceFiles';

export default function Skills() {
  const { t } = useTranslation('aiConfig');
  const [skills, setSkills] = useState<AISkill[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<AISkill | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState<AISkill | undefined>();
  const [showSearch, setShowSearch] = useState(false);
  const [instructionsViewMode, setInstructionsViewMode] = useState<'preview' | 'source'>('preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSkills = async () => {
    const data = await getAISkills(search);
    setSkills(data);
    if (data.length > 0 && !selectedId) {
      setSelectedId(data[0].id);
    }
  };

  const fetchSelectedSkill = async (id: number) => {
    try {
      const data = await getAISkill(id);
      setSelected(data);
    } catch {
      setSelected(null);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [search]);

  useEffect(() => {
    if (selectedId) {
      fetchSelectedSkill(selectedId);
    } else {
      setSelected(null);
    }
  }, [selectedId]);

  const builtinSkills = skills.filter((s) => s.is_builtin === 1);
  const customSkills = skills.filter((s) => s.is_builtin !== 1);

  const handleDelete = async (id: number) => {
    await deleteAISkill(id);
    message.success('Deleted');
    if (selectedId === id) setSelectedId(null);
    fetchSkills();
  };

  const handleToggleEnabled = async (skill: AISkill) => {
    await updateAISkill(skill.id, { ...skill, enabled: skill.enabled === 1 ? 0 : 1 });
    fetchSkills();
    if (selectedId === skill.id) fetchSelectedSkill(skill.id);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await importAISkill(formData);
      message.success('Imported');
      fetchSkills();
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const refreshSelected = () => {
    if (selectedId) fetchSelectedSkill(selectedId);
  };

  const addMenu = (
    <Menu>
      <Menu.Item
        key='write'
        onClick={() => {
          setEditData(undefined);
          setModalVisible(true);
        }}
      >
        {t('skill.write')}
      </Menu.Item>
      <Menu.Item key='upload' onClick={() => fileInputRef.current?.click()}>
        {t('skill.upload')}
      </Menu.Item>
    </Menu>
  );

  const renderSkillItem = (skill: AISkill) => (
    <div
      key={skill.id}
      onClick={() => setSelectedId(skill.id)}
      style={{
        padding: '8px 12px',
        cursor: 'pointer',
        borderRadius: 4,
        background: selectedId === skill.id ? 'var(--fc-fill-2, #f0f0f0)' : 'transparent',
        marginBottom: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.name}</span>
      {skill.enabled !== 1 && (
        <Tag color='default' style={{ marginLeft: 4, fontSize: 11 }}>
          off
        </Tag>
      )}
    </div>
  );

  const renderMetaInfo = (skill: AISkill) => {
    const items: { label: string; value: string }[] = [];
    if (skill.license) items.push({ label: t('skill.license'), value: skill.license });
    if (skill.compatibility) items.push({ label: t('skill.compatibility'), value: skill.compatibility });
    if (skill.allowed_tools) items.push({ label: t('skill.allowed_tools'), value: skill.allowed_tools });
    if (skill.metadata && Object.keys(skill.metadata).length > 0) {
      items.push({
        label: t('skill.metadata'),
        value: Object.entries(skill.metadata)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', '),
      });
    }
    if (items.length === 0) return null;
    return (
      <div
        style={{
          marginBottom: 16,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: 12,
          rowGap: 6,
          fontSize: 13,
          lineHeight: '20px',
        }}
      >
        {items.map((item) => (
          <React.Fragment key={item.label}>
            <span style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap' }}>{item.label}</span>
            <span style={{ wordBreak: 'break-word' }}>{item.value}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 200px)', border: '1px solid var(--fc-border-subtle, #e8e8e8)', borderRadius: 'var(--fc-radius-md, 6px)' }}>
      {/* Left panel */}
      <div style={{ width: 240, borderRight: '1px solid var(--fc-border-subtle, #e8e8e8)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--fc-border-subtle, #e8e8e8)' }}>
          <strong>{t('skill.title')}</strong>
          <div>
            <SearchOutlined style={{ marginRight: 8, cursor: 'pointer' }} onClick={() => setShowSearch(!showSearch)} />
            <Dropdown overlay={addMenu} trigger={['click']}>
              <PlusOutlined style={{ cursor: 'pointer' }} />
            </Dropdown>
          </div>
        </div>
        {showSearch && (
          <div style={{ padding: '8px 12px' }}>
            <Input size='small' placeholder={t('skill.search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {builtinSkills.length > 0 && (
            <>
              <div style={{ padding: '4px 12px', fontSize: 12, color: '#999' }}>{t('skill.builtin')}</div>
              {builtinSkills.map(renderSkillItem)}
            </>
          )}
          {customSkills.length > 0 && (
            <>
              <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', marginTop: 8 }}>{t('skill.custom')}</div>
              {customSkills.map(renderSkillItem)}
            </>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        {selected ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{selected.name}</h3>
              <div>
                <Switch size='small' checked={selected.enabled === 1} onChange={() => handleToggleEnabled(selected)} style={{ marginRight: 12 }} />
                <Button
                  size='small'
                  icon={<EditOutlined />}
                  style={{ marginRight: 8 }}
                  onClick={() => {
                    setEditData(selected);
                    setModalVisible(true);
                  }}
                >
                  {t('skill.edit')}
                </Button>
                {selected.is_builtin !== 1 && (
                  <Popconfirm title={t('skill.delete_confirm')} onConfirm={() => handleDelete(selected.id)}>
                    <Button size='small' icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                )}
              </div>
            </div>
            {selected.description && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{t('skill.description')}</div>
                <div>{selected.description}</div>
              </div>
            )}
            {renderMetaInfo(selected)}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 12, color: '#999' }}>{t('skill.instructions')}</div>
                <div
                  style={{
                    display: 'inline-flex',
                    border: '1px solid var(--fc-border-subtle, #e8e8e8)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    onClick={() => setInstructionsViewMode('preview')}
                    style={{
                      padding: '2px 8px',
                      cursor: 'pointer',
                      background: instructionsViewMode === 'preview' ? 'var(--fc-fill-2, #f0f0f0)' : 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <EyeOutlined style={{ fontSize: 14 }} />
                  </span>
                  <span
                    onClick={() => setInstructionsViewMode('source')}
                    style={{
                      padding: '2px 8px',
                      cursor: 'pointer',
                      background: instructionsViewMode === 'source' ? 'var(--fc-fill-2, #f0f0f0)' : 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderLeft: '1px solid var(--fc-border-subtle, #e8e8e8)',
                    }}
                  >
                    <CodeOutlined style={{ fontSize: 14 }} />
                  </span>
                </div>
              </div>
              {instructionsViewMode === 'preview' ? (
                <div
                  style={{
                    background: 'var(--fc-fill-1, #fafafa)',
                    border: '1px solid var(--fc-border-subtle, #e8e8e8)',
                    borderRadius: 4,
                    padding: 12,
                    maxHeight: 400,
                    overflow: 'auto',
                  }}
                >
                  <Markdown content={selected.instructions} />
                </div>
              ) : (
                <pre
                  style={{
                    background: 'var(--fc-fill-1, #fafafa)',
                    border: '1px solid var(--fc-border-subtle, #e8e8e8)',
                    borderRadius: 4,
                    padding: 12,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 400,
                    overflow: 'auto',
                    fontSize: 13,
                    fontFamily: 'Monaco, Menlo, monospace',
                  }}
                >
                  {selected.instructions}
                </pre>
              )}
            </div>
            <ResourceFiles skillId={selected.id} files={selected.files} onRefresh={refreshSelected} />
          </>
        ) : (
          <Empty description={t('skill.no_selection')} style={{ marginTop: 100 }} />
        )}
      </div>

      <input ref={fileInputRef} type='file' accept='.md' style={{ display: 'none' }} onChange={handleImport} />
      <WriteSkillModal
        visible={modalVisible}
        data={editData}
        onClose={() => setModalVisible(false)}
        onOk={() => {
          setModalVisible(false);
          fetchSkills();
          refreshSelected();
        }}
      />
    </div>
  );
}
