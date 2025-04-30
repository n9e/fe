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
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { Space, Spin, Tooltip } from 'antd';
import { FullscreenOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import PageLayout, { HelpLink } from '@/components/pageLayout';

import { getEmbeddedProduct } from '../../services';
import { EmbeddedProductResponse } from '../../types';
import { adjustURL } from '../../utils';

export default function Index() {
  const { darkMode } = useContext(CommonStateContext);
  const { t } = useTranslation('embeddedDashboards');
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

          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/dashboard/integrated-dashboard/' />
        </Space>
      }
    >
      {activeRecord ? <iframe className='w-full h-full border-0' src={adjustURL(activeRecord.url, darkMode)} /> : null}
    </PageLayout>
  );
}
