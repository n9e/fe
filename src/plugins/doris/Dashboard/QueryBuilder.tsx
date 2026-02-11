import React from 'react';
import { Form, Radio, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import Collapse, { Panel } from '@/pages/dashboard/Editor/Components/Collapse';
import { alphabet } from '@/utils/constant';
import ExpressionPanel from '@/pages/dashboard/Editor/Components/ExpressionPanel';
import AddQueryButtons from '@/pages/dashboard/Editor/Components/AddQueryButtons';
import QueryExtraActions from '@/pages/dashboard/Components/QueryExtraActions';

import { NAME_SPACE } from '../constants';
import QueryStringBuilder from './QueryStringBuilder';
import SQLBuilder from './SQLBuilder';

import './style.less';

export default function DorisQueryBuilder({ datasourceValue }) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const type = Form.useWatch('type');
  const targets = Form.useWatch('targets');

  if (!type) return null;

  return (
    <>
      <Form.List name='targets'>
        {(fields, { add, remove }, { errors }) => {
          return (
            <>
              <Collapse>
                {_.map(fields, (field, index) => {
                  const prefixName = ['targets', field.name];
                  const mode = _.get(targets, [field.name, 'query', 'mode']);
                  const queryStrategy = _.get(targets, [field.name, 'query', 'queryStrategy']);
                  const { __mode__ } = targets?.[field.name] || {};
                  if (__mode__ === '__expr__') {
                    return <ExpressionPanel key={field.key} fields={fields} remove={remove} field={field} />;
                  }
                  return (
                    <Panel
                      header={
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => {
                            return getFieldValue([...prefixName, 'refId']) || alphabet[index];
                          }}
                        </Form.Item>
                      }
                      key={field.key}
                      extra={
                        <Space>
                          <QueryExtraActions field={field} add={add} />
                          {fields.length > 1 ? (
                            <DeleteOutlined
                              onClick={() => {
                                remove(field.name);
                              }}
                            />
                          ) : null}
                        </Space>
                      }
                    >
                      <Form.Item noStyle {...field} name={[field.name, 'refId']}>
                        <div />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'query', 'queryStrategy']} initialValue='sql'>
                        <Radio.Group
                          options={[
                            // {
                            //   label: t('query.mode.query'),
                            //   value: 'query',
                            // },
                            {
                              label: t('query.mode.sql'),
                              value: 'sql',
                            },
                          ]}
                          optionType='button'
                          buttonStyle='solid'
                        />
                      </Form.Item>
                      {queryStrategy === 'query' && <QueryStringBuilder field={field} datasourceValue={datasourceValue} />}
                      {queryStrategy === 'sql' && <SQLBuilder field={field} datasourceValue={datasourceValue} mode={mode} />}
                    </Panel>
                  );
                })}

                <Form.ErrorList errors={errors} />
              </Collapse>
              <AddQueryButtons
                add={add}
                addQuery={(newRefId) => {
                  add({
                    query: {
                      query: '',
                    },
                    refId: newRefId,
                  });
                }}
              />
            </>
          );
        }}
      </Form.List>
    </>
  );
}
