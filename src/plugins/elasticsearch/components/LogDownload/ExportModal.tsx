import React, { useContext, useEffect, useState } from 'react';
import { Button, Modal, Popconfirm, Table, Tooltip, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/lib/table';
import { delDownloadTask, getLogsDownloadTasks } from '@/pages/explorer/Elasticsearch/services';
import moment from 'moment';
import { ITaskItem } from './type';
import { CheckCircleFilled, FieldTimeOutlined } from '@ant-design/icons';
import { CommonStateContext } from '@/App';
import { N9E_PATHNAME } from '@/utils/constant';

interface IProps {
  datasourceValue?: number;
}

export default function ExportModal(props: IProps) {
  const { t } = useTranslation('explorer');
  const { datasourceValue } = props;
  const { profile } = useContext(CommonStateContext);

  const [exportVisible, setExportVisible] = useState<boolean>(false);
  const [taskList, setTaskList] = useState<ITaskItem[]>([]);

  useEffect(() => {
    exportVisible && init();
  }, [exportVisible]);

  const init = () => {
    getLogsDownloadTasks({
      start: moment().subtract(4, 'd').format('X'),
      end: moment().format('X'),
      ds_id: datasourceValue,
    }).then((res) => {
      setTaskList(res);
    });
  };

  const columns: ColumnsType<ITaskItem> = [
    {
      title: t('log.log_export.fileName'),
      dataIndex: 'config',
      render: (text, record) => record.config.file_name,
    },
    {
      title: t('log.log_export.create_time'),
      dataIndex: 'create_time',
      render: (text) => moment(text, 'X').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('log.log_export.describe'),
      dataIndex: 'describe',
      render: (text, record) => {
        return (
          <>
            <div>
              {t('datasource:es.index')}: {record.query.index}
            </div>
            <div>
              {t('datasource:es.filter')}: {record.query.filter}
            </div>
            <div>
              {t('datasource:es.date_field')}: {record.query.date_field}
            </div>
          </>
        );
      },
    },
    {
      title: t('log.log_download.format'),
      dataIndex: 'format',
      render: (text, record) => (record.config.format === 'json' ? 'JSON' : 'CSV'),
    },
    {
      title: t('log.log_export.status'),
      dataIndex: 'status',
      render: (text, record) => {
        // 0: 文件准备中 1: 文件准备完成   2: 文件过期
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {text === 1 ? (
              <>
                <CheckCircleFilled style={{ color: '#00A700', marginRight: '4px' }} />
                {t('log.log_export.status1')}
              </>
            ) : text === 0 ? (
              <>
                <FieldTimeOutlined style={{ color: '#d1d1d9', marginRight: '4px' }} />
                {t('log.log_export.status0')}
              </>
            ) : (
              <>
                <span style={{ color: '#666666' }}>{t('log.log_export.status2')}</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: t('log.log_export.operation'),
      dataIndex: 'operation',
      render: (text, record) => {
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            <Popconfirm
              title={t('log.log_export.del_btn_tips')}
              onConfirm={() => {
                delDownloadTask({ ids: [Number(record.id)] }).then((res) => {
                  message.success(t('log.log_export.delSuccess'));
                  setTaskList((old) => {
                    const temp = old?.filter((el) => el.id !== record.id);
                    return temp;
                  });
                });
              }}
            >
              <Button size='small' type='link' danger>
                {t('log.log_export.del_btn')}
              </Button>
            </Popconfirm>
            <Button
              size='small'
              type='link'
              disabled={record.status !== 1}
              onClick={() => {
                handleDownload(record);
              }}
            >
              {t('log.log_download.title')}
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDownload = (record: ITaskItem) => {
    const base64Str = btoa(profile.username);
    var downloadLink = document.createElement('a');
    downloadLink.href = `/api/${N9E_PATHNAME}/logs/download/${record.id}?u=${base64Str}`;
    downloadLink.download = record.config.file_name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <Button
        onClick={() => {
          setExportVisible(true);
        }}
      >
        {t('log.export')}
      </Button>
      <Modal
        title={<>{t('log.log_export.title')}</>}
        visible={exportVisible}
        onCancel={() => {
          setExportVisible(false);
        }}
        footer={null}
        width={800}
        centered
      >
        <Table
          size='small'
          dataSource={taskList}
          columns={columns}
          rowKey={'id'}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20],
            defaultPageSize: 5,
          }}
          locale={{ emptyText: t('log.log_export.emptyText') }}
        />
      </Modal>
    </>
  );
}
