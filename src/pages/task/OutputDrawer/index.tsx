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
import React, { useEffect, useMemo, useState } from 'react';
import { Drawer, Segmented, Spin, Input, Switch, Button, Space } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { useDebounce } from 'ahooks';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import request from '@/utils/request';
import api from '@/utils/api';
import { copyToClipBoard, download } from '@/utils';

interface Props {
  visible: boolean;
  onClose: () => void;
  busiId: number;
  taskId: string;
  host?: string;
  outputType: 'stdout' | 'stderr';
  title: string;
  onOutputClose?: (info: { outputType: 'stdout' | 'stderr'; host?: string }) => void;
}

const sizeWidthMap = {
  small: '35%',
  middle: '55%',
  large: '75%',
};

type SizeType = 'small' | 'middle' | 'large';

export default function OutputDrawer(props: Props) {
  const { t } = useTranslation('navigableDrawer');
  const { t: tsh } = useTranslation('alertSelfHealing');
  const { visible, onClose, busiId, taskId, host, outputType, title, onOutputClose } = props;

  const handleClose = () => {
    onOutputClose?.({ outputType, host });
    onClose();
  };
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [size, setSize] = useState<SizeType>('middle');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, { wait: 300 });
  const [wrap, setWrap] = useState(true);

  useEffect(() => {
    if (!visible) return;
    // 抽屉复用同一实例、只切 visible，重新拉取前先清空上一台主机的数据与搜索词。
    // stale 守卫：主机 A 响应慢、切到主机 B 时，A 的迟到响应不再覆盖 B 的数据
    let stale = false;
    setData(null);
    setSearch('');
    setLoading(true);
    const url = host ? `${api.task(busiId)}/${taskId}/host/${host}/${outputType}` : `${api.task(busiId)}/${taskId}/${outputType}`;
    request(url)
      .then((res) => {
        if (!stale) setData(res.dat);
      })
      .catch(() => {
        if (!stale) setData(null);
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [visible, busiId, taskId, host, outputType]);

  // 「全部主机」模式下输出可达数 MB，缓存拼接结果，避免每次渲染 / 每敲一键都全量重拼
  const fullOutput = useMemo(() => {
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
  }, [data, host, outputType]);

  // 搜索按行过滤（类 grep），用防抖后的关键词并缓存结果，关键词小写只算一次
  const displayed = useMemo(() => {
    if (!debouncedSearch) return fullOutput;
    const kw = _.toLower(debouncedSearch);
    return _.filter(_.split(fullOutput, '\n'), (line) => _.includes(_.toLower(line), kw)).join('\n');
  }, [fullOutput, debouncedSearch]);

  // 复用仓库的 copyToClipBoard（基于 execCommand，纯 HTTP 内网也可用，且自带成功/失败提示）
  const handleCopy = () => {
    copyToClipBoard(fullOutput);
  };

  // 复用仓库的 download（appendChild 后 click、不做同步 revoke，Firefox/Safari 下更稳）
  const handleDownload = () => {
    download(fullOutput, `${_.replace(title, /[\\/:*?"<>|\s]+/g, '_') || 'output'}.log`);
  };

  return (
    <Drawer
      width={sizeWidthMap[size]}
      title={title}
      placement='right'
      onClose={handleClose}
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
        <div className='mb-2 flex flex-wrap items-center gap-3'>
          <Input.Search allowClear placeholder={tsh('result.search_output')} className='w-[240px]' value={search} onChange={(e) => setSearch(e.target.value)} />
          <Space size={4}>
            <Switch size='small' checked={wrap} onChange={setWrap} />
            <span className='text-soft text-[12px]'>{tsh('result.wrap')}</span>
          </Space>
          <Button size='small' icon={<CopyOutlined />} onClick={handleCopy}>
            {tsh('result.copy')}
          </Button>
          <Button size='small' icon={<DownloadOutlined />} onClick={handleDownload}>
            {tsh('result.download')}
          </Button>
        </div>
        <pre
          style={{
            fontSize: 12,
            padding: 10,
            whiteSpace: wrap ? 'pre-wrap' : 'pre',
            wordBreak: wrap ? 'break-all' : 'normal',
            overflowX: wrap ? 'hidden' : 'auto',
          }}
        >
          {displayed}
        </pre>
      </Spin>
    </Drawer>
  );
}
