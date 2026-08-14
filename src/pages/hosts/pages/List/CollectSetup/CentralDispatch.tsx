import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Select, Alert, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { getTargetList } from '@/services/targets';

import { NS } from '../../../constants';

export interface DispatchTarget {
  ident: string;
  groups: { id: number; name: string }[];
}

interface Props {
  /** 要下发到的机器（机器列表里勾选的那些） */
  idents: string[];
  groupId?: number;
  onGroupIdChange: (groupId?: number) => void;
  name: string;
  onNameChange: (name: string) => void;
  /** 下发失败时的原文/可读解释 */
  error?: string;
}

/**
 * 「中心端下发」面板。
 *
 * 与旁边那条「登录机器执行命令」的区别只在配置怎么到机器：这边由服务端下发给 categraf 的
 * http_provider，用户不必登录任何机器。后面第 4 步的到达验证两条路完全一样。
 *
 * 采集配置是业务组资源，必须落在一个业务组里 —— 而勾选的机器可能横跨多个组，
 * 所以这里要先把机器的业务组查出来让用户定一个，不能默默替他选。
 */
export default function CentralDispatch(props: Props) {
  const { t } = useTranslation(NS);
  const { idents, groupId, onGroupIdChange, name, onNameChange, error } = props;
  const [targets, setTargets] = useState<DispatchTarget[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (_.isEmpty(idents)) {
      setTargets([]);
      setLoaded(true);
      return;
    }
    let stale = false;
    getTargetList({ p: 1, limit: Math.max(idents.length, 1), queries: [{ key: 'hosts', op: '==', values: idents }] })
      .then((res) => {
        if (stale) return;
        setTargets(
          _.map(res?.dat?.list ?? [], (item: any) => ({
            ident: item.ident,
            groups: _.compact(item.group_objs ?? []),
          })),
        );
      })
      .catch((err) => {
        console.error(err);
        if (!stale) setTargets([]);
      })
      .finally(() => {
        if (!stale) setLoaded(true);
      });
    return () => {
      stale = true;
    };
  }, [_.join(idents, ',')]);

  /**
   * 候选业务组取**并集**而不是交集：交集为空时用户就无路可走了，
   * 而选了某个组之后，不在该组的机器本来就筛不到 —— 下面会明说影响到几台。
   */
  const groupOptions = useMemo(() => {
    const all = _.flatMap(targets, 'groups');
    return _.uniqBy(all, 'id');
  }, [targets]);

  // 选定业务组后，勾选的机器里有几台不在这个组 —— 它们不会被这条配置命中
  const outsideIdents = useMemo(() => {
    if (!groupId) return [];
    return _.map(
      _.filter(targets, (target) => !_.some(target.groups, { id: groupId })),
      'ident',
    );
  }, [targets, groupId]);

  // 只有一个候选时直接定下来，不让用户为唯一选项再点一次
  useEffect(() => {
    if (groupId === undefined && groupOptions.length === 1) {
      onGroupIdChange(groupOptions[0].id);
    }
  }, [groupOptions, groupId]);

  return (
    <div>
      <Alert className='mb-3' type='info' showIcon message={t('collect.central.intro')} />

      {/* 命令那条路不需要勾机器（用户自己去哪台执行都行），所以这个状态是可达的，
          不能只把提交按钮灰掉了事 */}
      {_.isEmpty(idents) && <Alert className='mb-3' type='warning' showIcon message={t('collect.central.no_target')} />}

      <Form layout='vertical'>
        <Form.Item label={t('collect.central.targets_label')} className='mb-3'>
          <div className='text-soft'>{t('collect.central.targets_value', { count: idents.length, idents: _.join(_.take(idents, 5), ', ') })}</div>
        </Form.Item>

        <Form.Item
          label={t('collect.central.group_label')}
          className='mb-3'
          validateStatus={loaded && groupOptions.length === 0 ? 'error' : undefined}
          help={loaded && groupOptions.length === 0 ? t('collect.central.no_group') : undefined}
        >
          <Select
            showSearch
            optionFilterProp='label'
            value={groupId}
            placeholder={t('collect.central.group_placeholder')}
            onChange={(value) => onGroupIdChange(value)}
            options={_.map(groupOptions, (item) => ({ label: item.name, value: item.id }))}
          />
        </Form.Item>

        {!_.isEmpty(outsideIdents) && (
          <Alert
            className='mb-3'
            type='warning'
            showIcon
            message={t('collect.central.outside_group', { count: outsideIdents.length, idents: _.join(_.take(outsideIdents, 3), ', ') })}
          />
        )}

        <Form.Item label={t('collect.central.name_label')} extra={t('collect.central.name_tip')} className='mb-3'>
          <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
        </Form.Item>
      </Form>

      {error && (
        <Alert
          type='error'
          showIcon
          message={t('collect.central.failed')}
          description={
            <Space direction='vertical' size={4}>
              <span className='whitespace-pre-line'>{error}</span>
            </Space>
          }
        />
      )}
    </div>
  );
}
