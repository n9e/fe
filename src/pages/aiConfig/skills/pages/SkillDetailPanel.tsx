import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Menu, Modal, Space, Switch, Tag, Tooltip, message } from 'antd';
import { DeleteOutlined, EllipsisOutlined, DownloadOutlined, UploadOutlined, ReloadOutlined, InfoCircleOutlined, EditOutlined } from '@ant-design/icons';
import { GitBranch, GitCommitHorizontal, Tag as TagIcon } from 'lucide-react';
import JSZip from 'jszip';
import _ from 'lodash';
import { saveAs } from 'file-saver';
import moment from 'moment';

import { CommonStateContext } from '@/App';

import { NS } from '../constants';
import { getFile, getItem } from '../services';
import { GitRefType, Item, SkillAuthValues } from '../types';
import { canModifySkill } from '../utils/permission';
import DocumentPreviewPanel from './DocumentPreviewPanel';
import UploadSkillModal from './UploadSkillModal';

interface Props {
  item: Item;
  onToggleEnabled: () => void;
  onImport: (file: File, auth: SkillAuthValues) => void;
  onDelete: () => void;
  onGitUpdate?: () => void;
  onGitReplaceConfig?: () => void;
  onBuiltinGitUpdate?: () => void;
  builtinGitUpdating?: boolean;
}

function shortCommit(commit?: string) {
  if (!commit) return '-';
  return commit.length > 8 ? commit.slice(0, 8) : commit;
}

function getRefIcon(refType?: GitRefType) {
  if (refType === 'tag') {
    return <TagIcon size={14} strokeWidth={1} />;
  }
  if (refType === 'commit') {
    return <GitCommitHorizontal size={14} strokeWidth={1} />;
  }
  return <GitBranch size={14} strokeWidth={1} />;
}

export default function SkillDetailPanel(props: Props) {
  const { t } = useTranslation(NS);
  const { profile } = useContext(CommonStateContext);
  const { item, onToggleEnabled, onImport, onDelete, onGitUpdate, onGitReplaceConfig, onBuiltinGitUpdate, builtinGitUpdating } = props;

  const [previewMode, setPreviewMode] = React.useState<'formatted' | 'code'>('formatted');
  const [uploadModalVisible, setUploadModalVisible] = React.useState(false);

  const isGit = item.source_type === 'git';
  const isBuiltin = item.builtin === true;
  const gitInfo = item.git_info;
  // 非内置 skill 的编辑/替换/删除按权限门控；内置 skill 仍按下方原有 admin 逻辑。
  const canModify = !isBuiltin && canModifySkill(item, profile);
  // 替换本地 skill 时回填当前授权范围与团队（内置 skill 不套用授权，见 showAuthFields）。
  const replaceAuth = useMemo<SkillAuthValues>(() => ({ user_group_ids: item.user_group_ids, private: item.private }), [item.user_group_ids, item.private]);

  const getSkillMdPath = (fileName?: string) => {
    const normalized = _.toLower(_.trim(fileName || ''));
    if (!normalized) return undefined;
    if (normalized === 'skill.md') return 'SKILL.md';
    if (_.endsWith(normalized, '/skill.md')) {
      const filePath = _.join(_.filter(_.split(fileName || '', '/')), '/');
      return filePath || 'SKILL.md';
    }
    return undefined;
  };

  const handleDownload = async () => {
    try {
      const skillDetail = await getItem(item.id);
      const zip = new JSZip();

      const files = skillDetail.files || [];
      const fileContents = await Promise.all(
        _.map(files, (file) => {
          return getFile(file.id);
        }),
      );

      _.forEach(fileContents, (fileContent) => {
        const filePath = _.join(_.filter(_.split(fileContent.name || '', '/')), '/');
        const normalizedPath = filePath || `file-${fileContent.id}`;
        zip.file(normalizedPath, fileContent.content || '');
      });

      const skillMdFile = _.find(fileContents, (fileContent) => !!getSkillMdPath(fileContent.name));
      if (skillMdFile) {
        const skillMdPath = getSkillMdPath(skillMdFile.name) || 'SKILL.md';
        zip.file(skillMdPath, skillMdFile.content || '');
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${item.name || 'skill'}.zip`);
    } catch (_error) {
      message.error(t('upload_file_error'));
    }
  };

  const showUpdateButton = isGit;
  const showOverflowMenu = (() => {
    if (isBuiltin && isGit) return false;
    if (isBuiltin && !isGit) return !!profile.admin;
    return true;
  })();
  const replaceMenuKey = isGit ? 'git-replace' : 'zip-upload';

  const handleReplaceClick = () => {
    if (isGit) {
      onGitReplaceConfig?.();
    } else {
      setUploadModalVisible(true);
    }
  };

  const overflowMenu = (
    <Menu>
      {((!isBuiltin && canModify) || (isBuiltin && !isGit && !!profile.admin)) && (
        <Menu.Item key={replaceMenuKey} onClick={handleReplaceClick}>
          <Space>
            {isGit ? <EditOutlined /> : <UploadOutlined />}
            {isGit ? t('upload_skill_modify') : t('upload_skill_update')}
          </Space>
        </Menu.Item>
      )}
      {!isBuiltin && (
        <Menu.Item key='download' onClick={handleDownload}>
          <Space>
            <DownloadOutlined />
            {t('download_skill')}
          </Space>
        </Menu.Item>
      )}
      {!isBuiltin && canModify && (
        <Menu.Item
          key='delete'
          disabled={item.enabled}
          title={item.enabled ? t('common:delete_disable_first') : undefined}
          onClick={() => {
            Modal.confirm({
              title: t('edite_menu_3_confirm'),
              onOk: onDelete,
            });
          }}
        >
          <Space>
            <DeleteOutlined />
            {t('delete_skill')}
          </Space>
        </Menu.Item>
      )}
    </Menu>
  );

  const updatedAtText = item.updated_at ? moment.unix(item.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-';

  const renderMetaSection = () => {
    if (isBuiltin && isGit) {
      if (!gitInfo?.current_commit) {
        return null;
      }
      return (
        <div>
          <Space size={32} align='start'>
            <div>
              <div className='text-soft'>{t('git.meta_update_at')}</div>
              <div>{updatedAtText}</div>
            </div>
            <div>
              <div className='text-soft'>Commit</div>
              <Tooltip title={gitInfo?.current_commit || ''}>
                <div className='flex items-center gap-1'>
                  <span className='text-soft inline-flex items-center'>
                    <GitCommitHorizontal size={14} strokeWidth={1} />
                  </span>
                  <span className='font-mono'>{shortCommit(gitInfo?.current_commit)}</span>
                </div>
              </Tooltip>
            </div>
          </Space>
        </div>
      );
    }

    if (!isBuiltin && isGit) {
      const refType = gitInfo?.ref_type;
      const refTypeLabel = refType === 'tag' ? 'Tag' : refType === 'commit' ? 'Commit' : 'Branch';
      return (
        <div>
          <Space size={32} align='start'>
            <div>
              <div className='text-soft'>{t('common:table.username')}</div>
              <div>{item.updated_by ?? '-'}</div>
            </div>
            <div>
              <div className='text-soft'>{t('git.meta_update_at')}</div>
              <div>{updatedAtText}</div>
            </div>
            <div>
              <div className='text-soft'>{t('git.meta_url')}</div>
              <div className='break-all font-mono'>{gitInfo?.url || '-'}</div>
            </div>
            <div>
              <div className='text-soft'>{refTypeLabel}</div>
              <Tooltip title={gitInfo?.current_commit || ''}>
                <div className='flex items-center gap-1'>
                  <span className='text-soft inline-flex items-center'>{getRefIcon(refType)}</span>
                  <span className='font-mono'>
                    {gitInfo?.ref || '-'}
                    {gitInfo?.current_commit ? `(${shortCommit(gitInfo.current_commit)})` : ''}
                  </span>
                </div>
              </Tooltip>
            </div>
          </Space>
          {item.description ? (
            <div className='mt-3'>
              <div className='text-soft'>{t('description')}</div>
              <div>{item.description}</div>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div>
        <Space size={16}>
          <div>
            <div className='text-soft'>{t('common:table.username')}</div>
            <div>{item.updated_by ?? '-'}</div>
          </div>
          <div>
            <div className='text-soft'>{t('common:table.update_at')}</div>
            <div>{updatedAtText}</div>
          </div>
        </Space>
        <div className='mt-2'>
          <div className='text-soft'>{t('description')}</div>
          <div>{item.description ?? '-'}</div>
        </div>
      </div>
    );
  };

  const showMetaSection = !isBuiltin || isGit;

  return (
    <div className='w-full min-w-0 h-full pr-2 flex flex-col'>
      <div className='flex justify-between fc-toolbar mb-2'>
        <div className='text-title text-l2 flex items-center gap-2'>
          <span>{isBuiltin && !isGit ? t('form.usage') : item.name}</span>
        </div>
        <Space>
          {!isBuiltin && canModify && (
            <>
              {t('form.enabled')}
              <Switch size='small' checked={item.enabled} onChange={onToggleEnabled} />
            </>
          )}
          {showUpdateButton &&
            (isBuiltin ? (
              <>
                {item.has_new_version === true && (
                  <Tag className='m-0' color='red'>
                    <InfoCircleOutlined /> {t('git.has_new_version_tag')}
                  </Tag>
                )}
                <Button size='small' icon={<ReloadOutlined />} onClick={onBuiltinGitUpdate} loading={builtinGitUpdating}>
                  {t('git.update_btn')}
                </Button>
                <Button
                  size='small'
                  icon={<UploadOutlined />}
                  onClick={() => {
                    setUploadModalVisible(true);
                  }}
                >
                  {t('upload_skill_update')}
                </Button>
              </>
            ) : (
              <>
                {item.has_new_version === true && (
                  <Tag className='m-0' color='red'>
                    <InfoCircleOutlined /> {t('git.has_new_version_tag')}
                  </Tag>
                )}
                <Button size='small' icon={<ReloadOutlined />} onClick={onGitUpdate}>
                  {t('git.update_btn')}
                </Button>
              </>
            ))}
          {showOverflowMenu && (
            <Dropdown overlay={overflowMenu}>
              <Button size='small' icon={<EllipsisOutlined />} />
            </Dropdown>
          )}
        </Space>
      </div>
      {showMetaSection && (
        <>
          {renderMetaSection()}
          <div className='skills-section-divider my-4' />
        </>
      )}
      <DocumentPreviewPanel
        title={isBuiltin ? t('form.usage') : t('form.instructions')}
        content={item.instructions}
        loading={false}
        isMarkdown
        showHeader={!isBuiltin || isGit}
        previewMode={previewMode}
        onPreviewModeChange={(mode) => {
          setPreviewMode(mode);
        }}
      />
      <UploadSkillModal
        title={t('upload_modal_title')}
        showSubtitle
        showAuthFields={!isBuiltin}
        defaultAuth={replaceAuth}
        visible={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
        }}
        onSubmit={onImport}
      />
    </div>
  );
}
