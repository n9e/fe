import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { Modal, Table, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';

// @ts-ignore
import { getNetworkDevicesList } from 'plus:/pages/networkDevices/services';

interface Props {
  queries: any[];
  children?: React.ReactNode;
  targetType?: string;
}

export default function Preview(props: Props) {
  const { t } = useTranslation('DeviceSelect');
  const { busiGroups } = useContext(CommonStateContext);
  const { queries, children, targetType = 'button' } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    if (!visible) return;
    getNetworkDevicesList({
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
        title={t('network_device.preview')}
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
              title: t('network-devices:ip'),
              dataIndex: 'ip',
            },
            {
              title: t('network-devices:sys_name'),
              dataIndex: 'sys_name',
            },
            {
              title: t('common:business_group'),
              dataIndex: 'group_id',
              render: (id) => {
                return _.find(busiGroups, { id })?.name;
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
            {t('network_device.preview')}
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
