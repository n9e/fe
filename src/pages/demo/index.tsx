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
import { Card } from 'antd';

import './style.less';

import AiChat, { IAiChatMessage, IAiChatMessageResponse } from '@/components/AiChat';
import PromQLCard from '@/components/AiChat/customContentRenderer/PromQLCard';

export default function Demo() {
  return (
    <div className='p-6'>
      <Card bordered={false} className='rounded-lg'>
        <div className='h-[800px]'>
          <AiChat
            // className='flex h-full min-h-0 flex-col'
            queryPageFrom={{
              page: 'explorer',
            }}
            queryAction={{
              key: 'query_generator',
              param: {
                datasource_type: 'prometheus',
                datasource_id: 849,
              },
            }}
            // promptList={['帮我生成一条 CPU 使用率查询', '解释当前查询语句', '给我一个 Prometheus 排障建议']}
            customContentRenderer={({ response, message }: { response: IAiChatMessageResponse; message: IAiChatMessage }) => {
              console.log('response', response);
              if (response.content_type === 'query') {
                return (
                  <PromQLCard
                    response={response}
                    message={message}
                    onExecuteQuery={(promql) => {
                      console.log('执行的 promql: ', promql);
                    }}
                  />
                );
              }
              return null;
            }}
          />
        </div>
      </Card>
    </div>
  );
}
