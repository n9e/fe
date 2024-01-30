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
import { Link, useHistory } from 'react-router-dom';
import { Button, Spin, Divider, Card, Space } from 'antd';
import { RollbackOutlined, CopyOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import Editor from './editor';
import { Tpl } from './interface';
import { CommonStateContext } from '@/App';
import { copyToClipBoard } from '@/utils';

const Detail = (props: any) => {
  const history = useHistory();
  const id = _.get(props, 'match.params.id');
  const { businessGroup } = useContext(CommonStateContext);
  const curBusiId = businessGroup.id!;
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({} as Tpl);

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
        <Card title={t('common:btn.detail')}>
          <Spin spinning={loading}>
            <div className='job-task-table'>
              <div className='ant-table ant-table-default ant-table-bordered'>
                <div className='ant-table-content'>
                  <div className='ant-table-body'>
                    <table>
                      <colgroup>
                        <col style={{ width: 100, minWidth: 100 }} />
                        <col />
                      </colgroup>
                      <tbody className='ant-table-tbody'>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>{t('task.title')}</td>
                          <td>{data.title}</td>
                        </tr>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>{t('tpl.creator')}</td>
                          <td>{data.create_by}</td>
                        </tr>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>{t('tpl.last_updated')}</td>
                          <td>{moment.unix(data.update_at).format('YYYY-MM-DD HH:mm:ss')}</td>
                        </tr>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>{t('task.control.params')}</td>
                          <td>
                            {t('task.account')}：{data.account}
                            <Divider type='vertical' />
                            {t('task.batch')}：{data.batch}
                            <Divider type='vertical' />
                            {t('task.tolerance')}：{data.tolerance}
                            <Divider type='vertical' />
                            {t('task.timeout')}：{data.timeout}
                          </td>
                        </tr>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>
                            <div style={{ height: '100%' }}>{t('task.script')}</div>
                          </td>
                          <td>
                            <Editor value={data.script} readOnly height='200px' />
                          </td>
                        </tr>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>{t('task.script.args')}</td>
                          <td>{data.args}</td>
                        </tr>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>{t('task.pause')}</td>
                          <td>{data.pause}</td>
                        </tr>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>{t('task.host.list')}</td>
                          <td>
                            {_.map(data.hosts, (host) => {
                              return <div key={host}>{host}</div>;
                            })}
                          </td>
                        </tr>
                        <tr className='ant-table-row ant-table-row-level-0'>
                          <td>{t('tpl.callback')}</td>
                          <td>
                            <Space>
                              <span>{`\${ibex}/${id}`}</span>
                              <CopyOutlined
                                onClick={() => {
                                  copyToClipBoard(`\${ibex}/${id}`, (val) => val);
                                }}
                              />
                            </Space>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Link to={{ pathname: `/job-tpls/${id}/modify` }}>
                <Button type='primary' style={{ marginRight: 10 }}>
                  {t('tpl.modify')}
                </Button>
              </Link>
              <Link to={{ pathname: `/job-tpls/add/task`, search: `tpl=${id}` }}>
                <Button type='primary'>{t('tpl.create.task')}</Button>
              </Link>
            </div>
          </Spin>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Detail;
