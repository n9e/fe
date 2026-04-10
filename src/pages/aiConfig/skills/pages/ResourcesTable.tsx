import React, { useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { Table, Space, Button, Upload, Modal, message, Popover, Input } from 'antd';
import { EyeOutlined, DeleteOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { NS } from '../constants';
import { getItem, uploadFile, deleteFile } from '../services';
import ResourceModal from './ResourceModal';

interface Props {
  id: number;
}

export default function ResourcesTable(props: Props) {
  const { t } = useTranslation(NS);
  const { id } = props;

  const [resourceState, setResourceState] = useState<{
    visible: boolean;
    id?: number;
    name?: string;
  }>({
    visible: false,
  });
  const [searchPopoverVisible, setSearchPopoverVisible] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const { data, loading, run } = useRequest(() => getItem(id), {
    refreshDeps: [id],
  });

  const filteredFiles = useMemo(() => {
    const files = data?.files || [];
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) {
      return files;
    }

    return files.filter((item) => item.name?.toLowerCase().includes(keyword));
  }, [data?.files, searchValue]);

  return (
    <>
      <div className='flex justify-between fc-toolbar mb-2'>
        <div className='text-main text-l1'>{t('resource_files')}</div>
        {/* <Upload
          name='file'
          showUploadList={false}
          accept='.md,.txt,.json,.yaml,.yml,.csv'
          customRequest={(options) => {
            const { file } = options;
            try {
              uploadFile(id, file as File).then(() => {
                run();
                message.success(t('upload_file_success'));
              });
            } catch (error) {
              message.error(t('upload_file_error'));
            }
          }}
        >
          <Button size='small' icon={<UploadOutlined />}>
            {t('upload_file')}
          </Button>
        </Upload> */}
      </div>
      <Table
        size='small'
        rowKey='id'
        loading={loading}
        dataSource={filteredFiles}
        columns={[
          {
            dataIndex: 'name',
            title: (
              <div className='flex items-center gap-1'>
                <span>{t('file_name')}</span>
                <Popover
                  trigger='click'
                  placement='topLeft'
                  visible={searchPopoverVisible}
                  onVisibleChange={setSearchPopoverVisible}
                  content={
                    <div className='flex items-center gap-2 w-[240px]'>
                      <Input
                        className='w-[200px]'
                        size='small'
                        value={searchInputValue}
                        placeholder={t('search_placeholder')}
                        allowClear
                        onChange={(e) => {
                          setSearchInputValue(e.target.value);
                        }}
                        onPressEnter={() => {
                          setSearchValue(searchInputValue);
                          setSearchPopoverVisible(false);
                        }}
                      />
                      <Button
                        size='small'
                        type='primary'
                        onClick={() => {
                          setSearchValue(searchInputValue);
                          setSearchPopoverVisible(false);
                        }}
                      >
                        {t('common:btn.search')}
                      </Button>
                      <Button
                        size='small'
                        onClick={() => {
                          setSearchInputValue('');
                          setSearchValue('');
                          setSearchPopoverVisible(false);
                        }}
                      >
                        {t('common:btn.reset')}
                      </Button>
                    </div>
                  }
                >
                  <Button size='small' type='text' style={{ color: searchValue ? 'var(--fc-primary-color)' : undefined }} icon={<SearchOutlined />} />
                </Popover>
              </div>
            ),
          },
          {
            dataIndex: 'size',
            title: t('file_size'),
            render: (size) => {
              // 小于1024显示B，1024-1048576显示KB，1048576-1073741824显示MB，大于1073741824显示GB
              if (size < 1024) {
                return `${size} B`;
              } else if (size < 1048576) {
                return `${(size / 1024).toFixed(2)} KB`;
              } else if (size < 1073741824) {
                return `${(size / 1048576).toFixed(2)} MB`;
              } else {
                return `${(size / 1073741824).toFixed(2)} GB`;
              }
            },
          },
          {
            title: t('common:table.operations'),
            width: 100,
            render: (record) => {
              return (
                <Space size={2}>
                  <Button
                    size='small'
                    type='text'
                    className='p-0'
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setResourceState({ visible: true, id: record.id, name: record.name });
                    }}
                  />
                  <Button
                    size='small'
                    type='text'
                    className='p-0'
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: t('common:confirm.delete'),
                        onOk: () => {
                          deleteFile(record.id).then(() => {
                            message.success(t('common:success.delete'));
                            run();
                          });
                        },
                      });
                    }}
                  />
                </Space>
              );
            },
          },
        ]}
        pagination={false}
        scroll={{
          y: 400,
        }}
      />
      {resourceState.id && resourceState.name && (
        <ResourceModal visible={resourceState.visible} id={resourceState.id} name={resourceState.name} onClose={() => setResourceState({ visible: false })} />
      )}
    </>
  );
}
