import React, { useState } from 'react';
import { Button, Form, Space } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, MinusCircleFilled, SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS } from '../../constants';
import { checkItem, CredentialCheckItem } from '../../services';
import { ChannelItem } from '../../types';
import { normalizeFormValues } from '../../utils/normalizeValues';

interface Props {
  /** 校验前要先通过的表单字段（本媒介的凭证字段），不通过就不发请求 */
  fields: (string | number)[][];
}

/**
 * 「校验凭证」：对当前表单（未保存）的原生媒介配置逐项检查凭证与权限，逐项展示结果。
 * 不拦保存——对方服务暂时不通时不应该连保存都做不了。
 */
export default function CredentialCheck(props: Props) {
  const { t } = useTranslation(NS);
  const form = Form.useFormInstance();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CredentialCheckItem[]>();

  const run = () => {
    form
      .validateFields(props.fields)
      .then(() => {
        setLoading(true);
        const config = normalizeFormValues(form.getFieldsValue() as ChannelItem);
        return checkItem(config)
          .then(setItems)
          .catch(() => setItems(undefined))
          .finally(() => setLoading(false));
      })
      .catch(() => {
        /* 校验失败由 antd 标红 */
      });
  };

  const requiredFailed = _.some(items, (it) => it.required && !it.ok && !it.skipped);

  return (
    <div className='mb-4'>
      <Button icon={<SafetyCertificateOutlined />} loading={loading} onClick={run}>
        {t('check.btn')}
      </Button>
      {items && (
        <div className='mt-2 rounded-lg fc-border p-3'>
          <div className='mb-2 font-bold'>{requiredFailed ? t('check.failed') : t('check.passed')}</div>
          {_.map(items, (it) => (
            <div key={it.name} className='flex items-start gap-2 py-1'>
              <span className='shrink-0'>
                {it.skipped ? (
                  <MinusCircleFilled className='text-soft' />
                ) : it.ok ? (
                  <CheckCircleFilled style={{ color: 'var(--fc-green-6-color, #52c41a)' }} />
                ) : it.required ? (
                  <CloseCircleFilled style={{ color: 'var(--fc-red-6-color, #ff4d4f)' }} />
                ) : (
                  <ExclamationCircleFilled style={{ color: 'var(--fc-orange-6-color, #faad14)' }} />
                )}
              </span>
              <Space direction='vertical' size={0} className='min-w-0'>
                <span>
                  {it.name}
                  {!it.required && <span className='ml-1 text-soft text-[12px]'>({t('check.optional')})</span>}
                </span>
                {it.message && <span className='text-soft text-[12px] break-all whitespace-pre-wrap'>{it.message}</span>}
              </Space>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
