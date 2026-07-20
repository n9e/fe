import React, { useRef, useState, useLayoutEffect } from 'react';
import { Button, Popover, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { Trans } from 'react-i18next';

import { copy2ClipBoard } from '@/utils';

interface Props<T = any> {
  type?: 'outline' | 'fill';
  maxWidth?: number; // 容器最大宽度，设置后布局计算以此为上限
  maxCount?: number; // 固定显示数量：设置后只展示前 N 个 + 溢出弹层（与按宽度自适应互斥），用于和旧的"前 N 个"逻辑对齐
  borderRadius?: number; // 边框圆角
  bgColor?: string | ((item: string | T, index: number) => string); // 背景颜色，仅在 type 为 'fill' 时生效
  fontColor?: string | ((item: string | T, index: number) => string); // 字体颜色，仅在 type 为 'fill' 时生效
  icon?: React.ReactNode | ((item: string | T, index: number) => React.ReactNode);
  data: T[] | null; // null 兼容接口可能返回 null 值的情况
  getKey?: (item: T, index: number) => React.Key;
  getLabel?: (item: T, index: number) => string;
  getTooltipTitle?: (item: string | T, index: number) => string | undefined; // 返回 undefined 不显示 tooltip
  onTagClick?: (item: string | T, index: number) => void;
  popoverTitle?: React.ReactNode | ((count: number) => React.ReactNode); // 自定义 popover 标题，可接收 data.length
  hideLabel?: boolean; // 仅展示 icon，隐藏文字内容
}

const GAP = 2;

/**
 * 核心布局算法：根据实际测量的 tag 宽度计算可见数量
 */
export function calcLayout(tagWidths: number[], overflowTagWidth: number, containerWidth: number): { visibleCount: number; overflowCount: number } {
  if (!tagWidths.length || containerWidth <= 0) {
    return { visibleCount: tagWidths.length, overflowCount: 0 };
  }

  const widths = tagWidths.map((w) => Math.min(w, containerWidth));

  // ── 第一行 ──
  let row1End = -1;
  let rem = containerWidth;
  for (let i = 0; i < widths.length; i++) {
    const needed = i === 0 ? widths[i] : GAP + widths[i];
    if (rem >= needed) {
      rem -= needed;
      row1End = i;
    } else {
      break;
    }
  }

  if (row1End === widths.length - 1) {
    return { visibleCount: widths.length, overflowCount: 0 };
  }

  // ── 第二行 ──
  const r2start = row1End + 1;
  rem = containerWidth;
  let r2count = 0;

  for (let i = r2start; i < widths.length; i++) {
    const isFirst = i === r2start;
    const needed = isFirst ? widths[i] : GAP + widths[i];
    const isLast = i === widths.length - 1;

    if (isLast) {
      if (rem >= needed) r2count++;
      break;
    }

    // 非最后一个：放置当前 tag 后，还需在第二行留出 overflow tag 的空间
    if (rem >= needed + GAP + overflowTagWidth) {
      rem -= needed;
      r2count++;
    } else {
      break;
    }
  }

  const visibleCount = r2start + r2count;
  return { visibleCount, overflowCount: widths.length - visibleCount };
}

function resolveIcon<T>(icon: Props<T>['icon'], item: string | T, index: number): React.ReactNode | undefined {
  if (!icon) return undefined;
  return typeof icon === 'function' ? icon(item, index) : icon;
}

function resolveColor<T>(color: string | ((item: string | T, index: number) => string) | undefined, item: string | T, index: number, defaultValue: string): string {
  if (!color) return defaultValue;
  return typeof color === 'function' ? color(item, index) : color;
}

export default function Tags<T>(props: Props<T>) {
  const { type = 'outline', icon, data, onTagClick, getKey, getLabel, getTooltipTitle, maxWidth, maxCount, hideLabel } = props;

  const borderRadius = props.borderRadius ?? 16;
  const containerRef = useRef<HTMLDivElement>(null);
  const tagMeasureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const overflowMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [layout, setLayout] = useState({ visibleCount: data?.length, overflowCount: 0 });

  // fill 模式下通过 inline style 设置动态颜色（Tailwind 不支持动态值）
  const getTagStyle = (item: string | T, index: number): React.CSSProperties => {
    if (type === 'fill') {
      const bg = resolveColor(props.bgColor, item, index, 'var(--fc-violet-3)');
      const fc = resolveColor(props.fontColor, item, index, 'var(--fc-violet-11)');
      return {
        backgroundColor: bg,
        backgroundClip: 'padding-box',
        borderColor: bg,
        color: fc,
        borderRadius,
      };
    }
    const fc = props.fontColor ? resolveColor(props.fontColor, item, index, '') : undefined;
    return { ...(fc ? { color: fc } : {}), borderRadius };
  };

  // tag 的 Tailwind 基础类（测量层和渲染层共用）
  const getItemLabel = (item: string | T, index: number): string => {
    if (typeof item === 'string') return item;
    return getLabel ? getLabel(item as T, index) : String(item);
  };

  const getItemKey = (item: string | T, index: number): React.Key => {
    if (typeof item === 'string') return index;
    return getKey ? getKey(item as T, index) : index;
  };

  // p-[6px] border border-[var(--fc-border-color)] leading-none whitespace-nowrap box-border
  const tagBaseClass = `inline-flex items-center px-[6px] py-[4px] border ${type === 'fill' ? '' : 'border-[var(--fc-border-color)]'} leading-none whitespace-nowrap box-border ${
    onTagClick ? 'cursor-pointer' : ''
  }`;

  // 可见层额外加溢出省略（text-ellipsis 对 inline-flex 无效，由内部 span 承接）
  const visibleTagClass = `${tagBaseClass} overflow-hidden max-w-full shrink-0 min-w-0`;

  useLayoutEffect(() => {
    // 固定数量模式：只展示前 maxCount 个，其余进溢出弹层，不走宽度测量（与旧的"前 N 个 + N"逻辑对齐）
    if (maxCount != null) {
      const len = data?.length ?? 0;
      setLayout({ visibleCount: Math.min(maxCount, len), overflowCount: Math.max(len - maxCount, 0) });
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const rawWidth = el.getBoundingClientRect().width;
      if (rawWidth <= 0) return;
      const containerWidth = maxWidth != null ? Math.min(rawWidth, maxWidth) : rawWidth;

      const tagWidths = tagMeasureRefs.current.slice(0, data?.length).map((span) => (span ? Math.ceil(span.getBoundingClientRect().width) : containerWidth));
      const overflowTagWidth = overflowMeasureRef.current ? Math.ceil(overflowMeasureRef.current.getBoundingClientRect().width) : 40;

      setLayout(calcLayout(tagWidths, overflowTagWidth, containerWidth));
    };

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    compute();

    return () => ro.disconnect();
  }, [data, maxCount]);

  const { visibleCount, overflowCount } = layout;

  if (!data || data.length === 0) return null;

  return (
    <div ref={containerRef} className='relative overflow-hidden' style={maxWidth != null ? { maxWidth } : undefined}>
      {/* 隐藏测量层：绝对定位不占空间，用于获取各 tag 的真实渲染宽度 */}
      <div aria-hidden className='absolute top-0 left-0 invisible pointer-events-none flex'>
        {(data as (string | T)[]).map((item, i) => (
          <span
            key={getItemKey(item, i)}
            ref={(el) => {
              tagMeasureRefs.current[i] = el;
            }}
            className={tagBaseClass}
          >
            {icon && <span className={`${hideLabel ? '' : 'mr-2'} flex items-center`}>{resolveIcon(icon, item, i)}</span>}
            {!hideLabel && getItemLabel(item, i)}
          </span>
        ))}
        {/* 用最大计数值预估 overflow tag 宽度上限 */}
        <span ref={overflowMeasureRef} className={tagBaseClass}>
          +{data?.length}
        </span>
      </div>

      {/* 可见布局层 */}
      <div className='flex flex-wrap gap-0.5 content-start'>
        {(data as (string | T)[]).slice(0, visibleCount).map((item, i) => (
          <Tooltip key={getItemKey(item, i)} title={getTooltipTitle ? getTooltipTitle(item, i) : getItemLabel(item, i)}>
            <span
              className={visibleTagClass}
              style={getTagStyle(item, i)}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(item, i);
              }}
            >
              {icon && <span className={`${hideLabel ? '' : 'mr-[3px]'} flex items-center shrink-0`}>{resolveIcon(icon, item, i)}</span>}
              {!hideLabel && <span className='overflow-hidden text-ellipsis'>{getItemLabel(item, i)}</span>}
            </span>
          </Tooltip>
        ))}
        {overflowCount > 0 && (
          <Popover
            title={
              <div className='flex justify-between items-center'>
                {props.popoverTitle != null ? (
                  typeof props.popoverTitle === 'function' ? (
                    props.popoverTitle(data.length)
                  ) : (
                    props.popoverTitle
                  )
                ) : (
                  <>
                    <Trans ns='common' i18nKey='tags_popover_title' values={{ count: data?.length }} />
                    <Button
                      type='text'
                      icon={<CopyOutlined />}
                      onClick={() => {
                        copy2ClipBoard((data as (string | T)[]).map((item, i) => getItemLabel(item, i)).join('\n'));
                      }}
                    />
                  </>
                )}
              </div>
            }
            overlayStyle={{ width: 400, maxHeight: 600, overflowY: 'auto' } as React.CSSProperties}
            content={
              <div className='flex flex-wrap gap-1'>
                {(data as (string | T)[]).map((item, i) => (
                  <span
                    key={getItemKey(item, i)}
                    className={tagBaseClass}
                    style={getTagStyle(item, i)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(item, i);
                    }}
                  >
                    {icon && <span className={`${hideLabel ? '' : 'mr-[3px]'} flex items-center`}>{resolveIcon(icon, item, i)}</span>}
                    {!hideLabel && getItemLabel(item, i)}
                  </span>
                ))}
              </div>
            }
          >
            <span
              className={`${tagBaseClass} shrink-0`}
              style={getTagStyle('', -1)}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              +{overflowCount}
            </span>
          </Popover>
        )}
      </div>
    </div>
  );
}
