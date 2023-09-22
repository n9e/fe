import React, { useState, useContext } from 'react';
import { Button, Modal, Tooltip, Tag, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { previewMutedEvents } from '@/services/shield';
import { CommonStateContext } from '@/App';
import { deleteAlertEventsModal, SeverityColor } from '@/pages/event';
import { processFormValues } from './utils';

interface Props {
  form: any;
}

export default function PreviewMutedEvents(props: Props) {
  const { t } = useTranslation('AlertCurEvents');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { form } = props;
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const columns = [
    {
      title: t('prod'),
      dataIndex: 'rule_prod',
      width: 100,
      render: (value) => {
        return t(`AlertHisEvents:rule_prod.${value}`);
      },
    },
    {
      title: t('common:datasource.id'),
      dataIndex: 'datasource_id',
      width: 100,
      render: (value, record) => {
        return _.find(groupedDatasourceList?.[record.cate], { id: value })?.name || '-';
      },
    },
    {
      title: t('rule_name'),
      dataIndex: 'rule_name',
      render(title, { id, tags }) {
        return (
          <>
            <div>
              <Link to={`/alert-cur-events/${id}`}>{title}</Link>
            </div>
            <div>
              {_.map(tags, (item) => {
                return (
                  <Tooltip key={item} title={item}>
                    <Tag color='purple' style={{ maxWidth: '100%' }}>
                      <div
                        style={{
                          maxWidth: 'max-content',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item}
                      </div>
                    </Tag>
                  </Tooltip>
                );
              })}
            </div>
          </>
        );
      },
    },
    {
      title: t('trigger_time'),
      dataIndex: 'trigger_time',
      width: 120,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
  const fetchData = (values) => {
    previewMutedEvents(processFormValues(values), values.group_id).then((res) => {
      setData(res.dat || []);
    });
  };

  return (
    <>
      <Button
        onClick={() => {
          form.validateFields().then((values: any) => {
            setVisible(true);
            fetchData(values);
          });
        }}
      >
        屏蔽预览
      </Button>
      <Modal
        title='屏蔽预览'
        visible={visible}
        footer={[
          <Button
            key='cancel'
            onClick={() => {
              setVisible(false);
            }}
          >
            取消
          </Button>,
          <Button
            key='delete'
            type='primary'
            disabled={selectedRowKeys.length === 0}
            onClick={() => {
              deleteAlertEventsModal(
                selectedRowKeys,
                () => {
                  setSelectedRowKeys([]);
                  fetchData(form.getFieldsValue());
                },
                t,
              );
            }}
          >
            删除
          </Button>,
        ]}
        onCancel={() => {
          setVisible(false);
        }}
        width={800}
      >
        <Table
          size='small'
          tableLayout='fixed'
          rowKey='id'
          columns={columns}
          dataSource={data}
          rowClassName={(record: { severity: number; is_recovered: number }) => {
            return SeverityColor[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
          }}
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            onChange(selectedRowKeys: number[]) {
              setSelectedRowKeys(selectedRowKeys);
            },
          }}
          pagination={false}
          scroll={{
            y: 450,
          }}
        />
      </Modal>
    </>
  );
}
