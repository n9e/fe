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
import React, { useEffect, useState } from 'react';
import { Drawer, Segmented, Spin } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import request from '@/utils/request';
import api from '@/utils/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  busiId: number;
  taskId: string;
  host?: string;
  outputType: 'stdout' | 'stderr';
  title: string;
}

const sizeWidthMap = {
  small: '35%',
  middle: '55%',
  large: '75%',
};

type SizeType = 'small' | 'middle' | 'large';

export default function OutputDrawer(props: Props) {
  const { t } = useTranslation('navigableDrawer');
  const { visible, onClose, busiId, taskId, host, outputType, title } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [size, setSize] = useState<SizeType>('middle');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const url = host ? `${api.task(busiId)}/${taskId}/host/${host}/${outputType}` : `${api.task(busiId)}/${taskId}/${outputType}`;
    request(url)
      .then((res) => {
        setData(res.dat);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [visible, busiId, taskId, host, outputType]);

  const getOutput = () => {
    if (!data) return '';
    if (host) {
      return `${host}\n${data}\n\n`;
    }
    let output = '';
    _.each(data, (item: any) => {
      output += `${item.host}\n`;
      output += `${item[outputType]}\n\n`;
    });
    return output;
  };

  return (
    <Drawer
      width={sizeWidthMap[size]}
      title={title}
      placement='right'
      onClose={onClose}
      visible={visible}
      extra={
        <Segmented
          options={[
            { label: t('size.small'), value: 'small' },
            { label: t('size.middle'), value: 'middle' },
            { label: t('size.large'), value: 'large' },
          ]}
          value={size}
          onChange={(value) => setSize(value as SizeType)}
        />
      }
    >
      <Spin spinning={loading}>
        <pre style={{ fontSize: 12, padding: 10 }}>{getOutput()}</pre>
      </Spin>
    </Drawer>
  );
}
