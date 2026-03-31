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
import React, { useState } from 'react';
import { Button } from 'antd';
import { LineChartOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import PageLayout from '@/components/pageLayout';
import AiChat, { AiChatProvider, IAiChatMessage, IAiChatMessageResponse, useAiChatContext } from '@/components/AiChatNG';
import PromQLCard from '@/components/AiChatNG/customContentRenderer/PromQLCard';

import Explorer from './Explorer';
import './index.less';

function MetricExplorerAiChatSidebar() {
  const { visible, datasourceCate, datasourceValue, callbackParams, closeAiChat } = useAiChatContext();

  if (!visible) {
    return null;
  }

  return (
    <div className='ml-4 w-[420px] flex-shrink-0 bg-fc-100 fc-border h-full rounded-lg p-4'>
      <AiChat
        key={String(callbackParams?.openedAt ?? '')}
        showClose
        onClose={closeAiChat}
        queryPageFrom={{
          page: 'explorer',
        }}
        queryAction={{
          key: 'query_generator',
          param: {
            datasource_type: datasourceCate,
            datasource_id: datasourceValue,
          },
        }}
        promptList={['帮我生成一条 CPU 使用率查询', '解释当前查询语句', '给我一个 Prometheus 排障建议']}
        customContentRenderer={({ response, message }: { response: IAiChatMessageResponse; message: IAiChatMessage }) => {
          if (response.content_type === 'query') {
            return (
              <PromQLCard
                response={response}
                message={message}
                onExecuteQuery={(promql) => {
                  const onExecuteQuery = callbackParams?.onExecuteQuery as ((value: string) => void) | undefined;
                  onExecuteQuery?.(promql);
                }}
              />
            );
          }
          return null;
        }}
      />
    </div>
  );
}

function MetricExplorerPageContent() {
  const { t } = useTranslation('explorer');
  const { callbackParams, closeAiChat } = useAiChatContext();
  const [panels, setPanels] = useState([
    {
      uuid: _.uniqueId('panel_'),
    },
  ]);

  return (
    <PageLayout title={t('title')} icon={<LineChartOutlined />} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v8/quickstart/ad-hoc/'>
      <div className='n9e'>
        <div className='w-full h-full flex'>
          <div className='flex-1 min-w-0 h-full best-looking-scroll'>
            {_.map(panels, (panel, idx) => {
              return (
                <div key={panel.uuid} className='bg-fc-100 fc-border p-4 mb-4 relative flex max-h-[650px]'>
                  <Explorer tabKey={panel.uuid} type='metric' defaultCate='prometheus' panelIdx={idx} />
                  {panels.length > 1 && (
                    <CloseCircleOutlined
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        fontSize: 14,
                      }}
                      onClick={() => {
                        if (callbackParams?.panelKey === panel.uuid) {
                          closeAiChat();
                        }
                        setPanels(_.filter(panels, (item) => item.uuid !== panel.uuid));
                      }}
                    />
                  )}
                </div>
              );
            })}
            <Button
              className='w-full mb-4'
              onClick={() => {
                setPanels([...panels, { uuid: _.uniqueId('panel_') }]);
              }}
            >
              {t('addPanel')}
            </Button>
          </div>
          <MetricExplorerAiChatSidebar />
        </div>
      </div>
    </PageLayout>
  );
}

const MetricExplorerPage = () => {
  return (
    <AiChatProvider>
      <MetricExplorerPageContent />
    </AiChatProvider>
  );
};

export default MetricExplorerPage;
