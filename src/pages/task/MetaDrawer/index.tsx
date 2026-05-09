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
import { Drawer, Divider, Button, Segmented, Spin } from 'antd';
import { Link } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import Editor from '../../taskTpl/editor';

interface Props {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  data: any;
  hosts: { host: string }[];
  taskId: string;
}

const sizeWidthMap = {
  small: '35%',
  middle: '55%',
  large: '75%',
};

type SizeType = 'small' | 'middle' | 'large';

export default function MetaDrawer(props: Props) {
  const { t } = useTranslation('common');
  const { t: tn } = useTranslation('navigableDrawer');
  const { visible, loading, onClose, data, hosts, taskId } = props;
  const [size, setSize] = useState<SizeType>('middle');

  return (
    <Drawer
      width={sizeWidthMap[size]}
      title={data?.title || t('task.meta')}
      placement='right'
      onClose={onClose}
      visible={visible}
      extra={
        <Segmented
          options={[
            { label: tn('size.small'), value: 'small' },
            { label: tn('size.middle'), value: 'middle' },
            { label: tn('size.large'), value: 'large' },
          ]}
          value={size}
          onChange={(value) => setSize(value as SizeType)}
        />
      }
      footer={
        <Link to={{ pathname: '/job-tasks/add', search: `task=${taskId}` }}>
          <Button type='primary'>{t('task.clone.new')}</Button>
        </Link>
      }
    >
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
                      <td>{data?.title}</td>
                    </tr>
                    <tr className='ant-table-row ant-table-row-level-0'>
                      <td>{t('task.creator')}</td>
                      <td>
                        {data?.creator} @ {data?.created ? moment(data.created).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </td>
                    </tr>
                    <tr className='ant-table-row ant-table-row-level-0'>
                      <td>{t('task.control.params')}</td>
                      <td>
                        {t('task.account')}：{data?.account}
                        <Divider type='vertical' />
                        {t('task.batch')}：{data?.batch}
                        <Divider type='vertical' />
                        {t('task.tolerance')}：{data?.tolerance}
                        <Divider type='vertical' />
                        {t('task.timeout')}：{data?.timeout}
                      </td>
                    </tr>
                    <tr className='ant-table-row ant-table-row-level-0'>
                      <td>{t('task.script')}</td>
                      <td>{data?.script ? <Editor value={data.script} readOnly height='200px' /> : '-'}</td>
                    </tr>
                    <tr className='ant-table-row ant-table-row-level-0'>
                      <td>{t('task.script.args')}</td>
                      <td>{data?.args}</td>
                    </tr>
                    <tr className='ant-table-row ant-table-row-level-0'>
                      <td>{t('task.pause')}</td>
                      <td>{data?.pause}</td>
                    </tr>
                    <tr className='ant-table-row ant-table-row-level-0'>
                      <td>{t('task.host.list')}</td>
                      <td>
                        {_.map(hosts, (hostItem) => {
                          return <div key={hostItem.host}>{hostItem.host}</div>;
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </Drawer>
  );
}
