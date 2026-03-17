import React, { useState } from 'react';
import { useRequest } from 'ahooks';
import { Table, Space, Button, Upload, Modal, message } from 'antd';
import { EyeOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
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

  const { data, loading, run } = useRequest(() => getItem(id), {
    refreshDeps: [id],
  });

  return (
    <>
      <div className='flex justify-between fc-toolbar mb-2'>
        <div className='text-main text-l1'>{t('resource_files')}</div>
        <Upload
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
        </Upload>
      </div>
      <Table
        className='fc-table'
        size='small'
        rowKey='id'
        loading={loading}
        dataSource={data?.files}
        columns={[
          {
            dataIndex: 'name',
            title: t('file_name'),
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
      />
      {resourceState.id && resourceState.name && (
        <ResourceModal visible={resourceState.visible} id={resourceState.id} name={resourceState.name} onClose={() => setResourceState({ visible: false })} />
      )}
    </>
  );
}
