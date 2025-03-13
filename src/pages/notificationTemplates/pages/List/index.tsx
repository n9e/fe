import React, { useState, useEffect } from 'react';
import { Space, Modal, Input, List } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Resizable } from 're-resizable';

import PageLayout from '@/components/pageLayout';
import { Document } from '@/components/DocumentDrawer';

import { getItems } from '../../services';
import { NS, CN } from '../../constants';
import { Item } from '../../types';
import FormModal from './FormModal';
import ItemDetail from './ItemDetail';

import './style.less';

const DOCUMENT_WIDTH_KEY = 'notification_templates_document_width';
const DEFAULT_DOCUMENT_WIDTH = 600;

export default function ListCpt() {
  const { t } = useTranslation(NS);
  const urlQuery = queryString.parse(useLocation().search);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Item[]>([]);
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
        return [];
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
    <PageLayout title={<Space>{t('title')}</Space>} icon={<NotificationOutlined />}>
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
            <div className='mt1 mb1'>
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
                    if (itemDetailRef.current) {
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
                    }
                  }}
                >
                  <div className='n9e-flex n9e-justify-between n9e-w-full'>
                    <span>{item.name}</span>
                    {item.private === 0 && (
                      <span
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
            {active?.id && (
              <ItemDetail
                ref={itemDetailRef}
                id={active?.id}
                onChange={() => {
                  fetchData();
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
              if (curWidth < DEFAULT_DOCUMENT_WIDTH) {
                curWidth = DEFAULT_DOCUMENT_WIDTH;
              }
              setWidth(curWidth);
              localStorage.setItem(DOCUMENT_WIDTH_KEY, curWidth.toString());
            }}
          >
            <div className={`${CN}-right`}>
              <Document documentPath='/docs/notification-template' />
            </div>
          </Resizable>
        </div>
      </div>
      <FormModal
        visible={formModalState.visible}
        mode={formModalState.mode}
        onOk={() => {
          fetchData();
          setFormModalState({ ...formModalState, visible: false });
        }}
        onCancel={() => {
          setFormModalState({ ...formModalState, visible: false });
        }}
      />
    </PageLayout>
  );
}
