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
import React, { useContext } from 'react';
import { Button, Card, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import TplForm from './tplForm';
import { CommonStateContext } from '@/App';

const Add = (props: any) => {
  const history = useHistory();
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { businessGroup } = useContext(CommonStateContext);
  const curBusiId = (query.gid as string) || businessGroup.id!;
  const { t } = useTranslation('common');
  const handleSubmit = (values: any) => {
    values.pause = _.join(values.pause, ',');
    request(`${api.tasktpls(curBusiId)}`, {
      method: 'POST',
      body: JSON.stringify(values),
    }).then(() => {
      message.success(t('msg.create.success'));
      // TODO: 这里返回列表页时需要获取参数里的 ids，不能用 history.push
      window.location.href = `/job-tpls?ids=${curBusiId}&isLeaf=true`;
    });
  };

  return (
    <PageLayout
      title={
        <>
          <RollbackOutlined className='back' onClick={() => history.push('/job-tpls')} />
          {t('tpl')}
        </>
      }
    >
      <div className='p2'>
        <Card title={t('common:btn.create')}>
          <TplForm
            bgid={_.toNumber(curBusiId)}
            onSubmit={handleSubmit}
            footer={
              <div>
                <Button type='primary' htmlType='submit' style={{ marginRight: 8 }}>
                  {t('btn.submit')}
                </Button>
              </div>
            }
          />
        </Card>
      </div>
    </PageLayout>
  );
};

export default Add;
