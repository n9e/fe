import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button, Tag, Empty, Dropdown, Menu, Space, Switch, Radio, Upload, Modal, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import Markdown from '@/components/Markdown';

import { NS } from '../constants';
import { Item, getList, importItem, putItem, deleteItem } from '../services';
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

  if (_.isEmpty(data)) {
    return (
      <>
        <PageLayout title={t('title')}>
          <div className='fc-page n9e'>
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
                          action='/api/n9e/ai-skills/import'
                          showUploadList={false}
                          accept='.md'
                          customRequest={(options) => {
                            const { file } = options;
                            try {
                              importItem(file as File).then((result: any) => {
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
        <div className='fc-page n9e flex gap-4'>
          <div className='fc-toolbar w-[240px] flex-shrink-0 flex flex-col'>
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
                        accept='.md'
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
            <div className='bg-fc-100 fc-border rounded h-full min-h-0 p-2 best-looking-scroll'>
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
          <div className='w-full min-w-0 p-2 best-looking-scroll'>
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
                <Button
                  size='small'
                  type='text'
                  icon={<EditOutlined />}
                  onClick={() => {
                    if (activeData?.id) {
                      console.log('activeData', activeData);
                      setEditModalState({
                        id: activeData?.id,
                        visible: true,
                      });
                    }
                  }}
                />
                <Button
                  size='small'
                  type='text'
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    if (activeData) {
                      Modal.confirm({
                        title: t('common:confirm.delete'),
                        onOk: () => {
                          deleteItem(activeData.id).then(() => {
                            message.success(t('common:success.delete'));
                            run();
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
                  <div className='bg-fc-100 fc-border rounded p-4 max-h-[400px] best-looking-scroll'>
                    <Markdown content={activeData?.instructions || ''} darkMode={darkMode} />
                  </div>
                )}
                {mdFormat === 'code' && (
                  <div className='bg-fc-100 fc-border rounded p-4 max-h-[400px] best-looking-scroll'>
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
