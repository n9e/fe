import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { Modal, Space, Select, Table, Tag, message } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getTargetList } from '@/services/targets';
import { rulesClone } from '@/pages/alertRules/services';
import ValuesSelect from './ValuesSelect';

interface Props {
  gid: number;
  ids: React.Key[];
  busiGroups: any[];
  onOk: () => void;
}

const queryKeyOptions = ['all_hosts', 'group_ids', 'tags'];

function index(props: Props & ModalWrapProps) {
  const { t } = useTranslation('alertRules');
  const { gid, ids, busiGroups, onOk, visible, destroy } = props;
  const [filterHost, setFilterHost] = useState<{
    key: string;
    op: string;
    values: any[];
  }>({
    key: 'all_hosts',
    op: '==',
    values: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [hosts, setHosts] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [resultData, setResultData] = useState<{
    visible: boolean;
    data: any[];
  }>({
    visible: false,
    data: [],
  });
  const { run: fetchHosts } = useDebounceFn(
    () => {
      setLoading(true);
      getTargetList({
        p: 1,
        limit: 100000, // TODO 临时解决方案，limit 100000 认为是获取全部
        queries: [filterHost],
      })
        .then((res) => {
          setHosts(res?.dat?.list || []);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    fetchHosts();
  }, [filterHost.key, filterHost.op, filterHost.values]);

  return (
    <Modal
      width={800}
      title={t('batch.cloneToHosts.select_hosts.title')}
      visible={visible}
      onOk={() => {
        rulesClone(gid, {
          ids,
          ident_list: selectedRowKeys,
        }).then((res) => {
          if (!_.isEmpty(res)) {
            const data: any[] = [];
            _.forEach(res, (val, rule) => {
              _.forEach(val, (msg, host) => {
                data.push({
                  id: data.length + 1,
                  host,
                  rule,
                  msg,
                });
              });
            });
            setResultData({
              visible: true,
              data,
            });
          } else {
            destroy();
            message.success(t('common:success.clone'));
            onOk();
          }
        });
      }}
      onCancel={destroy}
      okText={t('batch.cloneToHosts.clone_btn')}
    >
      <Space align='baseline'>
        <div>{t('batch.cloneToHosts.select_hosts.filter')}</div>
        <Select
          style={{ minWidth: 100 }}
          value={filterHost.key}
          onChange={(val) => {
            setFilterHost({
              key: val,
              op: '==',
              values: [],
            });
          }}
        >
          {queryKeyOptions.map((item) => (
            <Select.Option key={item} value={item}>
              {t(`host.query.key.${item}`)}
            </Select.Option>
          ))}
        </Select>
        {filterHost.key !== 'all_hosts' && (
          <>
            <Select
              style={{ minWidth: 60 }}
              options={[
                {
                  value: '==',
                  label: '==',
                },
                {
                  value: '!=',
                  label: '!=',
                },
              ]}
              value={filterHost.op}
              onChange={(val) => {
                setFilterHost({
                  ...filterHost,
                  op: val,
                });
              }}
            />
            <Space align='baseline'>
              <ValuesSelect
                queryKey={filterHost.key}
                value={filterHost.values}
                onChange={(val) => {
                  setFilterHost({
                    ...filterHost,
                    values: val,
                  });
                }}
              />
            </Space>
          </>
        )}
      </Space>
      <Table
        className='mt2'
        size='small'
        rowKey='ident'
        loading={loading}
        columns={[
          {
            title: t('batch.cloneToHosts.select_hosts.ident'),
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
            title: t('batch.cloneToHosts.select_hosts.group'),
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
        dataSource={hosts}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (selectedRowKeys: string[]) => {
            setSelectedRowKeys(selectedRowKeys);
          },
        }}
      />
      <Modal
        width={800}
        visible={resultData.visible}
        title={t('batch.cloneToHosts.result.title')}
        footer={null}
        onCancel={() => {
          setResultData({
            visible: false,
            data: [],
          });
        }}
      >
        <Table
          size='small'
          rowKey='id'
          columns={[
            {
              title: t('batch.cloneToHosts.result.host'),
              dataIndex: 'host',
            },
            {
              title: t('batch.cloneToHosts.result.rule'),
              dataIndex: 'rule',
            },
            {
              title: t('batch.cloneToHosts.result.msg'),
              dataIndex: 'msg',
            },
          ]}
          dataSource={resultData.data}
        />
      </Modal>
    </Modal>
  );
}

export default ModalHOC<Props>(index);
