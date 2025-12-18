import React, { useContext, useState } from 'react';
import { Space, Form, Radio } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { CommonStateContext } from '@/App';
import { replaceDatasourceVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import OrganizeFields from '../TransformationsEditor/OrganizeFields';
import TransformationsEditorNG from '../TransformationsEditorNG';
import DatasourceSelect from './components/DatasourceSelect';
import QueryBuilder from './QueryBuilder';
import QueryOptions from './QueryOptions';

export default function index({ panelWidth, type, variablesWithOptions, range }) {
  const { t } = useTranslation('dashboard');
  const [mode, setMode] = useState('query');
  const { datasourceList } = useContext(CommonStateContext);
  const cate = Form.useWatch('datasourceCate') || DatasourceCateEnum.prometheus;
  let datasourceValue = Form.useWatch('datasourceValue');
  datasourceValue = replaceDatasourceVariables(datasourceValue, {
    datasourceList,
  });

  return (
    <div>
      <Space align='start'>
        {_.includes(['table', 'tableNG'], type) && (
          <Radio.Group
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
            }}
            buttonStyle='solid'
          >
            <Radio.Button value='query'>{t('query.title')}</Radio.Button>
            {type === 'table' && <Radio.Button value='transform'>{t('query.transform')} (beta)</Radio.Button>}
            {type === 'tableNG' && <Radio.Button value='transformNG'>{t('query.transform')} (beta)</Radio.Button>}
          </Radio.Group>
        )}
        <DatasourceSelect datasourceValue={datasourceValue} variablesWithOptions={variablesWithOptions} />
        <QueryOptions panelWidth={panelWidth} />
      </Space>
      <div
        style={{
          display: mode === 'query' ? 'block' : 'none',
        }}
      >
        <QueryBuilder panelWidth={panelWidth} cate={cate} datasourceValue={datasourceValue} range={range} />
      </div>
      {mode === 'transform' && <OrganizeFields />}
      <div
        style={{
          display: mode === 'transformNG' ? 'block' : 'none',
        }}
      >
        <TransformationsEditorNG />
      </div>
    </div>
  );
}
