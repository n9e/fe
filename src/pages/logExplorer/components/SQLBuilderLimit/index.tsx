import React, { useEffect, useMemo } from 'react';
import { Form, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

import request from '@/utils/request';
import { getAntdLocale } from '@/utils/antdLocale';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface Props {
  datasourceId?: number;
  type: string;
  label: string;
  placeholder?: string;
  initialValue?: number;
  visible?: boolean;
}

export default function SQLBuilderLimit({ datasourceId, type, label, placeholder, initialValue, visible = true }: Props) {
  const { i18n } = useTranslation();
  const loadMaxQueryRows = useMemo(() => {
    let pending: Promise<number | undefined> | undefined;
    return () => {
      if (!datasourceId) return Promise.resolve(undefined);
      if (!pending) {
        pending = request('/api/v1/datasource/desc', { method: 'POST', data: { id: datasourceId }, silence: true })
          .then((res) => {
            const max: unknown = res.data?.settings?.[`${type}.max_query_rows`];
            return typeof max === 'number' && max > 0 ? max : undefined;
          })
          .catch(() => {
            pending = undefined;
            return undefined;
          });
      }
      return pending;
    };
  }, [datasourceId, type, visible]);

  useEffect(() => {
    if (visible) void loadMaxQueryRows();
  }, [visible, loadMaxQueryRows]);

  return (
    <InputGroupWithFormItem size='small' label={label}>
      <Form.Item
        name='limit'
        className='mb-0'
        initialValue={initialValue}
        rules={[
          { type: 'number' },
          {
            validator: async (_, value) => {
              // Validation shares the pending request, so submitting before it finishes cannot bypass the maximum.
              const max = await loadMaxQueryRows();
              if (typeof value === 'number' && max !== undefined && value > max) {
                const template = getAntdLocale(i18n.language).Form?.defaultValidateMessages?.number?.max;
                throw new Error(String(template).replace('${label}', label).replace('${max}', String(max)));
              }
            },
          },
        ]}
      >
        <InputNumber size='small' className='w-[80px]' min={1} placeholder={placeholder} />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
