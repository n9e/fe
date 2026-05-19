import React from 'react';
import { Button, Dropdown, Menu, Popover, Tag, Tooltip } from 'antd';
import { MoreVertical } from 'lucide-react';
import _ from 'lodash';

import './style.less';

export interface TableActionItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
  onClick?: () => void;
}

interface TableActionDropdownProps {
  items: TableActionItem[];
}

export function TableActionDropdown(props: TableActionDropdownProps) {
  const { items } = props;
  const visibleItems = items.filter(Boolean);

  return (
    <Dropdown
      trigger={['click']}
      overlayClassName='fc-table-action-dropdown'
      overlay={
        <Menu>
          {_.map(visibleItems, (item) => (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              danger={item.danger}
              disabled={item.disabled}
              className={item.dividerBefore ? 'fc-table-action-menu-item-with-divider' : undefined}
              onClick={({ domEvent }) => {
                domEvent.stopPropagation();
                item.onClick?.();
              }}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button
        type='text'
        className='fc-table-action-trigger'
        icon={<MoreVertical size={16} strokeWidth={1.8} />}
        onClick={(e) => e.stopPropagation()}
      />
    </Dropdown>
  );
}

interface TableTagsProps {
  data?: React.ReactNode[];
  maxVisible?: number;
  className?: string;
  onClick?: (value: React.ReactNode) => void;
}

export function TableTags(props: TableTagsProps) {
  const { data, maxVisible = 2, className, onClick } = props;
  const tags = _.compact(data) as React.ReactNode[];
  if (_.isEmpty(tags)) return null;

  const visibleTags = tags.slice(0, maxVisible);
  const restTags = tags.slice(maxVisible);

  return (
    <div className={`fc-table-tags ${className || ''}`}>
      {_.map(visibleTags, (tag, index) => (
        <Tooltip key={`${tag}-${index}`} title={tag}>
          <Tag
            className='fc-table-tag'
            onClick={() => {
              onClick?.(tag);
            }}
          >
            <span>{tag}</span>
          </Tag>
        </Tooltip>
      ))}
      {!_.isEmpty(restTags) && (
        <Popover
          overlayClassName='fc-table-tags-popover'
          content={
            <div className='fc-table-tags-popover-content'>
              {_.map(restTags, (tag, index) => (
                <Tag
                  key={`${tag}-${index}`}
                  className='fc-table-tag'
                  onClick={() => {
                    onClick?.(tag);
                  }}
                >
                  <span>{tag}</span>
                </Tag>
              ))}
            </div>
          }
        >
          <Tag className='fc-table-tag fc-table-tag-more'>+{restTags.length}</Tag>
        </Popover>
      )}
    </div>
  );
}

interface TablePrimaryCellProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}

export function TablePrimaryCell(props: TablePrimaryCellProps) {
  const { primary, secondary } = props;
  return (
    <div className='fc-table-primary-cell'>
      <div className='fc-table-primary-cell-title'>{primary}</div>
      {secondary ? <div className='fc-table-primary-cell-subtitle'>{secondary}</div> : null}
    </div>
  );
}

export function TableUserCell(props: { username?: React.ReactNode; nickname?: React.ReactNode }) {
  const { username, nickname } = props;
  return (
    <div className='fc-table-user-cell'>
      <div>{username || '-'}</div>
      {nickname ? <div className='fc-table-user-cell-nickname'>{nickname}</div> : null}
    </div>
  );
}
