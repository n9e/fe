import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button, Tag, Empty, Dropdown, Menu, Space, Switch, Radio, Upload, Modal, Spin, Collapse, Table, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import Markdown from '@/components/Markdown';

import { NS } from '../constants';
import { Item, getList, importItem, importItemToUpdate, putItem, deleteItem } from '../services';
import AddModal from './AddModal';
import EditModal from './EditModal';
import ResourcesTable from './ResourcesTable';

export default function List() {
  const { t } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);

  const [searchValue, setSearchValue] = useState('');
  const [activeData, setActiveData] = useState<Item>();
  const [addModalState, setAddModalState] = useState({ visible: false });
  const [editModalState, setEditModalState] = useState<{
    visible: boolean;
    id?: number;
  }>({ visible: false, id: undefined });
  const [mdFormat, setMdFormat] = useState<'formatted' | 'code'>('formatted');

  const { data, loading, run, mutate } = useRequest(getList, {
    refreshDeps: [],
    onSuccess: (res) => {
      if (!activeData || !_.find(res, { id: activeData.id })) {
        setActiveData(res[0]);
      }
    },
  });

  if (_.isEmpty(data)) {
    if (loading) {
      return (
        <PageLayout title={t('title')}>
          <div className='fc-page n9e'>
            <div className='bg-fc-100 rounded flex items-center justify-center h-[200px]'>
              <Spin spinning />
            </div>
          </div>
        </PageLayout>
      );
    }
    return (
      <>
        <PageLayout title={t('title')}>
          <div className='n9e'>
            <div className='bg-fc-100 rounded flex items-center justify-center'>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key='manual'
                        onClick={() => {
                          setAddModalState({
                            visible: true,
                          });
                        }}
                      >
                        {t('create_menu_1')}
                      </Menu.Item>
                      <Menu.Item key='upload'>
                        <Upload
                          name='file'
                          showUploadList={false}
                          accept='.zip,.tar.gz,.tgz'
                          customRequest={(options) => {
                            const { file } = options;
                            try {
                              importItem(file as File).then(() => {
                                run();
                                message.success(t('upload_file_success'));
                              });
                            } catch (error) {
                              message.error(t('upload_file_error'));
                            }
                          }}
                        >
                          {t('create_menu_2')}
                        </Upload>
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button type='primary'>{t('create')}</Button>
                </Dropdown>
              </Empty>
            </div>
          </div>
        </PageLayout>
        <AddModal
          visible={addModalState.visible}
          onOk={() => {
            setAddModalState({ visible: false });
            run();
          }}
          onCancel={() => {
            setAddModalState({ visible: false });
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageLayout title={t('title')}>
        <div className='n9e h-full overflow-hidden children:h-full mr-0'>
          <Spin spinning={loading}>
            <div className='flex h-full overflow-hidden'>
              <div
                className='fc-toolbar w-[240px] flex-shrink-0 flex flex-col pr-4 mr-4'
                style={{
                  borderRight: '1px solid var(--fc-border-color)',
                }}
              >
                <div className='flex gap-2 mb-2 flex-shrink-0'>
                  <Input
                    className='min-w-0'
                    placeholder={t('search_placeholder')}
                    allowClear
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                  />
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key='manual'
                          onClick={() => {
                            setAddModalState({
                              visible: true,
                            });
                          }}
                        >
                          {t('create_menu_1')}
                        </Menu.Item>
                        <Menu.Item key='upload'>
                          <Upload
                            name='file'
                            showUploadList={false}
                            accept='.zip,.tar.gz,.tgz'
                            customRequest={(options) => {
                              const { file } = options;
                              try {
                                importItem(file as File).then(() => {
                                  run();
                                  message.success(t('upload_file_success'));
                                });
                              } catch (error) {
                                message.error(t('upload_file_error'));
                              }
                            }}
                          >
                            {t('create_menu_2')}
                          </Upload>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button className='flex-shrink-0' icon={<PlusOutlined />} />
                  </Dropdown>
                </div>
                <div className='h-full min-h-0 best-looking-scroll'>
                  {_.map(
                    _.filter(data, (item) => _.includes(_.upperCase(item.name), _.upperCase(searchValue))),
                    (item) => {
                      return (
                        <div
                          key={item.id}
                          className='flex justify-between items-center gap-2 p-2 hover:bg-fc-200 cursor-pointer rounded mb-1'
                          style={{
                            backgroundColor: activeData?.id === item.id ? 'rgb(var(--fc-fill-primary-rgb) / 0.1)' : undefined,
                          }}
                          onClick={() => {
                            setActiveData(item);
                          }}
                        >
                          <div className='truncate'>{item.name}</div>
                          {item.enabled === false && <Tag className='m-0'>OFF</Tag>}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
              <div className='w-full min-w-0 best-looking-scroll pr-2'>
                <div className='flex justify-between fc-toolbar mb-2'>
                  <div className='text-title text-l2'>{activeData?.name}</div>
                  <Space>
                    <Switch
                      size='small'
                      checked={activeData?.enabled}
                      onChange={() => {
                        if (activeData) {
                          const newEnabled = !activeData.enabled;
                          putItem(activeData.id, {
                            ..._.pick(activeData, ['name', 'description', 'instructions', 'license', 'compatibility', 'allowed_tools', 'metadata']),
                            enabled: newEnabled,
                          }).then(() => {
                            message.success(t('common:success.modify'));
                            mutate((prevData) => {
                              if (!prevData) return prevData;
                              return prevData.map((item) => {
                                if (item.id === activeData.id) {
                                  return {
                                    ...item,
                                    enabled: newEnabled,
                                  };
                                }
                                return item;
                              });
                            });
                            setActiveData({
                              ...activeData,
                              enabled: newEnabled,
                            });
                          });
                        }
                      }}
                    />

                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item
                            key='manual'
                            onClick={() => {
                              if (activeData?.id) {
                                setEditModalState({
                                  id: activeData?.id,
                                  visible: true,
                                });
                              }
                            }}
                          >
                            {t('edite_menu_1')}
                          </Menu.Item>
                          <Menu.Item key='upload'>
                            <Upload
                              name='file'
                              showUploadList={false}
                              accept='.zip,.tar.gz,.tgz'
                              customRequest={(options) => {
                                const { file } = options;
                                try {
                                  if (activeData?.id) {
                                    importItemToUpdate(activeData.id, file as File).then(() => {
                                      run();
                                      message.success(t('upload_file_success'));
                                    });
                                  }
                                } catch (error) {
                                  message.error(t('upload_file_error'));
                                }
                              }}
                            >
                              {t('edite_menu_2')}
                            </Upload>
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button size='small' icon={<EditOutlined />} />
                    </Dropdown>
                    <Button
                      size='small'
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        if (activeData) {
                          Modal.confirm({
                            title: t('common:confirm.delete'),
                            onOk: () => {
                              deleteItem(activeData.id).then(() => {
                                message.success(t('common:success.delete'));
                                // 删除后用 mutate 来更新列表数据和 activeData，而不是直接调用 run 来重新获取列表数据，这样可以避免删除后 activeData 仍然存在但列表中已经没有的情况
                                mutate((prevData) => {
                                  if (!prevData) return prevData;
                                  const newData = prevData.filter((item) => item.id !== activeData.id);
                                  // 如果删除的项是当前 activeData，则更新 activeData 为列表中的第一项或 undefined
                                  if (activeData.id === activeData.id) {
                                    setActiveData(newData[0]);
                                  }
                                  return newData;
                                });
                              });
                            },
                          });
                        }
                      }}
                    />
                  </Space>
                </div>
                {activeData?.description && <div className='text-hint'>{activeData?.description}</div>}
                <div
                  className='my-4'
                  style={{
                    borderBottom: '1px solid var(--fc-border-color)',
                  }}
                />
                <div>
                  <div className='flex justify-between fc-toolbar mb-2'>
                    <div className='text-main text-l1'>{t('form.instructions')}</div>
                    <Radio.Group
                      size='small'
                      defaultValue='formatted'
                      onChange={(e) => {
                        setMdFormat(e.target.value);
                      }}
                    >
                      <Radio.Button value='formatted'>
                        <EyeOutlined />
                      </Radio.Button>
                      <Radio.Button value='code'>
                        <CodeOutlined />
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                  <div>
                    {mdFormat === 'formatted' && (
                      <div className='bg-fc-100 fc-border rounded-lg p-4 max-h-[400px] best-looking-scroll'>
                        <Markdown content={activeData?.instructions || ''} darkMode={darkMode} />
                      </div>
                    )}
                    {mdFormat === 'code' && (
                      <div className='bg-fc-100 fc-border rounded-lg p-4 max-h-[400px] best-looking-scroll'>
                        <pre className='whitespace-pre-wrap break-all'>{activeData?.instructions}</pre>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className='my-4'
                  style={{
                    borderBottom: '1px solid var(--fc-border-color)',
                  }}
                />
                {activeData?.id && <ResourcesTable id={activeData?.id} />}
                <div className='mt-4'>
                  <Collapse ghost className='skills-form-collapse skills-form-collapse-compact'>
                    <Collapse.Panel key='advanced' header={<div className='text-main text-l1'>{t('form.advanced_settings')}</div>}>
                      <Table
                        size='small'
                        showHeader={false}
                        rowKey='name'
                        dataSource={[
                          {
                            name: 'license',
                            value: activeData?.license,
                          },
                          {
                            name: 'compatibility',
                            value: activeData?.compatibility,
                          },
                          {
                            name: 'allowed_tools',
                            value: activeData?.allowed_tools,
                          },
                        ]}
                        columns={[
                          {
                            dataIndex: 'name',
                            key: 'name',
                            width: 120,
                            render: (name) => {
                              if (name === 'license') {
                                return t('form.license');
                              }
                              if (name === 'compatibility') {
                                return t('form.compatibility');
                              }
                              if (name === 'allowed_tools') {
                                return t('form.allowed_tools');
                              }
                              return name;
                            },
                          },
                          {
                            dataIndex: 'value',
                            key: 'value',
                            render: (value, record) => {
                              if (_.isEmpty(value)) {
                                return '-';
                              }
                              if (record.name === 'allowed_tools' && _.includes(value, ' ')) {
                                return _.map(_.split(value, ' '), (item) => {
                                  return <Tag key={item}>{item}</Tag>;
                                });
                              }
                              return value;
                            },
                          },
                        ]}
                        pagination={false}
                        bordered={false}
                      />
                    </Collapse.Panel>
                  </Collapse>
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </PageLayout>
      <AddModal
        visible={addModalState.visible}
        onOk={() => {
          setAddModalState({ visible: false });
          run();
        }}
        onCancel={() => {
          setAddModalState({ visible: false });
        }}
      />
      <EditModal
        visible={editModalState.visible}
        id={editModalState.id}
        onOk={() => {
          setEditModalState({ visible: false, id: undefined });
          run();
          // 更新 activeData，保持编辑后界面数据的即时更新
          if (editModalState.id) {
            getList().then((res) => {
              const newData = _.find(res, { id: editModalState.id });
              if (newData) {
                setActiveData(newData);
              }
            });
          }
        }}
        onCancel={() => {
          setEditModalState({ visible: false, id: undefined });
        }}
      />
    </>
  );
}
