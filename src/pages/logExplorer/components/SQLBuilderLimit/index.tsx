import React, { useEffect, useMemo } from 'react';
import { Form, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

import request from '@/utils/request';
import { getAntdLocale } from '@/utils/antdLocale';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { NAME_SPACE } from '../../constants';
import getDefaultLimit from './getDefaultLimit';

interface Props {
  datasourceId?: number;
  type: string;
  label: string;
  initialValue?: number;
  visible?: boolean;
}

export default function SQLBuilderLimit({ datasourceId, type, label, initialValue, visible = true }: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();
  const mode = Form.useWatch('mode', form);
  const aggregates = Form.useWatch('aggregates', form);
  const groupBy = Form.useWatch('group_by', form);
  const defaultLimit = mode === 'table' ? getDefaultLimit(type, aggregates, groupBy) : undefined;
  const placeholder =
    defaultLimit === undefined ? t('query_workspace.unlimited') : t(groupBy?.length ? 'query_workspace.default_groups' : 'query_workspace.default_rows', { count: defaultLimit });
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
        <InputNumber size='small' className='w-[140px]' min={1} placeholder={placeholder} title={placeholder} />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
