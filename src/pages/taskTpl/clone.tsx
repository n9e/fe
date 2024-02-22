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
import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Spin, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import TplForm from './tplForm';
import { Tpl } from './interface';
import { CommonStateContext } from '@/App';

const Add = (props: any) => {
  const history = useHistory();
  const id = _.get(props, 'match.params.id');
  const { businessGroup } = useContext(CommonStateContext);
  const curBusiId = businessGroup.id!;
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({} as Tpl);

  const handleSubmit = (values: any) => {
    values.pause = _.join(values.pause, ',');
    request(`${api.tasktpls(values.group_id)}`, {
      method: 'POST',
      body: JSON.stringify(values),
    }).then(() => {
      message.success(t('msg.create.success'));
      props.history.push({
        pathname: `/job-tpls`,
      });
    });
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      request(`${api.tasktpl(curBusiId)}/${id}`)
        .then((data) => {
          const { dat } = data;
          setData({
            ...dat.tpl,
            hosts: dat.hosts,
            grp: dat.grp,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, curBusiId]);

  return (
    <PageLayout
      title={
        <>
          <RollbackOutlined className='back' onClick={() => history.push('/job-tpls')} />
          {t('tpl')}
        </>
      }
    >
      <div style={{ padding: 10 }}>
        <Card title={t('common:btn.clone')}>
          <Spin spinning={loading}>
            {data.title ? (
              <TplForm
                onSubmit={handleSubmit}
                initialValues={data}
                footer={
                  <div>
                    <Button type='primary' htmlType='submit' style={{ marginRight: 8 }}>
                      {t('btn.submit')}
                    </Button>
                  </div>
                }
              />
            ) : null}
          </Spin>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Add;
