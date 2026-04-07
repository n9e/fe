import React, { useState, useEffect } from 'react';
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
import { AISkill, AISkillFile, getAISkills, getAISkill, getAISkillFile, deleteAISkill, updateAISkill } from './services';
import WriteSkillModal from './WriteSkillModal';
import UploadSkillModal from './UploadSkillModal';

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

// Design tokens — bound to the project's CSS variables so the page stays
// consistent with the global theme (and supports dark mode automatically).
const tokens = {
  // Surfaces
  bg: 'var(--fc-fill-2, #ffffff)', // main / right panel — pure white
  bgRail: 'var(--fc-fill-1, #f8fafc)', // left sidebar — subtle cool tint
  cardBg: 'var(--fc-fill-2, #ffffff)', // selected items / instructions card
  cardBorder: 'var(--fc-border-color, #e5e7eb)',
  cardShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.03)',
  cardShadowLg: '0 1px 3px rgba(15, 23, 42, 0.05), 0 8px 24px -8px rgba(15, 23, 42, 0.06)',
  divider: 'var(--fc-fill-3, #f3f4f6)',
  // Text
  text1: 'var(--fc-text-1, #1a1a1a)',
  text2: 'var(--fc-text-3, #666666)',
  text3: 'var(--fc-text-4, #999999)',
  // Interaction
  hover: 'var(--fc-fill-3, #f3f4f6)',
  // Accent for source-mode code blocks
  codeBg: '#0f172a',
  codeText: '#e2e8f0',
  // Typography stacks — keep an editorial serif accent for headings & prose,
  // sans for UI chrome (matches project body font).
  serif:
    '"Charter", "Iowan Old Style", "Source Serif 4", "Source Serif Pro", "Sitka Text", Cambria, "Songti SC", "Noto Serif CJK SC", "Noto Serif SC", Georgia, serif',
  sans:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

// Format unix timestamp (seconds) as e.g. "Apr 7, 2026"
function formatDate(ts?: number): string {
  if (!ts) return '-';
  const d = new Date(ts * 1000);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
  const [customCollapsed, setCustomCollapsed] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<{ name: string; content: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'update'>('upload');

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

  // Backend has no builtin/custom split — show all skills under one section.
  const customSkills = skills;

  const handleDelete = async (id: number) => {
    await deleteAISkill(id);
    message.success('Deleted');
    if (selectedId === id) setSelectedId(null);
    fetchSkills();
  };

  const handleToggleEnabled = async (skill: AISkill) => {
    await updateAISkill(skill.id, { ...skill, enabled: !skill.enabled });
    fetchSkills();
    if (selectedId === skill.id) fetchSelectedSkill(skill.id);
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
            padding: '5px 10px',
            paddingLeft: indent + 14,
            marginRight: 12,
            fontSize: 12.5,
            color: isFileActive ? tokens.text1 : tokens.text2,
            background: isFileActive ? tokens.cardBg : 'transparent',
            border: isFileActive ? `1px solid ${tokens.cardBorder}` : '1px solid transparent',
            boxShadow: isFileActive ? tokens.cardShadow : 'none',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontWeight: isFileActive ? 600 : 400,
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
            fontFamily: tokens.sans,
          }}
          onMouseEnter={(e) => {
            if (!isFileActive) e.currentTarget.style.background = tokens.hover;
          }}
          onMouseLeave={(e) => {
            if (!isFileActive) e.currentTarget.style.background = 'transparent';
          }}
        >
          <FileTextOutlined style={{ fontSize: 12, flexShrink: 0, color: isFileActive ? tokens.text2 : tokens.text3 }} />
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
            padding: '5px 10px',
            paddingLeft: indent,
            marginRight: 12,
            fontSize: 12.5,
            color: tokens.text2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            cursor: 'pointer',
            borderRadius: 8,
            transition: 'background 0.15s ease',
            fontFamily: tokens.sans,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = tokens.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <FolderOutlined style={{ fontSize: 12, flexShrink: 0, color: tokens.text3 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
          </div>
          <span
            style={{
              fontSize: 9,
              transition: 'transform 0.2s ease',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              display: 'inline-flex',
              flexShrink: 0,
              color: tokens.text3,
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
      <Menu.Item
        key='upload'
        icon={<UploadOutlined />}
        onClick={() => {
          setUploadMode('upload');
          setUploadModalVisible(true);
        }}
      >
        {t('skill.upload')}
      </Menu.Item>
    </Menu>
  );

  const renderSectionHeader = (label: string, collapsed: boolean, onToggle: () => void) => (
    <div
      onClick={onToggle}
      style={{
        padding: '8px 20px 6px',
        fontSize: 12,
        fontWeight: 500,
        color: tokens.text3,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        userSelect: 'none',
        letterSpacing: '0.01em',
      }}
    >
      <span style={{ fontSize: 9, transition: 'transform 0.2s ease', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', display: 'inline-flex' }}>
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
      <div key={skill.id} style={{ marginBottom: 2 }}>
        <div
          onClick={() => {
            setSelectedId(skill.id);
            setSelectedFilePath(null);
            setSelectedFileContent(null);
          }}
          style={{
            margin: '0 12px',
            padding: '10px 12px',
            cursor: 'pointer',
            borderRadius: 10,
            background: active ? tokens.cardBg : 'transparent',
            border: active ? `1px solid ${tokens.cardBorder}` : '1px solid transparent',
            boxShadow: active ? tokens.cardShadow : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
            fontSize: 14,
            fontFamily: tokens.sans,
          }}
          onMouseEnter={(e) => {
            if (!active) e.currentTarget.style.background = tokens.hover;
          }}
          onMouseLeave={(e) => {
            if (!active) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <SnippetsOutlined style={{ fontSize: 15, color: active ? tokens.text1 : tokens.text3, flexShrink: 0 }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: active ? 600 : 500,
                color: active ? tokens.text1 : tokens.text2,
              }}
            >
              {skill.name}
            </span>
          </div>
          {active && (
            <span
              onClick={(e) => toggleExpand(skill.id, e)}
              style={{
                fontSize: 9,
                color: tokens.text3,
                cursor: 'pointer',
                padding: '4px 6px',
                flexShrink: 0,
                display: 'inline-flex',
                transition: 'transform 0.2s ease',
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            >
              <DownOutlined />
            </span>
          )}
        </div>
        {active && expanded && treeNodes.length > 0 && (
          <div style={{ padding: '6px 0 4px 26px' }}>{treeNodes.map((node) => renderTreeNode(node, 0, skill.id))}</div>
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
      <div style={{ marginBottom: 24 }}>
        <Collapse ghost style={{ marginLeft: -16, marginRight: -16, background: 'transparent' }}>
          <Collapse.Panel
            header={<span style={{ fontSize: 12, fontWeight: 500, color: tokens.text3, letterSpacing: '0.02em' }}>{t('skill.advanced_config')}</span>}
            key='meta'
          >
            <div
              style={{
                padding: '16px 20px',
                background: tokens.cardBg,
                border: `1px solid ${tokens.cardBorder}`,
                borderRadius: 10,
                boxShadow: tokens.cardShadow,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  columnGap: 24,
                  rowGap: 14,
                  fontSize: 13,
                  lineHeight: '22px',
                  alignItems: 'start',
                  fontFamily: tokens.sans,
                }}
              >
                {items.map((item) => (
                  <React.Fragment key={item.label}>
                    <span style={{ fontSize: 12, color: tokens.text3, whiteSpace: 'nowrap', lineHeight: '22px' }}>{item.label}</span>
                    <span style={{ wordBreak: 'break-word', color: tokens.text1 }}>{item.value}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  };

  // Refined preview/code (and optional copy) toggle pill — dark when in source mode
  const renderViewerToggle = (withCopy: boolean) => {
    const isSource = instructionsViewMode === 'source';
    const pillBg = isSource ? 'rgba(255,255,255,0.08)' : tokens.bgRail;
    const pillBorder = isSource ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${tokens.cardBorder}`;
    const activeBg = isSource ? 'rgba(255,255,255,0.16)' : tokens.cardBg;
    const activeShadow = isSource ? 'none' : '0 1px 2px rgba(60,50,20,0.08)';
    const inactiveColor = isSource ? 'rgba(255,255,255,0.55)' : tokens.text3;
    const activeColor = isSource ? '#f5efe1' : tokens.text1;

    const btnStyle = (active: boolean): React.CSSProperties => ({
      cursor: 'pointer',
      padding: '5px 10px',
      borderRadius: 6,
      background: active ? activeBg : 'transparent',
      boxShadow: active ? activeShadow : 'none',
      color: active ? activeColor : inactiveColor,
      fontSize: 13,
      lineHeight: '16px',
      transition: 'all 0.15s ease',
      display: 'inline-flex',
      alignItems: 'center',
    });

    return (
      <div
        style={{
          display: 'flex',
          gap: 2,
          background: pillBg,
          borderRadius: 8,
          border: pillBorder,
          padding: 3,
          alignItems: 'center',
        }}
      >
        <Tooltip title='Preview'>
          <span onClick={() => setInstructionsViewMode('preview')} style={btnStyle(!isSource)}>
            <EyeOutlined />
          </span>
        </Tooltip>
        <Tooltip title='Source'>
          <span onClick={() => setInstructionsViewMode('source')} style={btnStyle(isSource)}>
            <CodeOutlined />
          </span>
        </Tooltip>
        {withCopy && (
          <Tooltip title='Copy'>
            <span onClick={handleCopyContent} style={{ ...btnStyle(false), color: inactiveColor }}>
              <CopyOutlined />
            </span>
          </Tooltip>
        )}
      </div>
    );
  };

  const moreMenu = selected ? (
    <Menu>
      <Menu.Item
        key='edit'
        icon={<UploadOutlined />}
        onClick={() => {
          setUploadMode('update');
          setUploadModalVisible(true);
        }}
      >
        {t('skill.edit')}
      </Menu.Item>
      <Menu.Item key='download' icon={<DownloadOutlined />} onClick={handleDownload}>
        {t('skill.download')}
      </Menu.Item>
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
    </Menu>
  ) : (
    <Menu />
  );

  return (
    <>
      {/* Usage tip — explains how skills are invoked (single compact line) */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          padding: '8px 14px',
          marginBottom: 10,
          background: 'var(--fc-fill-1, #f8fafc)',
          border: `1px solid ${tokens.cardBorder}`,
          borderRadius: 8,
          fontFamily: tokens.sans,
        }}
      >
        <InfoCircleOutlined style={{ fontSize: 14, color: 'var(--fc-primary-color, #8162dc)', flexShrink: 0 }} />
        <div style={{ fontSize: 12.5, lineHeight: 1.6, color: tokens.text2 }}>
          {t('skill.usage_tip_1')}
          {t('skill.usage_tip_2')}
          {t('skill.usage_tip_3')}
        </div>
      </div>
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 152px)',
        border: `1px solid ${tokens.cardBorder}`,
        borderRadius: 12,
        background: tokens.bg,
        overflow: 'hidden',
        fontFamily: tokens.sans,
        color: tokens.text1,
      }}
    >
      {/* Scoped prose styles so markdown headings/paragraphs inherit the editorial serif tone. */}
      <style>{`
        .skills-prose h1,
        .skills-prose h2,
        .skills-prose h3,
        .skills-prose h4,
        .skills-prose h5,
        .skills-prose h6 {
          font-family: ${tokens.serif};
          color: ${tokens.text1};
          letter-spacing: -0.01em;
          font-weight: 600;
          margin-top: 1.6em;
          margin-bottom: 0.5em;
          line-height: 1.25;
        }
        .skills-prose h1 { font-size: 1.85em; }
        .skills-prose h2 { font-size: 1.4em; }
        .skills-prose h3 { font-size: 1.15em; }
        .skills-prose h1:first-child,
        .skills-prose h2:first-child,
        .skills-prose h3:first-child { margin-top: 0; }
        .skills-prose p,
        .skills-prose li {
          font-family: ${tokens.serif};
          color: ${tokens.text1};
          line-height: 1.7;
        }
        .skills-prose p { margin: 0 0 1em; }
        .skills-prose ul, .skills-prose ol { padding-left: 1.4em; margin: 0 0 1em; }
        .skills-prose li { margin-bottom: 0.35em; }
        /* Block code without a language tag (rendered by Markdown component as
           span.base-code > code, not pre/code). Force a proper code-block look. */
        .skills-prose .base-code:not(.base-code-inline) {
          display: block;
          background: ${tokens.codeBg};
          color: ${tokens.codeText};
          padding: 18px 22px;
          border-radius: 8px;
          overflow: auto;
          font-size: 12.5px;
          line-height: 1.55;
          margin: 0.9em 0 1.2em;
          font-family: "JetBrains Mono", "SF Mono", Monaco, Menlo, Consolas, monospace;
          white-space: pre;
          tab-size: 2;
          border: 0;
        }
        .skills-prose .base-code:not(.base-code-inline) code {
          display: block;
          background: transparent;
          color: inherit;
          padding: 0;
          border: 0;
          white-space: pre;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
        }
        /* Inline code pill */
        .skills-prose .base-code-inline {
          display: inline;
          background: var(--fc-fill-3, #f3f4f6);
          color: #c0392b;
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid var(--fc-border-color, #e5e7eb);
          font-family: "JetBrains Mono", "SF Mono", Monaco, Menlo, Consolas, monospace;
          font-size: 0.88em;
          line-height: 1.5;
        }
        .skills-prose .base-code-inline code {
          background: transparent;
          color: inherit;
          padding: 0;
          border: 0;
          font-family: inherit;
          font-size: inherit;
        }
        /* Fallback: real <pre> blocks (syntax-highlighted with a language) */
        .skills-prose pre {
          background: ${tokens.codeBg};
          color: ${tokens.codeText};
          border-radius: 8px;
          padding: 16px 20px;
          overflow: auto;
          font-size: 12.5px;
          line-height: 1.55;
          margin: 0.9em 0 1.2em;
        }
        .skills-prose pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          border: 0;
        }
        .skills-prose blockquote {
          margin: 1em 0;
          padding: 0.4em 1.2em;
          border-left: 3px solid ${tokens.cardBorder};
          color: ${tokens.text2};
          font-style: italic;
        }
        .skills-prose a { color: #3b6ea8; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px; }
        .skills-prose hr { border: 0; border-top: 1px solid ${tokens.divider}; margin: 1.6em 0; }
      `}</style>
      {/* Left panel */}
      <div
        style={{
          width: 280,
          borderRight: `1px solid ${tokens.divider}`,
          display: 'flex',
          flexDirection: 'column',
          background: tokens.bgRail,
        }}
      >
        <div
          style={{
            padding: '18px 20px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              fontFamily: tokens.serif,
              letterSpacing: '-0.01em',
              color: tokens.text1,
            }}
          >
            {t('skill.title')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SearchOutlined style={{ cursor: 'pointer', fontSize: 15, color: tokens.text2 }} onClick={() => setShowSearch(!showSearch)} />
            <Dropdown overlay={addMenu} trigger={['click']}>
              <PlusOutlined style={{ cursor: 'pointer', fontSize: 15, color: tokens.text2 }} />
            </Dropdown>
          </div>
        </div>
        {showSearch && (
          <div style={{ padding: '0 16px 8px' }}>
            <Input
              size='small'
              placeholder={t('skill.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ borderRadius: 8, background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}` }}
            />
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 0 16px' }}>
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
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 44px', background: tokens.bg }}>
        {selected ? (
          selectedFileContent ? (
            /* ─────────────── File viewer mode ─────────────── */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 600,
                    fontFamily: tokens.serif,
                    letterSpacing: '-0.01em',
                    color: tokens.text1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={selectedFileContent.name}
                >
                  {selectedFileContent.name}
                </h2>
                {renderViewerToggle(true)}
              </div>
              <div style={{ height: 1, background: tokens.divider, marginBottom: 24 }} />
              <div
                style={{
                  background: tokens.cardBg,
                  border: `1px solid ${tokens.cardBorder}`,
                  borderRadius: 12,
                  boxShadow: tokens.cardShadowLg,
                  overflow: 'hidden',
                }}
              >
                {fileLoading ? (
                  <div style={{ textAlign: 'center', color: tokens.text3, padding: 60, fontFamily: tokens.sans }}>Loading…</div>
                ) : instructionsViewMode === 'preview' ? (
                  <div
                    className='skills-prose'
                    style={{
                      padding: '36px 44px',
                      minHeight: 240,
                      fontFamily: tokens.serif,
                      fontSize: 15.5,
                      lineHeight: 1.7,
                      color: tokens.text1,
                    }}
                  >
                    <Markdown content={selectedFileContent.content} />
                  </div>
                ) : (
                  <pre
                    style={{
                      padding: '28px 36px',
                      background: tokens.codeBg,
                      color: tokens.codeText,
                      minHeight: 240,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: 13,
                      lineHeight: '22px',
                      fontFamily: '"JetBrains Mono", "SF Mono", Monaco, Menlo, Consolas, monospace',
                      margin: 0,
                    }}
                  >
                    {selectedFileContent.content}
                  </pre>
                )}
              </div>
            </>
          ) : (
            /* ─────────────── Skill detail view ─────────────── */
            <>
              {/* Header: name + toggle + more menu */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 600,
                    fontFamily: tokens.serif,
                    letterSpacing: '-0.02em',
                    color: tokens.text1,
                    lineHeight: 1.2,
                  }}
                >
                  {selected.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, marginTop: 4 }}>
                  <Switch checked={!!selected.enabled} onChange={() => handleToggleEnabled(selected)} />
                  <Dropdown overlay={moreMenu} trigger={['click']}>
                    <EllipsisOutlined style={{ fontSize: 20, cursor: 'pointer', color: tokens.text2, padding: 4 }} />
                  </Dropdown>
                </div>
              </div>

              {/* Metadata columns */}
              <div style={{ display: 'flex', gap: 56, marginBottom: 26, fontSize: 13.5 }}>
                <div>
                  <div style={{ color: tokens.text3, marginBottom: 6, fontSize: 12, letterSpacing: '0.01em' }}>{t('skill.added_by')}</div>
                  <div style={{ fontWeight: 500, color: tokens.text1 }}>{selected.created_by || '-'}</div>
                </div>
                <div>
                  <div style={{ color: tokens.text3, marginBottom: 6, fontSize: 12, letterSpacing: '0.01em' }}>{t('skill.last_updated')}</div>
                  <div style={{ fontWeight: 500, color: tokens.text1 }}>{formatDate(selected.updated_at)}</div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: tokens.text3, fontWeight: 500, letterSpacing: '0.01em' }}>{t('skill.description')}</span>
                  <InfoCircleOutlined style={{ fontSize: 12, color: tokens.text3 }} />
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: tokens.text1,
                    fontFamily: tokens.serif,
                    maxWidth: 760,
                  }}
                >
                  {selected.description || '-'}
                </div>
              </div>

              <div style={{ height: 1, background: tokens.divider, margin: '24px 0 28px' }} />

              {/* Advanced config (meta info) */}
              {renderMetaInfo(selected)}

              {/* Instructions card */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    background: tokens.cardBg,
                    border: `1px solid ${tokens.cardBorder}`,
                    borderRadius: 12,
                    boxShadow: tokens.cardShadowLg,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Toggle buttons */}
                  <div style={{ position: 'absolute', top: 16, right: 20, zIndex: 1 }}>{renderViewerToggle(false)}</div>

                  {instructionsViewMode === 'preview' ? (
                    <div
                      className='skills-prose'
                      style={{
                        padding: '36px 44px',
                        minHeight: 240,
                        maxHeight: 560,
                        overflow: 'auto',
                        fontFamily: tokens.serif,
                        fontSize: 15.5,
                        lineHeight: 1.7,
                        color: tokens.text1,
                      }}
                    >
                      <Markdown content={selected.instructions} />
                    </div>
                  ) : (
                    <pre
                      style={{
                        padding: '28px 36px',
                        background: tokens.codeBg,
                        color: tokens.codeText,
                        minHeight: 240,
                        maxHeight: 560,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: 13,
                        lineHeight: '22px',
                        fontFamily: '"JetBrains Mono", "SF Mono", Monaco, Menlo, Consolas, monospace',
                        margin: 0,
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
      <UploadSkillModal
        visible={uploadModalVisible}
        mode={uploadMode}
        skillId={uploadMode === 'update' ? selected?.id : undefined}
        onClose={() => setUploadModalVisible(false)}
        onSuccess={() => {
          fetchSkills();
          refreshSelected();
        }}
      />
    </div>
    </>
  );
}
