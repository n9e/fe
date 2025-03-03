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
  const [paramsData, setParamsData] = React.useState<
    {
      __id__: string;
      data: { name: string; cname: string; value: string }[];
    }[]
  >();

  useEffect(() => {
    if (channel_id) {
      getCustomParamsValues(channel_id)
        .then((res) => {
          setParamsData(
            _.map(res, (item) => {
              return {
                __id__: _.uniqueId(),
                data: item,
              };
            }),
          );
        })
        .catch(() => {
          setParamsData([]);
        });
    } else {
      setParamsData([]);
    }
  }, [channel_id]);

  return (
    <div>
      {_.map(customParams, (item) => {
        return (
          <div key={item.key}>
            <Form.Item {...field} label={item.cname} name={[field.name, 'params', item.key]} rules={[{ required: true }]}>
              <AutoComplete
                options={_.map(paramsData, (paramsDataItem: { __id__: string; data: { name: string; cname: string; value: string }[] }) => {
                  return {
                    id: paramsDataItem.__id__,
                    label: (
                      <div
                        onClick={() => {
                          const newValues = _.cloneDeep(form.getFieldsValue());
                          _.map(paramsDataItem.data, (paramItem) => {
                            _.set(newValues, ['notify_configs', field.name, 'params', paramItem.name], paramItem.value);
                          });
                          form.setFieldsValue(newValues);
                        }}
                      >
                        {_.map(paramsDataItem.data, (paramItem) => {
                          return (
                            <span key={paramItem.name}>
                              <span
                                style={{
                                  backgroundColor: 'var(--fc-fill-4)',
                                  padding: '1px 2px',
                                  wordBreak: 'normal',
                                  borderRadius: 4,
                                }}
                              >
                                {paramItem.cname}:
                              </span>
                              <span
                                style={{
                                  padding: '0 8px 0 2px',
                                }}
                              >
                                {paramItem.value}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    ),
                  };
                })}
              />
            </Form.Item>
          </div>
        );
      })}
    </div>
  );
}
