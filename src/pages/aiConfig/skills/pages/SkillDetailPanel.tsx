import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Collapse, Dropdown, Menu, Modal, Space, Switch, Table, Tag, message } from 'antd';
import { DeleteOutlined, EllipsisOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import JSZip from 'jszip';
import _ from 'lodash';
import { saveAs } from 'file-saver';
import moment from 'moment';

import { NS } from '../constants';
import { getFile, getItem } from '../services';
import { Item } from '../types';
import DocumentPreviewPanel from './DocumentPreviewPanel';
import UploadSkillModal from './UploadSkillModal';

interface Props {
  item: Item;
  onToggleEnabled: () => void;
  onEdit: () => void;
  onImport: (file: File) => void;
  onDelete: () => void;
}

export default function SkillDetailPanel(props: Props) {
  const { t } = useTranslation(NS);
  const { item, onToggleEnabled, onEdit, onImport, onDelete } = props;

  const [previewMode, setPreviewMode] = React.useState<'formatted' | 'code'>('formatted');
  const [uploadModalVisible, setUploadModalVisible] = React.useState(false);

  const handleDownload = async () => {
    try {
      const skillDetail = await getItem(item.id);
      const zip = new JSZip();

      zip.file('SKILL.md', skillDetail.instructions || '');

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

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${item.name || 'skill'}.zip`);
    } catch (_error) {
      message.error(t('upload_file_error'));
    }
  };

  return (
    <div className='w-full min-w-0 h-full pr-2 flex flex-col'>
      <div className='flex justify-between fc-toolbar mb-2'>
        <div className='text-title text-l2'>{item.name}</div>
        <Space>
          <Switch size='small' checked={item.enabled} onChange={onToggleEnabled} />
          <Dropdown
            overlay={
              <Menu>
                {item.builtin !== true && (
                  <Menu.Item
                    key='upload'
                    onClick={() => {
                      setUploadModalVisible(true);
                    }}
                  >
                    <Space>
                      <UploadOutlined />
                      {t('upload_skill_update')}
                    </Space>
                  </Menu.Item>
                )}
                <Menu.Item key='download' onClick={handleDownload}>
                  <Space>
                    <DownloadOutlined />
                    {t('download_skill')}
                  </Space>
                </Menu.Item>
                {item.builtin !== true && (
                  <Menu.Item
                    key='unload'
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
            }
          >
            <Button size='small' icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      </div>
      <div>
        <Space size={16}>
          <div>
            <div className='text-soft'>{t('common:table.username')}</div>
            <div>{item.updated_by ?? '-'}</div>
          </div>
          <div>
            <div className='text-soft'>{t('common:table.update_at')}</div>
            <div>{item.updated_at ? moment.unix(item.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
          </div>
        </Space>
        <div className='mt-2'>
          <div className='text-soft'>{t('description')}</div>
          <div>{item.description ?? '-'}</div>
        </div>
      </div>
      <div className='skills-section-divider my-4' />
      <DocumentPreviewPanel
        title={t('form.instructions')}
        content={item.instructions}
        loading={false}
        isMarkdown
        previewMode={previewMode}
        onPreviewModeChange={(mode) => {
          setPreviewMode(mode);
        }}
      />
      <UploadSkillModal
        title={t('upload_modal_title')}
        visible={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
        }}
        onSubmit={onImport}
      />
      {/* <Collapse ghost className='skills-form-collapse skills-form-collapse-compact'>
        <Collapse.Panel key='advanced' header={<div className='text-main text-l1'>{t('form.advanced_settings')}</div>}>
          <Table
            size='small'
            showHeader={false}
            rowKey='name'
            pagination={false}
            bordered={false}
            dataSource={[
              {
                name: 'license',
                value: item.license,
              },
              {
                name: 'compatibility',
                value: item.compatibility,
              },
              {
                name: 'allowed_tools',
                value: item.allowed_tools,
              },
            ]}
            columns={[
              {
                dataIndex: 'name',
                key: 'name',
                width: 120,
                render: (name) => {
                  if (name === 'license') {
                    return t('form.license');
                  }
                  if (name === 'compatibility') {
                    return t('form.compatibility');
                  }
                  if (name === 'allowed_tools') {
                    return t('form.allowed_tools');
                  }
                  return name;
                },
              },
              {
                dataIndex: 'value',
                key: 'value',
                render: (value, record) => {
                  if (_.isEmpty(value)) {
                    return '-';
                  }
                  if (record.name === 'allowed_tools' && _.includes(value, ' ')) {
                    return _.map(_.split(value, ' '), (tool) => {
                      return <Tag key={tool}>{tool}</Tag>;
                    });
                  }
                  return value;
                },
              },
            ]}
          />
        </Collapse.Panel>
      </Collapse> */}
    </div>
  );
}
