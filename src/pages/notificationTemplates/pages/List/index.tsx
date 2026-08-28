import React, { useState, useEffect } from 'react';
import { Space, Modal, Input, List, Button } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Resizable } from 're-resizable';

import PageLayout from '@/components/pageLayout';
import { Document } from '@/components/DocumentDrawer';
import EmptyGuide from '@/components/EmptyGuide';

import { getItems } from '../../services';
import { NS, CN } from '../../constants';
import { Item } from '../../types';
import FormModal from './FormModal';
import ItemDetail from './ItemDetail';
import FieldsPanel from '../../components/FieldsPanel';

import './style.less';

const DOCUMENT_WIDTH_KEY = 'notification_templates_document_width';
const DEFAULT_DOCUMENT_WIDTH = 600;
const MIN_DOCUMENT_WIDTH = 100;

export default function ListCpt() {
  const { t } = useTranslation(NS);
  const urlQuery = queryString.parse(useLocation().search);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Item>();
  const [formModalState, setFormModalState] = useState<{
    mode: 'add';
    visible: boolean;
  }>({
    mode: 'add',
    visible: false,
  });
  const itemDetailRef = React.useRef<any>();
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem(DOCUMENT_WIDTH_KEY) || DEFAULT_DOCUMENT_WIDTH));

  const fetchData = () => {
    return getItems()
      .then((res) => {
        setData(res);
        return res;
      })
      .catch(() => {
        setData([]);
        return [] as Item[];
      })
      .finally(() => {
        setLoaded(true);
      });
  };

  useEffect(() => {
    fetchData().then((res) => {
      if (urlQuery.id) {
        const item = _.find(res, { id: _.toNumber(urlQuery.id) });
        if (item) {
          setActive(item);
        } else {
          setActive(res[0]);
        }
      } else {
        setActive(res[0]);
      }
    });
  }, []);

  return (
    <PageLayout
      title={<Space>{t('title')}</Space>}
      icon={<NotificationOutlined />}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/msg-template/notification-templates/'
    >
      <div className='n9e'>
        <div className={CN}>
          <div className={`${CN}-sidebar`}>
            <div className={`${CN}-sidebar-header`}>
              {t('title')}
              <a
                onClick={() => {
                  setFormModalState({ mode: 'add', visible: true });
                }}
              >
                {t('common:btn.add')}
              </a>
            </div>
            <div className='mt-2 mb-2'>
              <Input
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>

            <List
              className={`${CN}-sidebar-list`}
              dataSource={_.filter(data, (item) => {
                return _.upperCase(item.name).indexOf(_.upperCase(search)) > -1;
              })}
              size='small'
              renderItem={(item: any) => (
                <List.Item
                  key={item.id}
                  className={active?.id === item.id ? 'is-active' : ''}
                  onClick={() => {
                    // ref 为空说明右侧还没有挂载任何模板详情（例如刚建完第一个模板），
                    // 此前这里没有 else 分支，点击直接变成空操作，用户以为页面卡死
                    if (!itemDetailRef.current) {
                      setActive(item);
                      return;
                    }
                    const savedState = itemDetailRef.current.getSavedState();
                    if (savedState) {
                      setActive(item);
                    } else {
                      Modal.confirm({
                        title: t('content.prompt'),
                        onOk: () => {
                          setActive(item);
                        },
                      });
                    }
                  }}
                >
                  <div className='flex justify-between w-full gap-1 leading-[1.2]'>
                    <span className='break-all'>{item.name}</span>
                    {item.private === 0 && (
                      <span
                        className='shrink-0'
                        style={{
                          color: 'var(--fc-text-5)',
                        }}
                      >
                        {t('common:public')}
                      </span>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </div>
          <div className={`${CN}-main`}>
            {/* 一条模板都没有时中间栏此前是一片空白，新人看不出下一步该做什么。
                必须等首次加载结束再判空，否则加载期会闪一下「还没有模板」 */}
            {loaded && _.isEmpty(data) && (
              <EmptyGuide
                className='h-full flex flex-col justify-center'
                title={t('empty_guide.title')}
                description={t('empty_guide.desc')}
                actions={
                  <Button
                    type='primary'
                    onClick={() => {
                      setFormModalState({ mode: 'add', visible: true });
                    }}
                  >
                    {t('common:btn.add')}
                  </Button>
                }
              />
            )}
            {active?.id && (
              <ItemDetail
                ref={itemDetailRef}
                id={active?.id}
                onChange={(createdIdent) => {
                  // 克隆出来的新模板同样要选中，否则用户停在原模板上以为没生效
                  fetchData().then((res) => {
                    if (createdIdent) {
                      const created = _.find(res, { ident: createdIdent });
                      if (created) {
                        setActive(created);
                      }
                    }
                  });
                }}
                onDelete={() => {
                  fetchData().then((res) => {
                    setActive(res[0]);
                  });
                }}
              />
            )}
          </div>
          <Resizable
            size={{ width, height: '100%' }}
            enable={{
              left: true,
            }}
            onResizeStop={(e, direction, ref, d) => {
              let curWidth = width + d.width;
              if (curWidth < MIN_DOCUMENT_WIDTH) {
                curWidth = MIN_DOCUMENT_WIDTH;
              }
              setWidth(curWidth);
              localStorage.setItem(DOCUMENT_WIDTH_KEY, curWidth.toString());
            }}
          >
            {/* 字段面板放在文档之前：找字段是这一栏最高频的用途，
                而文档里的字段表既不能搜也不能复制 */}
            <div className={`${CN}-right`}>
              <div className='flex h-full min-h-0 flex-col'>
                {/* 字段行比原来的芯片高，且删掉字段表格后文档短了一多半，
                    这里把空间向字段面板倾斜 */}
                <div className='flex min-h-0 flex-none flex-col' style={{ maxHeight: '62%' }}>
                  <FieldsPanel />
                </div>
                <div className='my-3 h-px flex-none bg-fc-300' />
                <div className='min-h-0 flex-1 best-looking-scroll'>
                  <Document documentPath='/n9e-docs/notification-template' />
                </div>
              </div>
            </div>
          </Resizable>
        </div>
      </div>
      <FormModal
        visible={formModalState.visible}
        mode={formModalState.mode}
        onOk={(createdIdent) => {
          // 新建后必须选中这条，否则中间栏保持空白，用户不知道模板建到哪去了
          fetchData().then((res) => {
            if (createdIdent) {
              const created = _.find(res, { ident: createdIdent });
              if (created) {
                setActive(created);
              }
            }
          });
          setFormModalState({ ...formModalState, visible: false });
        }}
        onCancel={() => {
          setFormModalState({ ...formModalState, visible: false });
        }}
      />
    </PageLayout>
  );
}
