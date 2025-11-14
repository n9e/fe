import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Form, Input, Row, Col, Switch } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import DocumentDrawer from '@/components/DocumentDrawer';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { IVariable } from '../../types';
import adjustData from '../../utils/ajustData';
import isPlaceholderQuoted from '../../utils/isPlaceholderQuoted';
import { formatString, formatDatasource } from '../../utils/formatString';
import filterOptionsByReg from '../../utils/filterOptionsByReg';
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

export default function Query(props: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const [range] = useGlobalState('range');
  const { datasourceCateOptions, datasourceList, darkMode } = useContext(CommonStateContext);
  const { formatedReg, datasourceVars, variablesWithOptions } = props;
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [options, setOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const form = Form.useFormInstance();
  const item = Form.useWatch<IVariable>([]);
  const datasourceCate = Form.useWatch(['datasource', 'cate']);

  const service = () => {
    if (item) {
      const builtInVariables = getBuiltInVariables({
        range,
      });
      const data = adjustData(_.concat(variablesWithOptions, builtInVariables), {
        datasourceList: datasourceList,
        isPlaceholderQuoted: isPlaceholderQuoted(item.definition, item.name),
        isEscapeJsonString: true,
      });
      const formatedDefinition = formatString(item.definition, data);
      const formatedQuery = item.query?.query ? formatString(item.query.query, data) : undefined;
      const datasourceValue = formatDatasource(item.datasource.value as any, data);

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
        query: {
          ...(item.query || {}),
          query: formatedDefinition || formatedQuery, // query 是标准写法
          range,
          config: item.config, // config 是 es 特有的写法
        },
      })
        .then((options) => {
          const itemOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), formatedReg), 'value');
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
            return _.filter(
              _.concat(
                _.map(datasourceVars, (item) => {
                  return {
                    id: `\${${item.name}}`,
                    name: `\${${item.name}}`,
                    plugin_type: item.definition,
                  };
                }),
                list as any,
              ),
              (item) => {
                const cateData = _.find(datasourceCateOptions, { value: item.plugin_type });
                return cateData?.dashboard === true && cateData.dashboardVariable === true && (cateData.graphPro ? IS_PLUS : true);
              },
            );
          }}
          onChange={(val) => {
            const cate = _.find(
              _.concat(
                _.map(datasourceVars, (item) => {
                  return {
                    id: `\${${item.name}}`,
                    name: `\${${item.name}}`,
                    plugin_type: item.definition,
                  };
                }),
                datasourceList as any,
              ),
              { id: val },
            )?.plugin_type;
            form.setFieldsValue({
              datasource: {
                cate: cate,
                value: val,
              },
            });
          }}
        />
      </Form.Item>
      <Querybuilder />
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
                          documentPath: '/docs/dashboards/variables/named-text-and-value-capture-groups',
                        });
                      }}
                    />
                  ),
                }}
              />
            </div>
          </>
        }
        rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
      >
        <Input placeholder='/*.hna/' />
      </Form.Item>
      {_.includes([DatasourceCateEnum.prometheus, DatasourceCateEnum.elasticsearch, DatasourceCateEnum.pgsql], datasourceCate) && (
        <Row gutter={16}>
          <Col flex='120px'>
            <Form.Item label={t('var.multi')} name='multi' valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          {item?.multi ? (
            <Col flex='120px'>
              <Form.Item label={t('var.allOption')} name='allOption' valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
          ) : null}
          {item?.multi && item?.allOption ? (
            <Col flex='auto'>
              <Form.Item label={t('var.allValue')} name='allValue'>
                <Input placeholder='.*' />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      )}
      {createPortal(<Preview errorMsg={errorMsg} options={options} run={run} loading={loading} />, props.footerExtraRef.current!)}
    </>
  );
}
