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
        title={t('host.query.preview')}
        visible={visible}
        width={800}
        onCancel={() => {
          setVisible(false);
        }}
        footer={false}
      >
        <div style={{ overflowX: 'auto' }}>
          <Table
            size='small'
            rowKey='id'
            columns={[
              {
                title: t('common:table.ident'),
                dataIndex: 'ident',
                width: 180,
              },
              {
                title: t('common:host.host_tags'),
                dataIndex: 'host_tags',
                width: 280,
                render: (val) => {
                  return (
                    <div className='flex flex-wrap gap-1'>
                      {_.map(val, (item) => {
                        return (
                          <Tag key={item} color='purple' className='max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap'>
                            {item}
                          </Tag>
                        );
                      })}
                    </div>
                  );
                },
              },
              {
                title: t('common:host.tags'),
                dataIndex: 'tags',
                width: 280,
                render: (val) => {
                  return (
                    <div className='flex flex-wrap gap-1'>
                      {_.map(val, (item) => {
                        return (
                          <Tag key={item} color='purple' className='max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap'>
                            {item}
                          </Tag>
                        );
                      })}
                    </div>
                  );
                },
              },
              {
                title: t('common:business_group'),
                dataIndex: 'group_objs',
                width: 180,
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
        </div>
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
