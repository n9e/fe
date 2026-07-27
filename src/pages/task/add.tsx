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
import { Button, Spin, Row, Col, Card, Alert, Modal, message } from 'antd';
import { RollbackOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
  const curBusiId = (query.gid as string) || businessGroup.id!;
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [action, setAction] = useState('');
  const groupId = useRef<number>(Number(curBusiId));

  const doSubmit = (values: any) => {
    request(api.tasks(groupId.current), {
      method: 'POST',
      body: JSON.stringify({
        ...values,
        action,
      }),
    }).then((res) => {
      message.success(t('msg.create.success'));
      // 携带创建时实际使用的组 id（可能来自模板/克隆源），与列表页跳转保持一致，
      // 避免「全部」(-2) 视图下结果页用全局 businessGroup.id 请求到错误的 busi-group
      props.history.push({
        pathname: `/job-tasks/${res.dat}/result`,
        search: `gid=${groupId.current}`,
      });
    });
  };

  const handleSubmit = (values: any) => {
    if (!groupId.current) {
      message.error(t('task.error.no_group'));
      return;
    }
    if (!action) {
      return;
    }
    // 「保存立刻执行」会立即在多台机器上跑 shell，执行前二次确认（保存暂不执行不弹）
    if (action === 'start') {
      const hostCount = _.size(values.hosts);
      const scriptFirstLine = _.trim(_.head(_.split(values.script || '', '\n')) || '');
      Modal.confirm({
        title: t('task.confirm.execute.title'),
        icon: <ExclamationCircleOutlined />,
        content: (
          <div className='leading-7'>
            <div>{t('task.confirm.execute.hosts', { count: hostCount })}</div>
            <div>{t('task.confirm.execute.account', { account: values.account })}</div>
            <div className='truncate'>{t('task.confirm.execute.script', { script: scriptFirstLine })}</div>
          </div>
        ),
        okText: t('task.save.execute'),
        okButtonProps: { danger: true },
        cancelText: t('common:btn.cancel'),
        onOk: () => doSubmit(values),
      });
      return;
    }
    doSubmit(values);
  };

  useEffect(() => {
    if (_.isPlainObject(query)) {
      if (query.tpl !== undefined) {
        setLoading(true);
        request(`${api.tasktpl(curBusiId)}/${query.tpl}`, {})
          .then((data) => {
            groupId.current = data.dat.tpl.group_id;
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
            groupId.current = data.dat.group_id;
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
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/self-healing/create-temporary-task/'
    >
      <div className='p-4'>
        <div style={{ background: 'none' }}>
          <Row gutter={20}>
            <Col span={18}>
              <Card title={query.tpl ? t('task.create') : query.task ? t('task.clone') : t('task.temporary.create')}>
                <Spin spinning={loading}>
                  {data || (!query.tpl && !query.task) ? (
                    <TplForm
                      type='task'
                      bgid={groupId.current}
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
