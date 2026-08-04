import React, { useCallback, useMemo, useState } from 'react';
import { Input, Empty, Tooltip } from 'antd';
import { SearchOutlined, CopyOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { copyToClipBoard } from '@/utils';

import { NS } from '../../constants';
import { EVENT_FIELD_GROUPS, filterFieldGroups, EventField } from '../../constants/eventFields';

/**
 * 可搜索、带说明、点击即复制的模板字段面板。
 *
 * 取代此前只能在右侧文档里翻表格找字段的做法：表格不能搜也不能复制，
 * 用户只能手抄 {{$event.XXX}}，抄错了还不会报错——模板渲染不出来只会发出空内容。
 */
export default function FieldsPanel() {
  const { t } = useTranslation(NS);
  const [search, setSearch] = useState('');
  // 常用分组默认展开，其余收起，避免一屏铺满四十多个字段
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    _.zipObject(
      _.map(EVENT_FIELD_GROUPS, 'key'),
      _.map(EVENT_FIELD_GROUPS, (group) => group.key !== 'common'),
    ),
  );

  const getDesc = useCallback((field: EventField) => t(`fields_panel.fields.${field.key}`), [t]);
  // 说明也参与搜索，这样中文用户搜「规则名称」同样能命中
  const groups = useMemo(() => filterFieldGroups(EVENT_FIELD_GROUPS, search, getDesc), [search, getDesc]);
  const searching = !!search.trim();

  return (
    <div className='flex h-full min-h-0 flex-col'>
      {/* 分组全部收起时，这一栏就只剩一个搜索框和几行标题，
          不说明的话用户不知道这是什么、更不知道点一下就能复制 */}
      <div className='mb-2 flex-none text-[12px] leading-[1.6] text-soft'>{t('fields_panel.desc')}</div>
      <div className='mb-2 flex-none'>
        <Input
          prefix={<SearchOutlined />}
          allowClear
          placeholder={t('fields_panel.search_placeholder')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      </div>
      <div className='min-h-0 flex-1 best-looking-scroll pr-1'>
        {_.isEmpty(groups) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('fields_panel.no_match')} />}
        {_.map(groups, (group) => {
          // 搜索时一律展开，否则命中项藏在收起的分组里等于没搜到
          const isCollapsed = !searching && collapsed[group.key];
          return (
            <div key={group.key} className='mb-1'>
              <div
                className='flex cursor-pointer select-none items-center gap-1 py-1 text-[12px] text-soft'
                onClick={() => {
                  setCollapsed((prev) => ({ ...prev, [group.key]: !prev[group.key] }));
                }}
              >
                <DownOutlined className='text-[10px] transition-transform duration-200' style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }} />
                {t(`fields_panel.groups.${group.key}`)}
                <span className='opacity-60'>({group.fields.length})</span>
              </div>
              {/* 收起时直接不渲染，而不是 style={{display:'none'}}：本项目 tailwind 开了
                  important: true，`.flex` 会带 !important 压过内联样式，隐藏不掉。
                  这里没有需要保活的状态，卸载无副作用。 */}
              {!isCollapsed && (
                <div className='pl-4'>
                  {_.map(group.fields, (field) => (
                    // 面板宽度可拖动，窄的时候说明会被截断；tooltip 里给出完整说明，
                    // 顺带保留「点击复制」的提示
                    <Tooltip
                      key={field.ref}
                      mouseEnterDelay={0.5}
                      title={
                        <>
                          <div>{getDesc(field)}</div>
                          <div className='opacity-70'>
                            {field.type} · {t('fields_panel.copy_tip')}
                          </div>
                        </>
                      }
                    >
                      <div
                        className='group mb-1 cursor-pointer rounded border border-antd bg-fc-100 px-2 py-1 transition hover:border-primary'
                        onClick={() => {
                          copyToClipBoard(field.ref);
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='min-w-0 flex-1 truncate font-mono text-[12px]'>{field.ref}</span>
                          <CopyOutlined className='shrink-0 text-[11px] text-soft group-hover:text-primary' />
                        </div>
                        <div className='mt-0.5 flex items-center gap-1.5 text-[11px] text-soft'>
                          <span className='min-w-0 flex-1 truncate'>{getDesc(field)}</span>
                          <span className='shrink-0 opacity-60'>{field.type}</span>
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
