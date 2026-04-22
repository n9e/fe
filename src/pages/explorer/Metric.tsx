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
import { useAiChatContext } from '@/components/AiChatNG';

import Explorer from './Explorer';
import './index.less';

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
                <div key={panel.uuid} className='bg-fc-100 fc-border rounded-lg p-4 max-h-[650px] mb-4 relative flex'>
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
        </div>
      </div>
    </PageLayout>
  );
}

const MetricExplorerPage = () => {
  return <MetricExplorerPageContent />;
};

export default MetricExplorerPage;
