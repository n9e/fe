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
import React, { useState, useCallback, useRef } from 'react';
import { Button } from 'antd';
import { LineChartOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import AICopilot from '@/components/AICopilot';
import Explorer from './Explorer';
import './index.less';

const MetricExplorerPage = () => {
  const { t } = useTranslation('explorer');
  const [panels, setPanels] = useState([
    {
      uuid: _.uniqueId('panel_'),
    },
  ]);
  const [copilotVisible, setCopilotVisible] = useState(false);
  const [activeDatasource, setActiveDatasource] = useState<{ cate: string; id: number }>({ cate: 'prometheus', id: 0 });
  const copilotApplyRef = useRef<((query: string) => void) | null>(null);

  const handleCopilotOpen = useCallback(() => setCopilotVisible(true), []);
  const handleCopilotClose = useCallback(() => setCopilotVisible(false), []);
  const handleDatasourceChange = useCallback((cate: string, id: number) => {
    setActiveDatasource({ cate, id });
  }, []);
  const handleApplyQuery = useCallback((query: string) => {
    if (copilotApplyRef.current) {
      copilotApplyRef.current(query);
    }
  }, []);

  return (
    <PageLayout title={t('title')} icon={<LineChartOutlined />} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v8/quickstart/ad-hoc/'>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          <div style={{ boxShadow: 'unset', background: 'unset' }}>
            <div>
              {_.map(panels, (panel, idx) => {
                return (
                  <div key={panel.uuid} className='bg-fc-100 fc-border' style={{ padding: 16, maxHeight: 650, marginBottom: 16, position: 'relative', display: 'flex' }}>
                    <Explorer tabKey={panel.uuid} type='metric' defaultCate='prometheus' panelIdx={idx} onCopilotOpen={handleCopilotOpen} copilotApplyRef={copilotApplyRef} onDatasourceChange={idx === 0 ? handleDatasourceChange : undefined} />
                    {panels.length > 1 && (
                      <CloseCircleOutlined
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          fontSize: 14,
                        }}
                        onClick={() => {
                          setPanels(_.filter(panels, (item) => item.uuid !== panel.uuid));
                        }}
                      />
                    )}
                  </div>
                );
              })}
              <Button
                style={{ width: '100%' }}
                onClick={() => {
                  setPanels([...panels, { uuid: _.uniqueId('panel_') }]);
                }}
              >
                {t('addPanel')}
              </Button>
            </div>
          </div>
        </div>
        <AICopilot visible={copilotVisible} onClose={handleCopilotClose} actionKey='query_generator' actionContext={{ datasource_type: activeDatasource.cate, datasource_id: activeDatasource.id }} onApplyQuery={handleApplyQuery} />
      </div>
    </PageLayout>
  );
};

export default MetricExplorerPage;
