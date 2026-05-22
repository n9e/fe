import React from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Radio, Space, Spin, Tooltip } from 'antd';
import { CodeOutlined, EyeOutlined } from '@ant-design/icons';
import yaml from 'js-yaml';

import Markdown from '@/components/Markdown';

import { NS } from '../constants';

/**
 * 解析 Markdown 中开头的 YAML frontmatter（--- ... ---）
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, any> | null; body: string } {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: null, body: content };
  }

  const endIndex = trimmed.indexOf('---', 3);
  if (endIndex === -1) {
    return { frontmatter: null, body: content };
  }

  const yamlStr = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 3).trim();

  try {
    const frontmatter = yaml.load(yamlStr) as Record<string, any>;
    return { frontmatter, body };
  } catch {
    return { frontmatter: null, body: content };
  }
}

/** 渲染 YAML frontmatter 为元数据面板 */
function FrontmatterPanel({ frontmatter, title }: { frontmatter: Record<string, any>; title: string }) {
  const entries = Object.entries(frontmatter).filter(([, value]) => value != null);
  if (entries.length === 0) return null;

  return (
    <div className='bg-fc-150 fc-border rounded-lg overflow-hidden p-4'>
      <div className='text-l1 mb-2'>{title}</div>
      <table className='w-full text-sm'>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className='px-2 py-1 whitespace-nowrap text-soft'>{key}</td>
              <td className='px-2 py-1 break-word'>{typeof value === 'string' ? value : JSON.stringify(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  title: string;
  content?: string;
  loading?: boolean;
  isMarkdown: boolean;
  showHeader?: boolean;
  previewMode: 'formatted' | 'code';
  onPreviewModeChange: (mode: 'formatted' | 'code') => void;
  extra?: React.ReactNode;
}

export default function DocumentPreviewPanel(props: Props) {
  const { t } = useTranslation(NS);
  const { title, content, loading, isMarkdown, showHeader = true, previewMode, onPreviewModeChange, extra } = props;

  const { frontmatter, body } = React.useMemo(() => {
    if (content && isMarkdown) {
      return parseFrontmatter(content);
    }
    return { frontmatter: null, body: content };
  }, [content, isMarkdown]);

  return (
    <div className='w-full h-full min-w-0 min-h-0 pr-2 flex flex-col'>
      {showHeader && (
        <div className='flex justify-between items-center fc-toolbar mb-2 gap-3'>
          <div className='text-title text-l2 break-all'>{title}</div>
          <Space>
            {extra}
            {isMarkdown && (
              <Radio.Group
                size='small'
                value={previewMode}
                onChange={(event) => {
                  onPreviewModeChange(event.target.value);
                }}
              >
                <Radio.Button value='formatted'>
                  <Tooltip title={t('form.formatted_tip')} placement='top'>
                    <EyeOutlined />
                  </Tooltip>
                </Radio.Button>
                <Radio.Button value='code'>
                  <Tooltip title={t('form.code_tip')} placement='top'>
                    <CodeOutlined />
                  </Tooltip>
                </Radio.Button>
              </Radio.Group>
            )}
          </Space>
        </div>
      )}
      <div className='bg-fc-100 fc-border rounded-lg p-4 min-h-[240px] h-full flex-1 children:h-full'>
        <Spin spinning={loading}>
          {!content ? (
            <div className='min-h-[208px] flex items-center justify-center'>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('document_empty')} />
            </div>
          ) : isMarkdown && previewMode === 'formatted' ? (
            <div className='h-full best-looking-scroll space-y-4'>
              {frontmatter && <FrontmatterPanel frontmatter={frontmatter} title={t('frontmatter_title')} />}
              <Markdown content={body || ''} />
            </div>
          ) : (
            <div className='h-full best-looking-scroll'>
              <pre className='whitespace-pre-wrap break-all'>{content}</pre>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
