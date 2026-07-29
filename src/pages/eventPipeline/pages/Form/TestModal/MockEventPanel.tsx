import React from 'react';
import { Alert, Select, Space, Switch, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS, MOCK_EVENT_TAGS } from '../../../constants';

export interface MockEventState {
  severity: number;
  isRecovered: boolean;
}

interface Props {
  value: MockEventState;
  onChange: (value: MockEventState) => void;
}

/**
 * 样例事件面板：新环境没有历史告警时也能试跑。
 * 与通知规则的样例事件不同，工作流的处理器会「读事件内容」来决策
 * （事件丢弃按级别 / 恢复态 / 标签判断），固定不变的样例只能验证一个分支，
 * 所以这里把级别与恢复态开放给用户调整，其余字段由后端合成、保持稳定。
 */
export default function MockEventPanel({ value, onChange }: Props) {
  const { t } = useTranslation(NS);

  return (
    <>
      <Alert className='mb-4' type='info' showIcon message={t('test_modal.mock.desc')} />
      <div className='p-4 rounded-lg fc-border bg-fc-150'>
        <div className='font-bold mb-3'>{t('test_modal.mock.preview_title')}</div>
        <div className='flex items-center mb-3'>
          <span className='text-soft mr-2 shrink-0'>{t('test_modal.mock.severity')}</span>
          <Select
            size='small'
            style={{ width: 180 }}
            value={value.severity}
            onChange={(severity) => onChange({ ...value, severity })}
            options={_.map([1, 2, 3], (level) => ({ label: t(`common:severity.${level}`), value: level }))}
          />
        </div>
        <div className='flex items-center mb-3'>
          <span className='text-soft mr-2 shrink-0'>{t('test_modal.mock.is_recovered')}</span>
          <Switch size='small' checked={value.isRecovered} onChange={(isRecovered) => onChange({ ...value, isRecovered })} />
        </div>
        <div className='flex items-start'>
          <span className='text-soft mr-2 shrink-0'>{t('test_modal.mock.tags')}</span>
          <Space size={[4, 4]} wrap>
            {_.map(MOCK_EVENT_TAGS, (tag) => (
              <Tag key={tag} className='mr-0'>
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      </div>
    </>
  );
}
