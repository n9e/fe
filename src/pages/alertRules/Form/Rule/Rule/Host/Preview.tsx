import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Modal, Table, Button, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { getTargetList } from '@/services/targets';

interface IProps {
  queries: any[];
}

export default function Preview(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { queries } = props;
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
    }).then((res) => {
      setData(res?.dat?.list || []);
      setTotal(res?.dat?.total || 0);
    });
  }, [visible, page, limit]);

  return (
    <div>
      <Modal
        title={t('host.query.preview')}
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
                  ? t('not_grouped')
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
      <Button
        size='small'
        type='primary'
        ghost
        onClick={() => {
          setVisible(true);
        }}
      >
        {t('host.query.preview')}
      </Button>
    </div>
  );
}
