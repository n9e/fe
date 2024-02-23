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
import { Button, Spin, Row, Col, Card, Alert, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import { CommonStateContext } from '@/App';
import TplForm from '../taskTpl/tplForm';

const Add = (props: any) => {
  const history = useHistory();
  const query = queryString.parse(_.get(props, 'location.search'));
  const { businessGroup } = useContext(CommonStateContext);
  const curBusiId = businessGroup.id!;
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [action, setAction] = useState('');
  const handleSubmit = (values: any) => {
    if (action) {
      values.pause = _.join(values.pause, ',');
      request(api.tasks(curBusiId), {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          action,
        }),
      }).then((res) => {
        message.success(t('msg.create.success'));
        props.history.push({
          pathname: `/job-tasks/${res.dat}/result`,
        });
      });
    }
  };

  useEffect(() => {
    if (_.isPlainObject(query)) {
      if (query.tpl !== undefined) {
        setLoading(true);
        request(`${api.tasktpl(curBusiId)}/${query.tpl}`, {})
          .then((data) => {
            setData({
              ...data.dat.tpl,
              hosts: data.dat.hosts,
            });
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (query.task !== undefined) {
        setLoading(true);
        request(`${api.task(curBusiId)}/${query.task}`, {})
          .then((data) => {
            setData({
              ...data.dat.meta,
              hosts: _.map(data.dat.hosts, (host) => {
                return host.host;
              }),
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, []);

  return (
    <PageLayout
      title={
        query.tpl ? (
          <>
            <RollbackOutlined className='back' onClick={() => history.push('/job-tpls')} />
            {t('tpl')}
          </>
        ) : (
          <>
            <RollbackOutlined className='back' onClick={() => history.push('/job-tasks')} />
            {t('task')}
          </>
        )
      }
    >
      <div style={{ padding: 10 }}>
        <div style={{ background: 'none' }}>
          <Row gutter={20}>
            <Col span={18}>
              <Card title={query.tpl ? t('task.create') : query.task ? t('task.clone') : t('task.temporary.create')}>
                <Spin spinning={loading}>
                  {data || (!query.tpl && !query.task) ? (
                    <TplForm
                      type='task'
                      initialValues={data}
                      onSubmit={handleSubmit}
                      footer={
                        <div>
                          <Button
                            type='primary'
                            htmlType='submit'
                            style={{ marginRight: 10 }}
                            onClick={() => {
                              setAction('pause');
                            }}
                          >
                            {t('task.save.temporarily')}
                          </Button>
                          <Button
                            type='primary'
                            htmlType='submit'
                            onClick={() => {
                              setAction('start');
                            }}
                          >
                            {t('task.save.execute')}
                          </Button>
                        </div>
                      }
                    />
                  ) : null}
                </Spin>
              </Card>
            </Col>
            <Col span={6}>
              <Alert showIcon message={t('task.tip.title')} description={t('task.tip.content')} type='warning' />
            </Col>
          </Row>
        </div>
      </div>
    </PageLayout>
  );
};

export default Add;
