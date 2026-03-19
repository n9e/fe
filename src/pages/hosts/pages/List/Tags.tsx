import React, { useRef, useState, useLayoutEffect, useContext } from 'react';
import { Button, Popover } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { Trans } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { copy2ClipBoard } from '@/utils';

import { NS } from '../../constants';

interface Props {
  type: 'outline' | 'fill';
  bgColor?: string; // 背景颜色，仅在 type 为 'fill' 时生效
  fontColor?: string; // 字体颜色，仅在 type 为 'fill' 时生效
  data: string[];
  onTagClick?: (tag: string) => void;
}

const GAP = 2;

/**
 * 核心布局算法：根据实际测量的 tag 宽度计算可见数量
 */
function calcLayout(tagWidths: number[], overflowTagWidth: number, containerWidth: number): { visibleCount: number; overflowCount: number } {
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

export default function Tags(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { type = 'outline', data, onTagClick } = props;
  const bgColor = props.bgColor || (darkMode ? 'rgba(58, 46, 130, 0.5)' : 'rgb(238, 240, 255)');
  const fontColor = props.fontColor || (darkMode ? 'rgb(164, 169, 253)' : 'rgb(92, 64, 230)');
  const containerRef = useRef<HTMLDivElement>(null);
  const tagMeasureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const overflowMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [layout, setLayout] = useState({ visibleCount: data.length, overflowCount: 0 });

  // fill 模式下通过 inline style 设置动态颜色（Tailwind 不支持动态值）
  const fillStyle: React.CSSProperties | undefined = type === 'fill' ? { backgroundColor: bgColor, borderColor: bgColor, color: fontColor } : undefined;

  // tag 的 Tailwind 基础类（测量层和渲染层共用）
  // p-[6px] border border-[var(--fc-border-color)] rounded-2xl leading-none whitespace-nowrap box-border
  const tagBaseClass = `inline-block px-[6px] py-[4px] border ${type === 'fill' ? '' : 'border-[var(--fc-border-color)]'} rounded-2xl leading-none whitespace-nowrap box-border ${
    onTagClick ? 'cursor-pointer' : ''
  }`;

  // 可见层额外加溢出省略
  const visibleTagClass = `${tagBaseClass} overflow-hidden text-ellipsis max-w-full shrink-0`;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const containerWidth = el.getBoundingClientRect().width;
      if (containerWidth <= 0) return;

      const tagWidths = tagMeasureRefs.current.slice(0, data.length).map((span) => (span ? Math.ceil(span.getBoundingClientRect().width) : containerWidth));
      const overflowTagWidth = overflowMeasureRef.current ? Math.ceil(overflowMeasureRef.current.getBoundingClientRect().width) : 40;

      setLayout(calcLayout(tagWidths, overflowTagWidth, containerWidth));
    };

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    compute();

    return () => ro.disconnect();
  }, [data]);

  const { visibleCount, overflowCount } = layout;

  return (
    <div ref={containerRef} className='relative'>
      {/* 隐藏测量层：绝对定位不占空间，用于获取各 tag 的真实渲染宽度 */}
      <div aria-hidden className='absolute top-0 left-0 invisible pointer-events-none flex'>
        {data.map((tag, i) => (
          <span
            key={i}
            ref={(el) => {
              tagMeasureRefs.current[i] = el;
            }}
            className={tagBaseClass}
          >
            {tag}
          </span>
        ))}
        {/* 用最大计数值预估 overflow tag 宽度上限 */}
        <span ref={overflowMeasureRef} className={tagBaseClass}>
          +{data.length}
        </span>
      </div>

      {/* 可见布局层 */}
      <div className='flex flex-wrap gap-0.5 content-start'>
        {data.slice(0, visibleCount).map((tag, i) => (
          <span key={i} className={visibleTagClass} style={fillStyle} title={tag} onClick={() => onTagClick?.(tag)}>
            {tag}
          </span>
        ))}
        {overflowCount > 0 && (
          <Popover
            title={
              <div className='flex justify-between items-center'>
                <Trans ns={NS} i18nKey='tags_popover_title' values={{ count: data.length }} />
                <Button
                  type='text'
                  icon={<CopyOutlined />}
                  onClick={() => {
                    copy2ClipBoard(data.join('\n'));
                  }}
                />
              </div>
            }
            content={
              <div>
                {data.map((tag, i) => (
                  <div key={i} className='mb-1'>
                    <div className={tagBaseClass} style={fillStyle} onClick={() => onTagClick?.(tag)}>
                      {tag}
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <span className={`${tagBaseClass} shrink-0`} style={fillStyle}>
              +{overflowCount}
            </span>
          </Popover>
        )}
      </div>
    </div>
  );
}
