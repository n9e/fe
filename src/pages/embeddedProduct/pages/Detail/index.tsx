import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { Space, Spin, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';

import { NS } from '../../constants';
import { getEmbeddedProduct } from '../../services';
import { EmbeddedProductResponse } from '../../types';
import { adjustURL } from '../../utils';

export default function Index() {
  const { darkMode } = useContext(CommonStateContext);
  const { t } = useTranslation(NS);
  const history = useHistory();
  const location = useLocation();
  const { id: paramId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<EmbeddedProductResponse | undefined>();
  const [activeRecord, setActiveRecord] = useState<EmbeddedProductResponse | undefined>();
  const isClickTrigger = useRef(false);

  useEffect(() => {
    if (paramId) {
      if (data && data.id === Number(paramId)) {
        setActiveRecord(data);
      } else {
        setActiveRecord(undefined);
      }
    }
  }, [data, paramId]);

  useEffect(() => {
    setLoading(true);
    getEmbeddedProduct(paramId)
      .then((res) => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paramId]);

  if (loading) {
    return (
      <Spin spinning={loading}>
        <div style={{ width: 100, height: 100 }} />
      </Spin>
    );
  }

  return (
    <PageLayout
      title={
        <Space>
          <span>{activeRecord ? activeRecord.name : t('title')}</span>
          <Space size={16}>
            <Tooltip title={t('exitFullScreen_tip')}>
              <FullscreenOutlined
                style={{ margin: 0 }}
                onClick={() => {
                  isClickTrigger.current = true;
                  history.push({
                    pathname: location.pathname,
                    search: queryString.stringify({
                      viewMode: 'fullscreen',
                    }),
                  });
                }}
              />
            </Tooltip>
          </Space>
        </Space>
      }
    >
      {activeRecord ? <iframe className='w-full h-full border-0' src={adjustURL(activeRecord.url, darkMode)} /> : null}
    </PageLayout>
  );
}
