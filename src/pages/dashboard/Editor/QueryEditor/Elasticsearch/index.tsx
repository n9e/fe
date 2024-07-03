import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import Collapse from '../../Components/Collapse';
import ExpressionPanel from '../../Components/ExpressionPanel';
import AddQueryButtons from '../../Components/AddQueryButtons';
import QueryPanel from './QueryPanel';

export default function Elasticsearch({ chartForm, variableConfig, dashboardId }) {
  const targets = Form.useWatch('targets');

  return (
    <Form.List name='targets'>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Collapse>
              {_.map(fields, (field, index) => {
                const { __mode__ } = targets?.[field.name] || {};
                if (__mode__ === '__expr__') {
                  return <ExpressionPanel key={field.key} fields={fields} remove={remove} field={field} />;
                }
                return <QueryPanel key={field.key} field={field} index={index} fields={fields} remove={remove} dashboardId={dashboardId} variableConfig={variableConfig} />;
              })}

              <Form.ErrorList errors={errors} />
            </Collapse>
            <AddQueryButtons
              add={add}
              addQuery={(newRefId) => {
                add({
                  query: {
                    values: [
                      {
                        func: 'count',
                      },
                    ],
                    date_field: '@timestamp',
                    interval: 1,
                    interval_unit: 'min',
                  },
                  refId: newRefId,
                });
              }}
            />
          </>
        );
      }}
    </Form.List>
  );
}
