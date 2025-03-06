import React, { useState, useEffect } from 'react';
import { Space, Modal, Input, List } from 'antd';
import { NotificationOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';
import { Document } from '@/components/DocumentDrawer';

import { getItems } from '../../services';
import { NS, CN } from '../../constants';
import { Item } from '../../types';
import FormModal from './FormModal';
import ItemDetail from './ItemDetail';

import './style.less';

export default function ListCpt() {
  const { t } = useTranslation(NS);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<Item[]>([]);
  const [active, setActive] = useState<Item>();
  const itemDetailRef = React.useRef<any>();

  const fetchData = (useHeadSetActive = false) => {
    getItems()
      .then((res) => {
        setData(res);
        if (res.length > 0 && useHeadSetActive) {
          setActive(res[0]);
        }
      })
      .catch(() => {
        setData([]);
      });
  };

  useEffect(() => {
    fetchData(true);
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
                  FormModal({ mode: 'add', onOk: () => fetchData() });
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
                  fetchData(true);
                }}
              />
            )}
          </div>
          <div className={`${CN}-right`}>
            <Document documentPath='/docs/notification-template' />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
