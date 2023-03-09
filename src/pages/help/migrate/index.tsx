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
import React from 'react';
import { Tabs } from 'antd';
import { RetweetOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import Dashboard from './Dashboard';

const { TabPane } = Tabs;

export default function Migrate() {
  return (
    <PageLayout
      title={
        <>
          <RetweetOutlined /> 管理员迁移
        </>
      }
    >
      <div>
        <div style={{ padding: 20 }}>
          <Tabs defaultActiveKey='boards'>
            <TabPane tab='大盘迁移' key='boards'>
              <Dashboard />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
