import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Dropdown, Menu, Switch, Popconfirm, Empty, Tag, Radio, Divider, Collapse, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Markdown from '@/components/Markdown';
import { AISkill, getAISkills, getAISkill, deleteAISkill, updateAISkill, importAISkill } from './services';
import WriteSkillModal from './WriteSkillModal';
import ResourceFiles from './ResourceFiles';

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--fc-text-3, #999)',
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

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

  const isActive = (id: number) => selectedId === id;

  const renderSkillItem = (skill: AISkill) => (
    <div
      key={skill.id}
      onClick={() => setSelectedId(skill.id)}
      style={{
        padding: '7px 12px',
        cursor: 'pointer',
        borderRadius: 6,
        background: isActive(skill.id) ? 'var(--fc-fill-2, #f0f0f0)' : 'transparent',
        borderLeft: isActive(skill.id) ? '3px solid var(--ant-primary-color, #1890ff)' : '3px solid transparent',
        marginBottom: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        fontSize: 13,
      }}
      onMouseEnter={(e) => {
        if (!isActive(skill.id)) e.currentTarget.style.background = 'var(--fc-fill-1, #fafafa)';
      }}
      onMouseLeave={(e) => {
        if (!isActive(skill.id)) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive(skill.id) ? 500 : 400 }}>{skill.name}</span>
      {skill.enabled !== 1 && (
        <Tag color='default' style={{ marginLeft: 4, fontSize: 11, lineHeight: '18px' }}>
          off
        </Tag>
      )}
    </div>
  );

  const hasMetaInfo = (skill: AISkill) => {
    return skill.license || skill.compatibility || skill.allowed_tools || (skill.metadata && Object.keys(skill.metadata).length > 0);
  };

  const renderMetaInfo = (skill: AISkill) => {
    if (!hasMetaInfo(skill)) return null;

    const items: { label: string; value: React.ReactNode }[] = [];
    if (skill.license) items.push({ label: t('skill.license'), value: <Tag style={{ margin: 0, fontSize: 12 }}>{skill.license}</Tag> });
    if (skill.compatibility) items.push({ label: t('skill.compatibility'), value: skill.compatibility });
    if (skill.allowed_tools) {
      items.push({
        label: t('skill.allowed_tools'),
        value: (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {skill.allowed_tools.split(/\s+/).map((tool) => (
              <Tag key={tool} style={{ margin: 0, fontSize: 12, fontFamily: 'Monaco, Menlo, Consolas, monospace' }}>
                {tool}
              </Tag>
            ))}
          </div>
        ),
      });
    }
    if (skill.metadata && Object.keys(skill.metadata).length > 0) {
      items.push({
        label: t('skill.metadata'),
        value: (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.entries(skill.metadata).map(([k, v]) => (
              <Tag key={k} style={{ margin: 0, fontSize: 12 }}>
                <span style={{ color: 'var(--fc-text-3, #999)' }}>{k}:</span> {v}
              </Tag>
            ))}
          </div>
        ),
      });
    }

    return (
      <div style={{ marginBottom: 20 }}>
        <Collapse ghost style={{ marginLeft: -12, marginRight: -12 }}>
          <Collapse.Panel header={<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fc-text-3, #999)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('skill.advanced_config')}</span>} key='meta'>
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--fc-fill-1, #fafafa)',
                border: '1px solid var(--fc-border-subtle, #e8e8e8)',
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  columnGap: 20,
                  rowGap: 12,
                  fontSize: 13,
                  lineHeight: '22px',
                  alignItems: 'start',
                }}
              >
                {items.map((item) => (
                  <React.Fragment key={item.label}>
                    <span style={{ fontSize: 12, color: 'var(--fc-text-3, #999)', whiteSpace: 'nowrap', lineHeight: '22px' }}>{item.label}</span>
                    <span style={{ wordBreak: 'break-word' }}>{item.value}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Collapse.Panel>
        </Collapse>
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
              <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 500, color: 'var(--fc-text-3, #999)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('skill.builtin')}</div>
              {builtinSkills.map(renderSkillItem)}
            </>
          )}
          {customSkills.length > 0 && (
            <>
              <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 500, color: 'var(--fc-text-3, #999)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: builtinSkills.length > 0 ? 12 : 0 }}>{t('skill.custom')}</div>
              {customSkills.map(renderSkillItem)}
            </>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
        {selected ? (
          <>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginRight: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: '28px' }}>{selected.name}</h3>
                    {selected.is_builtin === 1 && (
                      <Tag color='blue' style={{ margin: 0, fontSize: 11, lineHeight: '18px', borderRadius: 4 }}>
                        {t('skill.is_builtin')}
                      </Tag>
                    )}
                  </div>
                  {selected.description && <div style={{ marginTop: 6, fontSize: 13, color: 'var(--fc-text-2, #666)', lineHeight: '20px' }}>{selected.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <Switch size='small' checked={selected.enabled === 1} onChange={() => handleToggleEnabled(selected)} />
                  <Button
                    size='small'
                    icon={<EditOutlined />}
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
              <Divider style={{ margin: '16px 0 0 0' }} />
            </div>

            {/* Meta info card */}
            {renderMetaInfo(selected)}

            {/* Instructions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={sectionLabelStyle}>{t('skill.instructions')}</div>
                <Radio.Group
                  size='small'
                  value={instructionsViewMode}
                  onChange={(e) => setInstructionsViewMode(e.target.value)}
                  optionType='button'
                  buttonStyle='solid'
                >
                  <Radio.Button value='preview'><EyeOutlined /></Radio.Button>
                  <Radio.Button value='source'><CodeOutlined /></Radio.Button>
                </Radio.Group>
              </div>
              {instructionsViewMode === 'preview' ? (
                <div
                  style={{
                    background: 'var(--fc-fill-1, #fafafa)',
                    border: '1px solid var(--fc-border-subtle, #e8e8e8)',
                    borderRadius: 6,
                    padding: '12px 16px',
                    maxHeight: 480,
                    overflow: 'auto',
                  }}
                >
                  <Markdown content={selected.instructions} />
                </div>
              ) : (
                <pre
                  style={{
                    background: '#1e293b',
                    color: '#e2e8f0',
                    border: '1px solid var(--fc-border-subtle, #e8e8e8)',
                    borderRadius: 6,
                    padding: '12px 16px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 480,
                    overflow: 'auto',
                    fontSize: 13,
                    lineHeight: '20px',
                    fontFamily: 'Monaco, Menlo, Consolas, monospace',
                    margin: 0,
                  }}
                >
                  {selected.instructions}
                </pre>
              )}
            </div>

            {/* Resource Files */}
            <ResourceFiles skillId={selected.id} files={selected.files} onRefresh={refreshSelected} />
          </>
        ) : (
          <Empty description={t('skill.no_selection')} style={{ marginTop: '30%' }} />
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
