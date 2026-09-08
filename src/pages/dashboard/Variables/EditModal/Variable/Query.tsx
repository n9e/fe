import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Form, Input, InputNumber, Row, Col, Switch } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import DocumentDrawer from '@/components/DocumentDrawer';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { IVariable, QueryOption } from '../../types';
import adjustData from '../../utils/ajustData';
import isPlaceholderQuoted from '../../utils/isPlaceholderQuoted';
import { formatString, formatDatasource } from '../../utils/formatString';
import processQueryOptions from '../../utils/processQueryOptions';
import { getDashboardVariablePlugin } from '../../plugins';
import { getBuiltInVariables } from '../../utils/replaceTemplateVariables';
import Querybuilder from '../Querybuilder';
import datasource from '../../datasource';
import Preview from '../Preview';

interface Props {
  formatedReg: string;
  datasourceVars: IVariable[];
  variablesWithOptions: IVariable[];
  footerExtraRef: React.RefObject<HTMLDivElement>;
}

interface DatasourceOption {
  id: number | string;
  name: string;
  plugin_type: string;
  is_default: boolean;
  isVariable?: boolean;
}

export default function Query(props: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const [range] = useGlobalState('range');
  const { datasourceCateOptions, datasourceList, darkMode } = useContext(CommonStateContext);
  const { formatedReg, datasourceVars, variablesWithOptions } = props;
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [options, setOptions] = useState<QueryOption[]>([]);
  const form = Form.useFormInstance();
  const item = Form.useWatch<IVariable>([]);
  const datasourceCate = Form.useWatch(['datasource', 'cate']);
  const capabilities = getDashboardVariablePlugin(datasourceCate)?.capabilities(item?.query);

  const service = () => {
    if (item) {
      const builtInVariables = getBuiltInVariables(range);
      const data = adjustData(_.concat(variablesWithOptions, builtInVariables), {
        datasourceList: datasourceList,
        isPlaceholderQuoted: isPlaceholderQuoted(item.definition, item.name),
        isEscapeJsonString: true,
      });
      const formatedDefinition = formatString(item.definition as string, data);
      const formatedQuery = item.query?.query ? formatString(item.query.query as string, data) : undefined;
      const datasourceValue = formatDatasource(item.datasource.value, data);

      if (!item.datasource) {
        const errMsg = 'Variable ' + item.name + ' datasource not found';
        setErrorMsg(errMsg);
        return Promise.reject(errMsg);
      }
      if (!datasourceValue) {
        const errMsg = 'Variable ' + item.name + ' datasource not found';
        setErrorMsg(errMsg);
        return Promise.reject(errMsg);
      }

      return datasource({
        datasourceCate,
        datasourceValue,
        datasourceList,
        variableContext: { variables: variablesWithOptions, query: { ...item.query, range } },
        query: {
          ...(item.query || {}),
          query: formatedDefinition || formatedQuery, // query 是标准写法
          range,
          config: item.config, // config 是 es 特有的写法
        },
      })
        .then((options) => {
          const itemOptions = processQueryOptions(options, formatedReg);
          setOptions(itemOptions);
          setErrorMsg('');
        })
        .catch((error) => {
          setOptions([]);
          setErrorMsg(error.message || 'Error fetching variable options');
        });
    }
    return Promise.resolve();
  };

  const { run, loading } = useRequest(service, {
    manual: true,
  });
  const variableDatasourceOptions: DatasourceOption[] = _.map(datasourceVars, (variable) => ({
    id: `\${${variable.name}}`,
    name: `\${${variable.name}}`,
    plugin_type: variable.definition,
    is_default: false,
    isVariable: true,
  }));
  const selectableDatasourceList: DatasourceOption[] = datasourceList;

  return (
    <>
      <Form.Item name={['datasource', 'cate']} hidden>
        <div />
      </Form.Item>
      <Form.Item
        label={t('common:datasource.id')}
        name={['datasource', 'value']}
        rules={[
          {
            required: true,
            message: t('common:datasource.id_required'),
          },
        ]}
      >
        <DatasourceSelectV3
          datasourceCateList={datasourceCateOptions}
          ajustDatasourceList={(list) => {
            return _.filter(_.concat(variableDatasourceOptions, list), (item) => {
              const cateData = _.find(datasourceCateOptions, { value: item.plugin_type });
              return cateData?.dashboard === true && cateData.dashboardVariable === true && (cateData.graphPro ? IS_PLUS : true);
            });
          }}
          onChange={(val) => {
            const cate = _.find(_.concat(variableDatasourceOptions, selectableDatasourceList), { id: val })?.plugin_type;
            form.setFieldsValue({
              datasource: {
                cate: cate,
                value: val,
              },
            });
          }}
        />
      </Form.Item>
      <Querybuilder variables={variablesWithOptions} />
      <Form.Item
        label={t('var.reg')}
        name='reg'
        tooltip={
          <>
            <div>
              <Trans
                ns='dashboard'
                i18nKey='var.reg_tip'
                components={{ a: <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions' /> }}
              />
            </div>
            <div>
              <Trans
                ns='dashboard'
                i18nKey='var.reg_tip2'
                components={{
                  a: (
                    <a
                      onClick={() => {
                        DocumentDrawer({
                          language: i18n.language,
                          darkMode,
                          title: t('common:document_link'),
                          documentPath: '/n9e-docs/dashboards/variables/named-text-and-value-capture-groups',
                        });
                      }}
                    />
                  ),
                }}
              />
            </div>
            <div>{t('var.reg_object_tip')}</div>
          </>
        }
        rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
      >
        <Input placeholder='/*.hna/' />
      </Form.Item>
      <Form.Item label={t('var.width')} name='width' tooltip={t('var.width_tip')}>
        <InputNumber min={120} placeholder='180' style={{ width: '100%' }} />
      </Form.Item>
      {(capabilities?.multi ??
        _.includes([DatasourceCateEnum.prometheus, DatasourceCateEnum.elasticsearch, DatasourceCateEnum.pgsql, DatasourceCateEnum.mysql], datasourceCate)) && (
        <Row gutter={16}>
          <Col flex='120px'>
            <Form.Item label={t('var.multi')} name='multi' valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          {item?.multi && capabilities?.all !== false ? (
            <Col flex='120px'>
              <Form.Item label={t('var.allOption')} name='allOption' valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
          ) : null}
          {item?.multi && item?.allOption && capabilities?.all !== false ? (
            <Col flex='auto'>
              <Form.Item label={t('var.allValue')} name='allValue'>
                <Input placeholder={capabilities?.allValuePlaceholder ?? (datasourceCate === DatasourceCateEnum.mysql ? '' : '.*')} />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      )}
      {createPortal(<Preview errorMsg={errorMsg} options={options} run={run} loading={loading} />, props.footerExtraRef.current!)}
    </>
  );
}
