import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { Form, Select, Modal } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { IS_ENT } from '@/utils/constant';
import './index.less';
import { copy2ClipBoard } from '@/utils';
import Custom from './components/Custom';
import './locale';
import Dashboard from './components/Dashboard';
import LogExplore from './components/LogExplore';
import { formatLogExploreLink } from './components/LogRow';
import { ILogMappingParams, ILogExtract } from '@/pages/log/IndexPatterns/types';

enum Type {
  Custom,
  Dashboard,
  LogExplore,
  Trace,
}

const builtInVariables = ['__from', '__to', '__time_format__', '__local_url'];

export default function LinkBuilder({
  visible,
  onClose,
  onChange,
  vars,
  rawData,
  extracts,
  mappingParamsArr,
}: {
  visible: boolean;
  onClose: () => void;
  onChange: any;
  vars: string[];
  rawData: object;
  extracts?: ILogExtract[];
  mappingParamsArr?: ILogMappingParams[];
}) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (values.target_type === Type.Custom) {
      onChange(values.custom.url);
    } else if (values.target_type === Type.Dashboard) {
      const [start, end] = values.dashboard.range.split('|');
      const rangeStr = values.dashboard.range === 'from-to' ? `?__from=$__from&__to=$__to` : `?__from=${start}&__to=${end}`;
      const queryStr =
        values.dashboard.variables && Object.keys(values.dashboard.variables).length > 0 ? '&' + queryString.stringify(values.dashboard.variables, { encode: false }) : '';
      const fixedStr = queryStr.length > 0 ? '&__variable_value_fixed=' + values.dashboard.variable_value_fixed : '';
      const id = values.dashboard.ident || values.dashboard.boardId;
      const url = '$local_url/dashboards/' + id + rangeStr + queryStr + fixedStr;
      onChange(url);
    } else if (values.target_type === Type.LogExplore) {
      const [start, end] = values.logExplore.range.split('|');
      const range = values.logExplore.range === 'from-to' ? { start: '$__from', end: '$__to' } : { start: start, end: end };
      const url = formatLogExploreLink(values.logExplore, range as unknown as { start: number; end: number });
      onChange(url);
    }
    onClose();
  };

  return (
    <Modal width={600} bodyStyle={{ padding: 12 }} title={t('跳转链接生成器')} visible={visible} okText={t('生成')} onCancel={handleClose} onOk={handleOk}>
      <Form layout='vertical' form={form}>
        <Form.Item label={t('下钻到')} name={['target_type']} initialValue={Type.Custom}>
          <Select style={{ width: '100%' }}>
            <Select.Option value={Type.Custom}>{t('自定义链接')}</Select.Option>
            <Select.Option value={Type.Dashboard}>{t('仪表盘')}</Select.Option>
            {IS_ENT && <Select.Option value={Type.LogExplore}>{t('日志探索')}</Select.Option>}
            {IS_ENT && <Select.Option value={Type.Trace}>Trace</Select.Option>}
          </Select>
        </Form.Item>
        <Form.Item shouldUpdate={(cur, prev) => cur.target_type !== prev.target_type} noStyle>
          {({ getFieldValue }) => {
            const type = getFieldValue('target_type');
            if (type === Type.Custom) {
              return <Custom vars={[...builtInVariables, ...vars]} />;
            }
            if (type === Type.Dashboard) {
              return <Dashboard vars={vars} />;
            }
            if (type === Type.LogExplore) {
              return <LogExplore vars={vars} rawData={rawData} extracts={extracts} mappingParamsArr={mappingParamsArr} />;
            }
            return null;
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}
