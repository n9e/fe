/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default (props) => {
  const { selectedHosts, allHosts, changeSelectedHosts } = props;
  const [showHosts, setShowHosts] = useState(selectedHosts);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 只用作弹框出来以后selectedHosts属性变化触发的setShowHosts
  useEffect(() => {
    if (!isModalVisible) return;
    console.log('selectedHosts', selectedHosts);
    setShowHosts(selectedHosts);
  }, [selectedHosts, isModalVisible]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: '标识', dataIndex: 'ident', width: 150 },
    {
      title: '备注',
      dataIndex: 'note',
      width: 100,
      render: (t) => (
        <div style={{ width: '100px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={t}>
          {t}
        </div>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 200,
      render: (t) => (
        <div style={{ width: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={t}>
          {t}
        </div>
      ),
    },
    {
      title: '操作',
      width: 80,
      render: (t, h) => (
        <Button
          type='link'
          block
          style={{ padding: 0, textAlign: 'left' }}
          onClick={(t) => {
            const selectedHostsCopy = [...selectedHosts];
            const shidx = selectedHostsCopy.findIndex((sh) => sh === h);
            console.log('shidx', shidx);
            selectedHostsCopy.splice(shidx, 1);
            changeSelectedHosts && changeSelectedHosts(selectedHostsCopy);
          }}
        >
          移除
        </Button>
      ),
    },
  ];
  const selectedHostsKeys = selectedHosts.map((sh) => sh.ident);
  return (
    <>
      <Button
        type='link'
        style={{ paddingLeft: 4 }}
        onClick={() => {
          showModal();
        }}
      >
        已选中（{selectedHostsKeys.length}/{allHosts.length}）
      </Button>
      <Modal width={800} title={`已选中监控对象（${selectedHostsKeys.length}/${allHosts.length}）`} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} footer={null}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Input
            style={{ width: 200 }}
            placeholder='搜索标识、标签、备注'
            onPressEnter={(e) => {
              const txt = (e.target as HTMLInputElement).value;
              setShowHosts(
                selectedHosts.filter((sh) => {
                  return `${sh?.ident || ''}${(sh?.tags || []).join(' ')}${sh?.note}`.indexOf(txt) !== -1;
                }),
              );
            }}
            prefix={<SearchOutlined />}
          />
          <Button danger onClick={(_) => changeSelectedHosts([])}>
            清空所有选中的对象
          </Button>
        </div>
        <Table size='small' style={{ marginTop: 10 }} className='host-list' rowKey='ident' columns={columns} dataSource={showHosts} pagination={{ simple: true }}></Table>
      </Modal>
    </>
  );
};
