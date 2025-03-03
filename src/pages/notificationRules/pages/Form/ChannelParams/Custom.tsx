import React, { useEffect } from 'react';
import { AutoComplete, Form } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';

import { getCustomParamsValues } from '@/pages/notificationRules/services';

interface Props {
  field: FormListFieldData;
  customParams: {
    key: string;
    cname: string;
  }[];
}

export default function Custom(props: Props) {
  const { field, customParams } = props;
  const form = Form.useFormInstance();
  const channel_id = Form.useWatch(['notify_configs', field.name, 'channel_id']);
  const [paramsValues, setParamsValues] = React.useState<any[]>([]);

  useEffect(() => {
    if (channel_id) {
      getCustomParamsValues(channel_id)
        .then((res) => {
          setParamsValues(
            _.map(res, (item) => {
              return {
                ...item,
                __id__: _.uniqueId(),
              };
            }),
          );
        })
        .catch(() => {
          setParamsValues([]);
        });
    } else {
      setParamsValues([]);
    }
  }, [channel_id]);

  return (
    <div>
      {_.map(customParams, (item) => {
        return (
          <div key={item.key}>
            <Form.Item {...field} label={item.cname} name={[field.name, 'params', item.key]} rules={[{ required: true }]}>
              <AutoComplete
                options={_.map(paramsValues, (paramsValue: { [key: string]: string }) => {
                  return {
                    id: paramsValue.__id__,
                    label: (
                      <div>
                        {_.map(paramsValue, (value, key) => {
                          return (
                            <span key={key}>
                              <span
                                key={key}
                                style={{
                                  backgroundColor: 'var(--fc-fill-4)',
                                  padding: '1px 2px',
                                  wordBreak: 'normal',
                                  borderRadius: 4,
                                }}
                              >
                                {key}:
                              </span>
                              <span
                                style={{
                                  padding: '0 8px 0 2px',
                                }}
                              >
                                {value}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    ),
                    value: paramsValue[item.key],
                  };
                })}
                onChange={(_value, option: any) => {
                  const record = _.find(paramsValues, { __id__: option?.id });
                  const newValues = _.cloneDeep(form.getFieldsValue());
                  _.map(_.omit(record, ['__id__']), (value, key) => {
                    _.set(newValues, ['notify_configs', field.name, 'params', key], value);
                  });
                  form.setFieldsValue(newValues);
                }}
              />
            </Form.Item>
          </div>
        );
      })}
    </div>
  );
}
