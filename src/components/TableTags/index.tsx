import React from 'react';
import { Popover, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import _ from 'lodash';

import './style.less';

export interface TableTagItem {
  key?: React.Key;
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  to?: LinkProps['to'];
  onClick?: () => void;
}

interface Props<T = any> {
  data?: T[];
  maxVisible?: number;
  maxTagWidth?: number | string;
  emptyText?: React.ReactNode;
  getKey?: (item: T, index: number) => React.Key;
  getLabel?: (item: T, index: number) => React.ReactNode;
  getTooltip?: (item: T, index: number) => React.ReactNode;
  getLinkTo?: (item: T, index: number) => LinkProps['to'] | undefined;
  linkTarget?: string;
  onTagClick?: (item: T, index: number) => void;
}

function getDefaultLabel(item: any) {
  if (_.isObject(item) && 'label' in item) {
    return item.label;
  }
  return item;
}

function getDefaultKey(item: any, index: number): React.Key {
  if (_.isObject(item) && 'key' in item && item.key !== undefined) {
    return item.key as React.Key;
  }
  return `${getDefaultLabel(item)}-${index}`;
}

function isEmptyLabel(label: React.ReactNode) {
  return label === undefined || label === null || label === '';
}

export default function TableTags<T = any>(props: Props<T>) {
  const { data, maxVisible = 2, maxTagWidth = 160, emptyText = '-', getKey, getLabel, getTooltip, getLinkTo, linkTarget, onTagClick } = props;
  const items = _.filter(data || [], (item, index) => !isEmptyLabel(getLabel ? getLabel(item, index) : getDefaultLabel(item)));

  if (_.isEmpty(items)) {
    return <>{emptyText}</>;
  }

  const getItemLabel = (item: T, index: number) => (getLabel ? getLabel(item, index) : getDefaultLabel(item));
  const getItemTooltip = (item: T, index: number) => {
    if (getTooltip) return getTooltip(item, index);
    if (_.isObject(item) && 'tooltip' in (item as any)) return (item as any).tooltip;
    return getItemLabel(item, index);
  };
  const getItemLinkTo = (item: T, index: number) => {
    if (getLinkTo) return getLinkTo(item, index);
    if (_.isObject(item) && 'to' in (item as any)) return (item as any).to;
    return undefined;
  };

  const renderTag = (item: T, index: number, inPopover = false) => {
    const label = getItemLabel(item, index);
    const tooltip = getItemTooltip(item, index);
    const linkTo = getItemLinkTo(item, index);
    const clickable = !!linkTo || !!onTagClick || (_.isObject(item) && 'onClick' in (item as any));
    const style: React.CSSProperties = {
      maxWidth: inPopover ? 320 : maxTagWidth,
    };
    const tag = (
      <span
        className={`fc-table-tag${clickable ? ' fc-table-tag-clickable' : ''}`}
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          if (_.isObject(item) && 'onClick' in (item as any)) {
            (item as any).onClick?.();
          }
          onTagClick?.(item, index);
        }}
      >
        {label}
      </span>
    );

    const content = linkTo ? (
      <Link to={linkTo} target={linkTarget} onClick={(e) => e.stopPropagation()}>
        {tag}
      </Link>
    ) : (
      tag
    );

    return (
      <Tooltip key={String(getKey ? getKey(item, index) : getDefaultKey(item, index))} title={tooltip}>
        {content}
      </Tooltip>
    );
  };

  const visibleItems = items.slice(0, maxVisible);
  const overflowItems = items.slice(maxVisible);

  return (
    <div className='fc-table-tags'>
      {visibleItems.map((item, index) => renderTag(item, index))}
      {overflowItems.length > 0 && (
        <Popover
          placement='topLeft'
          overlayClassName='fc-table-tags-popover'
          content={<div className='fc-table-tags-popover-content'>{items.map((item, index) => renderTag(item, index, true))}</div>}
        >
          <span className='fc-table-tag fc-table-tag-overflow' onClick={(e) => e.stopPropagation()}>
            +{overflowItems.length}
          </span>
        </Popover>
      )}
    </div>
  );
}
