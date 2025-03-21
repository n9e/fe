import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Modal, Table, Button, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getTargetList } from '@/services/targets';

interface IProps {
  queries: any[];
  children?: React.ReactNode;
  targetType?: string;
}

export default function Preview(props: IProps) {
  const { t } = useTranslation('DeviceSelect');
  const { queries, children, targetType = 'button' } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    if (!visible) return;
    getTargetList({
      p: page,
      limit,
      queries,
    })
      .then((res) => {
        setData(res?.dat?.list || []);
        setTotal(res?.dat?.total || 0);
      })
      .catch(() => {
        setData([]);
        setTotal(0);
      });
  }, [visible, page, limit]);

  return (
    <div>
      <Modal
        title={t('host.preview')}
        visible={visible}
        width={800}
        onCancel={() => {
          setVisible(false);
        }}
        footer={false}
      >
        <Table
          size='small'
          rowKey='id'
          columns={[
            {
              title: t('common:table.ident'),
              dataIndex: 'ident',
            },
            {
              title: t('common:host.host_tags'),
              dataIndex: 'host_tags',
              render: (val) => {
                return _.map(val, (item) => {
                  return (
                    <Tag key={item} color='purple'>
                      {item}
                    </Tag>
                  );
                });
              },
            },
            {
              title: t('common:host.tags'),
              dataIndex: 'tags',
              render: (val) => {
                return _.map(val, (item) => {
                  return (
                    <Tag key={item} color='purple'>
                      {item}
                    </Tag>
                  );
                });
              },
            },
            {
              title: t('common:business_group'),
              dataIndex: 'group_objs',
              render(groupObjs: any[]) {
                return _.isEmpty(groupObjs)
                  ? t('common:not_grouped')
                  : _.map(groupObjs, (item) => {
                      return (
                        <Tag color='purple' key={item.id}>
                          {item.name}
                        </Tag>
                      );
                    });
              },
            },
          ]}
          dataSource={data}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Modal>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {children}
        {targetType === 'button' ? (
          <Button
            size='small'
            type='primary'
            ghost
            onClick={() => {
              setVisible(true);
            }}
          >
            {t('host.preview')}
          </Button>
        ) : (
          <SearchOutlined
            onClick={() => {
              setVisible(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
