import React, { useContext, useState } from 'react';
import { Space, Form, Radio } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { CommonStateContext } from '@/App';
import { replaceExpressionVars } from '@/pages/dashboard/VariableConfig/constant';

import OrganizeFields from '../TransformationsEditor/OrganizeFields';
import DatasourceSelect from './components/DatasourceSelect';
import QueryBuilder from './QueryBuilder';

export default function index({ chartForm, type, variableConfig, dashboardId, time }) {
  const { t } = useTranslation('dashboard');
  const [mode, setMode] = useState('query');
  const { datasourceList } = useContext(CommonStateContext);
  const cate = Form.useWatch('datasourceCate') || DatasourceCateEnum.prometheus;
  let datasourceValue = Form.useWatch('datasourceValue');
  datasourceValue = variableConfig
    ? replaceExpressionVars({
        text: datasourceValue,
        variables: variableConfig,
        limit: variableConfig.length,
        dashboardId,
        datasourceList,
      })
    : datasourceValue;

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
        <DatasourceSelect dashboardId={dashboardId} chartForm={chartForm} variableConfig={variableConfig} />
      </Space>
      <div
        style={{
          display: mode === 'query' ? 'block' : 'none',
        }}
      >
        <QueryBuilder cate={cate} datasourceValue={datasourceValue} variables={variableConfig} dashboardId={dashboardId} time={time} />
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
