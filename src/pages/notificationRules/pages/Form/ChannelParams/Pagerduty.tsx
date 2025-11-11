import React, { useEffect, useRef, useState } from 'react';
import { Form, Select, message } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { getPagerdutyServiceList, getPagedutyIntegrationKey } from '../../../services';
import { NS } from '../../../constants';

interface Props {
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

export default function PagerDuty(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem } = props;
  const [channelOptions, setChannelOptions] = useState<any[]>();
  const form = Form.useFormInstance();
  const integrationKeysCacheMap = useRef<Record<string, string>>({});
  const [integrationKeys, setIntegrationKeys] = useState<string[]>([]);
  // 监听外部异步初始化或其它地方 setFieldsValue 写入的 ids（完整路径包含 notify_configs）
  const watchedIds = Form.useWatch(['notify_configs', field.name, 'params', 'pagerduty_integration_ids'], form);
  const prevWatchedKeyRef = useRef<string>('');

  const handleSelectChange = async (values: string[]) => {
    const vals = Array.isArray(values) ? values : [];
    if (!channelItem?.id) {
      setIntegrationKeys([]);
      // 保证表单同步为空
      form.setFields([{ name: [field.name, 'params', 'pagerduty_integration_keys'], value: [] }]);
      return;
    }

    // 找出未缓存的项并并发请求（并保证失败也写占位）
    const needFetch = vals.filter((val) => !integrationKeysCacheMap.current[val]);
    const tasks = needFetch.map(async (val) => {
      const [serviceId, integrationId] = val.split('-');
      try {
        const res = await getPagedutyIntegrationKey(channelItem.id, serviceId, integrationId);
        integrationKeysCacheMap.current[val] = res?.integration_key || res?.key || '';
        return { val, ok: true };
      } catch (e) {
        console.error('Failed to fetch integration key for', val, e);
        // 失败写占位，后面会从表单中移除该 id
        integrationKeysCacheMap.current[val] = '';
        return { val, ok: false, err: e };
      }
    });

    const results = await Promise.allSettled(tasks);
    // 统计请求失败的项
        const failedSet = new Set<string>();
        results.forEach((r) => {
          if (r.status === 'fulfilled') {
            const v = r.value as { val: string; ok: boolean };
            if (!v.ok) failedSet.add(v.val);
          } else {
            // promise rejected（理论上不会，但兜底）
            const v = (r as any).reason?.val;
            if (v) failedSet.add(v);
          }
        });

    // 如果有失败项，从当前选中数组中移除它们
    let remainingIds = vals.slice();
    if (failedSet.size > 0) {
      remainingIds = vals.filter((v) => !failedSet.has(v));
      // 从缓存中清除失败项（避免保留空占位）
      failedSet.forEach((v) => {
        delete integrationKeysCacheMap.current[v];
      });

      // 提示用户有哪些项被移除
      const failedList = Array.from(failedSet).join(', ');
      message.error(t('notification_configuration.fetch_integration_key_failed_remove')?.replace('{list}', failedList) || `获取以下 PagerDuty key 失败并已移除：${failedList}`);
    }

    // 按当前选中顺序构造最终 keys（即使某项为空也保留位置）
    const finalKeys = remainingIds.map((v) => integrationKeysCacheMap.current[v] ?? '');
    setIntegrationKeys(finalKeys);

    // 把 ids 和 keys 写回表单（包含 Form.List 根路径 'notify_configs'）
    form.setFields([
      {
        name: ['notify_configs', field.name, 'params', 'pagerduty_integration_ids'],
        value: remainingIds,
      },
      {
        name: ['notify_configs', field.name, 'params', 'pagerduty_integration_keys'],
        value: finalKeys,
      },
    ]);
  };

  // 当外部异步初始化或 later setFieldsValue 写入该路径时触发（去重防抖）
  useEffect(() => {
    const ids: string[] = Array.isArray(watchedIds) ? watchedIds : [];
    const key = ids.join('|');
    if (key === prevWatchedKeyRef.current) return; // 值未变化则跳过
    prevWatchedKeyRef.current = key;

    if (ids.length === 0) {
      // 外部初始化为空：清理本地状态与表单（可选）
      setIntegrationKeys([]);
      form.setFields([
        { name: ['notify_configs', field.name, 'params', 'pagerduty_integration_keys'], value: [] },
      ]);
      return;
    }
    handleSelectChange(ids);
  }, [watchedIds, channelItem?.id]);

  useEffect(() => {
    if (channelItem?.id) {
      getPagerdutyServiceList(channelItem?.id)
        .then((res) => {
          setChannelOptions(
            _.map(res, (item) => {
              return {
                label: `${item.service_name}/${item.integration_summary}`,
                value: `${item.service_id}-${item.integration_id}`,  //  实际值
              };
            }),
          );
        })
        .catch(() => {
          setChannelOptions([]);
        });
    } else {
      setChannelOptions([]);
    }
  }, [channelItem?.id]);

  return (
    <div>
      <Form.Item {...field} label={t('notification_configuration.pagerduty.services')} name={[field.name, 'params', 'pagerduty_integration_ids']}>
        <Select options={channelOptions} showSearch optionFilterProp='label' mode='multiple' onChange={handleSelectChange} />
      </Form.Item>
      {/* 不显示组件，受控 */}
      <Form.Item {...field} label={t('notification_configuration.pagerduty.services')} name={[field.name, 'params', 'pagerduty_integration_keys']} style={{ display: 'none' }}>
        <Select options={Object.entries(integrationKeysCacheMap.current).map(([k, v]) => ({ label: v, value: v }))} mode='multiple' value={integrationKeys} />
      </Form.Item>
    </div>
  );
}
