import React, { useState } from 'react';
import { Space, Form, Radio } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { QueryBuilder as AliyunSLS } from 'plus:/datasource/aliyunSLS';
import { QueryBuilder as Zabbix } from 'plus:/datasource/zabbix';
import { QueryBuilder as InfluxDB } from 'plus:/datasource/influxDB';
import OrganizeFields from '../TransformationsEditor/OrganizeFields';
import DatasourceSelect from './components/DatasourceSelect';
import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';

export default function index({ chartForm, type, variableConfig, dashboardId }) {
  const { t } = useTranslation('dashboard');
  const [mode, setMode] = useState('query');

  return (
    <div>
      <Space align='start'>
        {type === 'table' && (
          <Radio.Group
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
            }}
            buttonStyle='solid'
          >
            <Radio.Button value='query'>{t('query.title')}</Radio.Button>
            <Radio.Button value='transform'>{t('query.transform')} (beta)</Radio.Button>
          </Radio.Group>
        )}
        <DatasourceSelect chartForm={chartForm} variableConfig={variableConfig} />
      </Space>
      <div
        style={{
          display: mode === 'query' ? 'block' : 'none',
        }}
      >
        <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
          {({ getFieldValue }) => {
            const cate = getFieldValue('datasourceCate') || 'prometheus';
            if (cate === 'prometheus') {
              return <Prometheus chartForm={chartForm} variableConfig={variableConfig} dashboardId={dashboardId} />;
            }
            if (cate === 'elasticsearch') {
              return <Elasticsearch chartForm={chartForm} variableConfig={variableConfig} dashboardId={dashboardId} />;
            }
            if (cate === 'aliyun-sls') {
              return <AliyunSLS chartForm={chartForm} />;
            }
            if (cate === 'zabbix') {
              return <Zabbix chartForm={chartForm} />;
            }
            if (cate === 'influxdb') {
              return <InfluxDB chartForm={chartForm} />;
            }
            return null;
          }}
        </Form.Item>
      </div>
      <div
        style={{
          display: mode === 'transform' ? 'block' : 'none',
        }}
      >
        <OrganizeFields chartForm={chartForm} />
      </div>
    </div>
  );
}
