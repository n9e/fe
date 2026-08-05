import React, { useContext, useState } from 'react';
import { Space, Form, Radio, Button, Tooltip } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { CommonStateContext } from '@/App';
import { replaceDatasourceVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';
import getFirstUnusedLetter from '@/pages/dashboard/Renderer/utils/getFirstUnusedLetter';
import type { ITarget } from '@/pages/dashboard/types';
import HideButton from '@/pages/dashboard/Components/HideButton';

import OrganizeFields from '../TransformationsEditor/OrganizeFields';
import TransformationsEditorNG from '../TransformationsEditorNG';
import QueryOptions from './QueryOptions';
import ExpressionPanel from '../Components/ExpressionPanel';
import Collapse from '../Components/Collapse';
import SingleTargetQueryEditor from './components/SingleTargetQueryEditor';
import { createDashboardQueryTarget } from './registry';
import DatasourceSelect from './components/DatasourceSelect';
import QueryBuilder from './QueryBuilder';
import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { IType } from '@/pages/dashboard/types';
import type { IVariable } from '@/pages/dashboard/Variables/types';

interface QueryEditorProps {
  panelWidth?: number;
  type: IType;
  variablesWithOptions: IVariable[];
  range: IRawTimeRange;
}

export default function index({ panelWidth, type, variablesWithOptions, range }: QueryEditorProps) {
  const { t } = useTranslation('dashboard');
  const [mode, setMode] = useState('query');
  const { datasourceList, groupedDatasourceList } = useContext(CommonStateContext);
  const form = Form.useFormInstance();
  const targets = (Form.useWatch('targets') ?? []) as ITarget[];
  const datasourceCate = Form.useWatch('datasourceCate') || DatasourceCateEnum.prometheus;
  const datasourceValue = replaceDatasourceVariables(Form.useWatch('datasourceValue'), { datasourceList });
  const isMixedDatasource = datasourceCate === 'mixed';

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
        <DatasourceSelect datasourceCate={datasourceCate} datasourceValue={datasourceValue} variablesWithOptions={variablesWithOptions} />
        <QueryOptions panelWidth={panelWidth} />
      </Space>
      <div
        style={{
          display: mode === 'query' ? 'block' : 'none',
        }}
      >
        {isMixedDatasource ? (
          <Form.List name='targets'>
            {(fields, { add, remove }, { errors }) => (
              <>
                {_.map(fields, (field) => {
                  const target = targets[field.name];
                  if (!target) return null;
                  if (target.kind === 'expression' || target.__mode__ === '__expr__') {
                    return (
                      <div className='n9e-dashboard-single-target-query-editor' key={field.key}>
                        <Collapse>
                          <ExpressionPanel fields={fields} remove={remove} field={field} />
                        </Collapse>
                      </div>
                    );
                  }

                  const datasourceValue = replaceDatasourceVariables(target.datasource?.id as number | string, {
                    datasourceList,
                  });
                  // 数据源切换时必须保持组件身份稳定，否则 Select 的 Portal 下拉层会成为无法关闭的孤儿节点。
                  const queryEditorKey = field.key;
                  return (
                    <SingleTargetQueryEditor
                      key={queryEditorKey}
                      target={target}
                      type={type}
                      panelWidth={panelWidth}
                      range={range}
                      datasourceValue={typeof datasourceValue === 'number' ? datasourceValue : undefined}
                      onChange={(nextTarget) => {
                        const nextTargets = [...(form.getFieldValue('targets') ?? [])];
                        nextTargets[field.name] = nextTarget;
                        form.setFieldsValue({ targets: nextTargets });
                      }}
                      headerActions={
                        <Space>
                          <Tooltip title={t('query.copy_query')}>
                            <CopyOutlined
                              onClick={() => {
                                add({ ...target, refId: getFirstUnusedLetter(_.map(targets, 'refId')) }, targets.length);
                              }}
                            />
                          </Tooltip>
                          <HideButton
                            value={target.hide}
                            onChange={(hide) => {
                              const nextTargets = [...(form.getFieldValue('targets') ?? [])];
                              nextTargets[field.name] = { ...target, hide };
                              form.setFieldsValue({ targets: nextTargets });
                            }}
                          />
                          {fields.length > 1 && (
                            <DeleteOutlined
                              onClick={() => {
                                remove(field.name);
                              }}
                            />
                          )}
                        </Space>
                      }
                    />
                  );
                })}
                <Form.ErrorList errors={errors} />
                <Space style={{ marginTop: 10 }}>
                  <Button
                    onClick={() => {
                      const refId = getFirstUnusedLetter(_.map(targets, 'refId'));
                      const previousQuery = _.findLast(targets, (target) => target.kind !== 'expression' && target.__mode__ !== '__expr__');
                      const cate = previousQuery?.datasource?.cate ?? DatasourceCateEnum.prometheus;
                      const datasourceId = previousQuery?.datasource?.id ?? _.find(groupedDatasourceList[cate], { is_default: true })?.id ?? groupedDatasourceList[cate]?.[0]?.id;
                      add(createDashboardQueryTarget(cate, datasourceId, refId));
                    }}
                  >
                    + {t('query.add_query_btn')}
                  </Button>
                  <Button
                    onClick={() => {
                      add({
                        kind: 'expression',
                        expression: '',
                        refId: getFirstUnusedLetter(_.map(targets, 'refId')),
                      });
                    }}
                  >
                    + {t('query.add_expression_btn')}
                  </Button>
                </Space>
              </>
            )}
          </Form.List>
        ) : (
          <QueryBuilder panelWidth={panelWidth} cate={datasourceCate} datasourceValue={datasourceValue} range={range} />
        )}
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
