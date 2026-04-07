import React, { useState, useEffect, useRef } from 'react';
import { Input, Dropdown, Menu, Switch, Empty, Tag, Divider, Collapse, Modal, Tooltip, message } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  CodeOutlined,
  CopyOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FolderOutlined,
  SnippetsOutlined,
  UploadOutlined,
  EllipsisOutlined,
  DownOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import Markdown from '@/components/Markdown';
import { AISkill, AISkillFile, getAISkills, getAISkill, getAISkillFile, deleteAISkill, updateAISkill, importAISkill } from './services';
import WriteSkillModal from './WriteSkillModal';

interface TreeNode {
  type: 'folder' | 'file';
  name: string;
  path: string;
  children?: TreeNode[];
  fileId?: number; // for files only - undefined means virtual SKILL.md
}

// Build a tree from a flat list of files (paths separated by '/').
// Adds a virtual SKILL.md at root if none exists (case-insensitive).
function buildFileTree(files: AISkillFile[]): TreeNode[] {
  const rootChildren: TreeNode[] = [];
  const hasSkillMd = files.some((f) => f.name.toLowerCase() === 'skill.md');
  type FileItem = { name: string; id?: number };
  const allFiles: FileItem[] = hasSkillMd
    ? files.map((f) => ({ name: f.name, id: f.id }))
    : [{ name: 'SKILL.md' }, ...files.map((f) => ({ name: f.name, id: f.id }))];

  for (const file of allFiles) {
    const parts = file.name.split('/').filter(Boolean);
    if (parts.length === 0) continue;

    let currentChildren = rootChildren;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let node = currentChildren.find((n) => n.name === part);
      if (!node) {
        node = {
          type: isFile ? 'file' : 'folder',
          name: part,
          path: currentPath,
          children: isFile ? undefined : [],
          fileId: isFile ? file.id : undefined,
        };
        currentChildren.push(node);
      } else if (!isFile && !node.children) {
        node.children = [];
      }

      if (!isFile) {
        currentChildren = node.children!;
      }
    }
  }

  // Sort: SKILL.md first, then folders, then other files alphabetically
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      const aIsSkill = a.type === 'file' && a.name.toLowerCase() === 'skill.md';
      const bIsSkill = b.type === 'file' && b.name.toLowerCase() === 'skill.md';
      if (aIsSkill !== bIsSkill) return aIsSkill ? -1 : 1;
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => {
      if (n.children) sortNodes(n.children);
    });
  };
  sortNodes(rootChildren);

  return rootChildren;
}

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
  const [expandedSkillIds, setExpandedSkillIds] = useState<Set<number>>(new Set());
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [builtinCollapsed, setBuiltinCollapsed] = useState(false);
  const [customCollapsed, setCustomCollapsed] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<{ name: string; content: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
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

  // Auto-expand selected skill
  useEffect(() => {
    if (selected) {
      setExpandedSkillIds((prev) => {
        const next = new Set(prev);
        next.add(selected.id);
        return next;
      });
    }
  }, [selected]);

  // Reset file selection when switching skills
  useEffect(() => {
    setSelectedFilePath(null);
    setSelectedFileContent(null);
  }, [selectedId]);

  const handleFileClick = async (node: TreeNode) => {
    setSelectedFilePath(node.path);
    if (node.fileId === undefined) {
      // Virtual SKILL.md - use the skill's instructions field
      setSelectedFileContent({ name: node.name, content: selected?.instructions || '' });
      return;
    }
    setFileLoading(true);
    try {
      const data = await getAISkillFile(node.fileId);
      setSelectedFileContent({ name: node.name, content: data?.content || '' });
    } catch {
      setSelectedFileContent({ name: node.name, content: '' });
    } finally {
      setFileLoading(false);
    }
  };

  const handleCopyContent = () => {
    if (!selectedFileContent) return;
    navigator.clipboard.writeText(selectedFileContent.content).then(
      () => message.success('Copied'),
      () => message.error('Copy failed'),
    );
  };

  const handleDownload = async () => {
    if (!selected) return;
    // Build SKILL.md content with frontmatter so it can be re-imported
    const fmLines: string[] = ['---', `name: ${selected.name}`];
    if (selected.description) fmLines.push(`description: ${selected.description.replace(/\n/g, ' ')}`);
    if (selected.license) fmLines.push(`license: ${selected.license}`);
    if (selected.compatibility) fmLines.push(`compatibility: ${selected.compatibility}`);
    if (selected.allowed_tools) fmLines.push(`allowed-tools: ${selected.allowed_tools}`);
    if (selected.metadata && Object.keys(selected.metadata).length > 0) {
      fmLines.push('metadata:');
      Object.entries(selected.metadata).forEach(([k, v]) => fmLines.push(`  ${k}: ${v}`));
    }
    fmLines.push('---', '');
    const skillMdContent = fmLines.join('\n') + (selected.instructions || '');

    // If there are no resource files, just download SKILL.md
    if (!selected.files || selected.files.length === 0) {
      const blob = new Blob([skillMdContent], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${selected.name}.md`);
      return;
    }

    // Otherwise, dynamically load JSZip and bundle SKILL.md + resource files
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder(selected.name)!;
      folder.file('SKILL.md', skillMdContent);
      // Fetch each resource file's content
      await Promise.all(
        selected.files.map(async (f) => {
          try {
            const data = await getAISkillFile(f.id);
            folder.file(f.name, data?.content || '');
          } catch {
            folder.file(f.name, '');
          }
        }),
      );
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${selected.name}.zip`);
    } catch {
      // Fallback to SKILL.md only if zipping fails
      const blob = new Blob([skillMdContent], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${selected.name}.md`);
    }
  };

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

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFolder = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderTreeNode = (node: TreeNode, depth: number, skillId: number): React.ReactNode => {
    const indent = 8 + depth * 14;

    if (node.type === 'file') {
      const isFileActive = selectedFilePath === node.path;
      return (
        <div
          key={`file:${skillId}:${node.path}`}
          onClick={(e) => {
            e.stopPropagation();
            handleFileClick(node);
          }}
          title={node.name}
          style={{
            padding: '3px 8px',
            paddingLeft: indent + 14,
            fontSize: 12,
            color: isFileActive ? 'var(--fc-text-1, #333)' : 'var(--fc-text-2, #666)',
            background: isFileActive ? 'var(--fc-fill-2, #f0f0f0)' : 'transparent',
            border: isFileActive ? '1px solid var(--ant-primary-color, #1890ff)' : '1px solid transparent',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontWeight: isFileActive ? 500 : 400,
          }}
          onMouseEnter={(e) => {
            if (!isFileActive) e.currentTarget.style.background = 'var(--fc-fill-1, #fafafa)';
          }}
          onMouseLeave={(e) => {
            if (!isFileActive) e.currentTarget.style.background = 'transparent';
          }}
        >
          <FileTextOutlined style={{ fontSize: 12, flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
        </div>
      );
    }

    const folderKey = `${skillId}:${node.path}`;
    const collapsed = collapsedFolders.has(folderKey);
    return (
      <div key={`folder:${skillId}:${node.path}`}>
        <div
          onClick={(e) => toggleFolder(folderKey, e)}
          style={{
            padding: '3px 8px',
            paddingLeft: indent,
            fontSize: 12,
            color: 'var(--fc-text-2, #666)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
            cursor: 'pointer',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--fc-fill-1, #fafafa)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
            <FolderOutlined style={{ fontSize: 12, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
          </div>
          <span
            style={{
              fontSize: 8,
              transition: 'transform 0.2s',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              display: 'inline-flex',
              flexShrink: 0,
            }}
          >
            <DownOutlined />
          </span>
        </div>
        {!collapsed && node.children && <div>{node.children.map((child) => renderTreeNode(child, depth + 1, skillId))}</div>}
      </div>
    );
  };

  const addMenu = (
    <Menu>
      <Menu.Item
        key='write'
        icon={<SnippetsOutlined />}
        onClick={() => {
          setEditData(undefined);
          setModalVisible(true);
        }}
      >
        {t('skill.write')}
      </Menu.Item>
      <Menu.Item key='upload' icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
        {t('skill.upload')}
      </Menu.Item>
    </Menu>
  );

  const renderSectionHeader = (label: string, collapsed: boolean, onToggle: () => void) => (
    <div
      onClick={onToggle}
      style={{
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--fc-text-3, #999)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 8, transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', display: 'inline-flex' }}>
        <DownOutlined />
      </span>
      {label}
    </div>
  );

  const renderSkillItem = (skill: AISkill) => {
    const active = selectedId === skill.id;
    const expanded = active && expandedSkillIds.has(skill.id);
    const resourceFiles = active ? selected?.files || [] : [];
    const treeNodes = active ? buildFileTree(resourceFiles) : [];

    return (
      <div key={skill.id}>
        <div
          onClick={() => {
            setSelectedId(skill.id);
            setSelectedFilePath(null);
            setSelectedFileContent(null);
          }}
          style={{
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: 6,
            background: active ? 'var(--fc-fill-2, #f0f0f0)' : 'transparent',
            marginBottom: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.15s',
            fontSize: 13,
          }}
          onMouseEnter={(e) => {
            if (!active) e.currentTarget.style.background = 'var(--fc-fill-1, #fafafa)';
          }}
          onMouseLeave={(e) => {
            if (!active) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <SnippetsOutlined style={{ fontSize: 14, color: active ? 'var(--fc-text-1, #333)' : 'var(--fc-text-3, #999)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: active ? 500 : 400 }}>{skill.name}</span>
          </div>
          {active && (
            <span
              onClick={(e) => toggleExpand(skill.id, e)}
              style={{ fontSize: 8, color: 'var(--fc-text-3, #999)', cursor: 'pointer', padding: '2px 4px', flexShrink: 0, display: 'inline-flex', transition: 'transform 0.2s', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
            >
              <DownOutlined />
            </span>
          )}
        </div>
        {active && expanded && treeNodes.length > 0 && (
          <div style={{ paddingLeft: 22, paddingBottom: 4 }}>{treeNodes.map((node) => renderTreeNode(node, 0, skill.id))}</div>
        )}
      </div>
    );
  };

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
          <Collapse.Panel
            header={
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fc-text-3, #999)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('skill.advanced_config')}</span>
            }
            key='meta'
          >
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

  const moreMenu = selected ? (
    <Menu>
      <Menu.Item
        key='edit'
        icon={<UploadOutlined />}
        onClick={() => {
          setEditData(selected);
          setModalVisible(true);
        }}
      >
        {t('skill.edit')}
      </Menu.Item>
      <Menu.Item key='download' icon={<DownloadOutlined />} onClick={handleDownload}>
        {t('skill.download')}
      </Menu.Item>
      {selected.is_builtin !== 1 && (
        <>
          <Menu.Divider />
          <Menu.Item
            key='delete'
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              const id = selected.id;
              Modal.confirm({
                title: t('skill.delete_confirm'),
                onOk: () => handleDelete(id),
              });
            }}
          >
            {t('skill.delete')}
          </Menu.Item>
        </>
      )}
    </Menu>
  ) : (
    <Menu />
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 200px)', border: '1px solid var(--fc-border-subtle, #e8e8e8)', borderRadius: 'var(--fc-radius-md, 6px)' }}>
      {/* Left panel */}
      <div style={{ width: 260, borderRight: '1px solid var(--fc-border-subtle, #e8e8e8)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--fc-border-subtle, #e8e8e8)' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{t('skill.title')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SearchOutlined style={{ cursor: 'pointer', fontSize: 14, color: 'var(--fc-text-2, #666)' }} onClick={() => setShowSearch(!showSearch)} />
            <Dropdown overlay={addMenu} trigger={['click']}>
              <PlusOutlined style={{ cursor: 'pointer', fontSize: 14, color: 'var(--fc-text-2, #666)' }} />
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
              {renderSectionHeader(t('skill.builtin'), builtinCollapsed, () => setBuiltinCollapsed(!builtinCollapsed))}
              {!builtinCollapsed && builtinSkills.map(renderSkillItem)}
            </>
          )}
          {customSkills.length > 0 && (
            <>
              {renderSectionHeader(t('skill.custom'), customCollapsed, () => setCustomCollapsed(!customCollapsed))}
              {!customCollapsed && customSkills.map(renderSkillItem)}
            </>
          )}
          {skills.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} style={{ marginTop: 40 }} />}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        {selected ? (
          selectedFileContent ? (
            /* File viewer mode */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedFileContent.name}>
                  {selectedFileContent.name}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    gap: 2,
                    background: 'var(--fc-fill-1, #fafafa)',
                    borderRadius: 6,
                    border: '1px solid var(--fc-border-subtle, #e8e8e8)',
                    padding: 2,
                    alignItems: 'center',
                  }}
                >
                  <Tooltip title='Preview'>
                    <span
                      onClick={() => setInstructionsViewMode('preview')}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: instructionsViewMode === 'preview' ? '#fff' : 'transparent',
                        boxShadow: instructionsViewMode === 'preview' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                        color: instructionsViewMode === 'preview' ? 'var(--fc-text-1, #333)' : 'var(--fc-text-3, #999)',
                        fontSize: 13,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <EyeOutlined />
                    </span>
                  </Tooltip>
                  <Tooltip title='Source'>
                    <span
                      onClick={() => setInstructionsViewMode('source')}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: instructionsViewMode === 'source' ? '#fff' : 'transparent',
                        boxShadow: instructionsViewMode === 'source' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                        color: instructionsViewMode === 'source' ? 'var(--fc-text-1, #333)' : 'var(--fc-text-3, #999)',
                        fontSize: 13,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <CodeOutlined />
                    </span>
                  </Tooltip>
                  <Tooltip title='Copy'>
                    <span
                      onClick={handleCopyContent}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 4,
                        color: 'var(--fc-text-3, #999)',
                        fontSize: 13,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <CopyOutlined />
                    </span>
                  </Tooltip>
                </div>
              </div>
              <Divider style={{ margin: '0 0 16px 0' }} />
              {fileLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--fc-text-3, #999)', padding: 40 }}>Loading...</div>
              ) : instructionsViewMode === 'preview' ? (
                <div style={{ minHeight: 200 }}>
                  <Markdown content={selectedFileContent.content} />
                </div>
              ) : (
                <pre
                  style={{
                    padding: '16px 20px',
                    background: '#1e293b',
                    color: '#e2e8f0',
                    borderRadius: 8,
                    minHeight: 200,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: 13,
                    lineHeight: '20px',
                    fontFamily: 'Monaco, Menlo, Consolas, monospace',
                    margin: 0,
                  }}
                >
                  {selectedFileContent.content}
                </pre>
              )}
            </>
          ) : (
            /* Skill detail view */
            <>
              {/* Header: name + toggle + more menu */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{selected.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Switch size='small' checked={selected.enabled === 1} onChange={() => handleToggleEnabled(selected)} />
                  <Dropdown overlay={moreMenu} trigger={['click']}>
                    <EllipsisOutlined style={{ fontSize: 20, cursor: 'pointer', color: 'var(--fc-text-2, #666)', padding: '4px' }} />
                  </Dropdown>
                </div>
              </div>

              {/* Added by / Invoked by */}
              <div style={{ display: 'flex', gap: 48, marginBottom: 20, fontSize: 13 }}>
                <div>
                  <div style={{ color: 'var(--fc-text-3, #999)', marginBottom: 4, fontSize: 12 }}>{t('skill.added_by')}</div>
                  <div style={{ fontWeight: 500 }}>{selected.is_builtin === 1 ? 'System' : selected.created_by || '-'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--fc-text-3, #999)', marginBottom: 4, fontSize: 12 }}>{t('skill.invoked_by')}</div>
                  <div style={{ fontWeight: 500 }}>User or Agent</div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--fc-text-3, #999)', fontWeight: 500 }}>{t('skill.description')}</span>
                  <InfoCircleOutlined style={{ fontSize: 12, color: 'var(--fc-text-3, #999)' }} />
                </div>
                <div style={{ fontSize: 13, lineHeight: '22px', color: 'var(--fc-text-1, #333)' }}>{selected.description || '-'}</div>
              </div>

              <Divider style={{ margin: '16px 0 20px 0' }} />

              {/* Advanced config (meta info) */}
              {renderMetaInfo(selected)}

              {/* Instructions card */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    border: '1px solid var(--fc-border-subtle, #e8e8e8)',
                    borderRadius: 8,
                    position: 'relative',
                    background: instructionsViewMode === 'source' ? '#1e293b' : 'transparent',
                  }}
                >
                  {/* Toggle buttons inside the card */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 16,
                      zIndex: 1,
                      display: 'flex',
                      gap: 2,
                      background: instructionsViewMode === 'source' ? 'rgba(255,255,255,0.1)' : 'var(--fc-fill-1, #fafafa)',
                      borderRadius: 6,
                      border: instructionsViewMode === 'source' ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--fc-border-subtle, #e8e8e8)',
                      padding: 2,
                    }}
                  >
                    <span
                      onClick={() => setInstructionsViewMode('preview')}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: instructionsViewMode === 'preview' ? '#fff' : 'transparent',
                        boxShadow: instructionsViewMode === 'preview' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                        color: instructionsViewMode === 'preview' ? 'var(--fc-text-1, #333)' : 'var(--fc-text-3, #999)',
                        fontSize: 13,
                        lineHeight: '16px',
                        transition: 'all 0.15s',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <EyeOutlined />
                    </span>
                    <span
                      onClick={() => setInstructionsViewMode('source')}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: instructionsViewMode === 'source' ? 'rgba(255,255,255,0.15)' : 'transparent',
                        boxShadow: instructionsViewMode === 'source' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                        color: instructionsViewMode === 'source' ? '#e2e8f0' : 'var(--fc-text-3, #999)',
                        fontSize: 13,
                        lineHeight: '16px',
                        transition: 'all 0.15s',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <CodeOutlined />
                    </span>
                  </div>

                  {/* Content */}
                  {instructionsViewMode === 'preview' ? (
                    <div style={{ padding: '20px 24px', minHeight: 200, maxHeight: 480, overflow: 'auto' }}>
                      <Markdown content={selected.instructions} />
                    </div>
                  ) : (
                    <pre
                      style={{
                        padding: '20px 24px',
                        minHeight: 200,
                        maxHeight: 480,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: 13,
                        lineHeight: '20px',
                        fontFamily: 'Monaco, Menlo, Consolas, monospace',
                        margin: 0,
                        color: '#e2e8f0',
                      }}
                    >
                      {selected.instructions}
                    </pre>
                  )}
                </div>
              </div>
            </>
          )
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
