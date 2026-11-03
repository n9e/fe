import React, { useMemo } from 'react';
import { AutoComplete, Form } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { getCustomParamsCacheKey, getCustomParamsValues } from '@/pages/notificationRules/services';
import type { CustomParamValue } from '@/pages/notificationRules/services';
import { CUSTOM_PARAMS_CACHE_TIME, OPTIONS_CACHE_STALE_TIME } from '../../../constants';

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
  customParams: {
    key: string;
    cname: string;
  }[];
}

export default function Custom(props: Props) {
  const { prefixNamePath = [], field } = props;
  const channel_id = Form.useWatch([...prefixNamePath, field.name, 'channel_id']);
  return <CustomInner key={channel_id ?? 'no-channel'} {...props} channelId={channel_id} />;
}

function CustomInner(props: Props & { channelId?: number }) {
  const { prefixNamePath = [], field, customParams, channelId } = props;
  const form = Form.useFormInstance();
  const { data, error } = useRequest<CustomParamValue[][], []>(
    () => {
      if (channelId == null) return Promise.resolve([]);
      return getCustomParamsValues(channelId);
    },
    {
      ready: channelId != null,
      cacheKey: channelId != null ? getCustomParamsCacheKey(channelId) : undefined,
      // 与凭证历史共用缓存键，复用已完成的参数结果，减少重复请求。
      staleTime: OPTIONS_CACHE_STALE_TIME,
      cacheTime: CUSTOM_PARAMS_CACHE_TIME,
      onError: () => {},
    },
  );
  const paramsData = useMemo(
    () =>
      _.map(error ? [] : data ?? [], (item) => {
        return {
          __id__: _.uniqueId(),
          data: _.sortBy(item, 'cname'),
        };
      }),
    [data, error],
  );

  return (
    <div>
      {_.map(customParams, (item) => {
        return (
          <div key={item.key}>
            <Form.Item {...field} label={item.cname} name={[field.name, 'params', item.key]}>
              <AutoComplete
                options={_.map(paramsData, (paramsDataItem: { __id__: string; data: { name: string; cname: string; value: string }[] }) => {
                  return {
                    id: paramsDataItem.__id__,
                    label: (
                      <div
                        onClick={() => {
                          const newValues = _.cloneDeep(form.getFieldsValue());
                          _.map(paramsDataItem.data, (paramItem) => {
                            _.set(newValues, [...prefixNamePath, field.name, 'params', paramItem.name], paramItem.value);
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
