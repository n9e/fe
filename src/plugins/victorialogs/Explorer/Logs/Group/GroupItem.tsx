import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Button, Space, Tag } from 'antd';
import { DownOutlined, UpOutlined, RightOutlined } from '@ant-design/icons';

import { copy2ClipBoard } from '@/utils';

import { NAME_SPACE } from '../../../constants';
import { streamValueFormat, dateValueFormat } from '../../../utils';

import { Settings } from './index';
import RowFields from './RowFields';

interface Props {
  expandAll: boolean;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  item: {
    name: string;
    list: {
      [index: string]: string;
    }[];
  };
  index: number;
}

const ICON_SIZE = 10;

export default function GroupItem(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { expandAll, settings, setSettings, item, index } = props;
  const streamValue = item.name === '__ungrouped__' ? undefined : _.get(item.list[0], settings.group_by_field, '');
  const [expand, setExpand] = useState(expandAll);
  const [expandLogsIndex, setExpandLogsIndex] = useState<number[]>([]);

  useEffect(() => {
    setExpand(expandAll);
  }, [expandAll]);

  return (
    <div className='group-view-item'>
      <div
        className='group-view-item-header flex justify-between n9e-align-items-center pt-2 pb-2'
        onClick={() => {
          setExpand(!expand);
        }}
      >
        <Space>
          <strong>
            <span>{index + 1}. </span>
            <span>
              {item.name === '__ungrouped__'
                ? t('explorer.group_view.ungrouped')
                : t('explorer.group_view.group_by_field', {
                    field: settings.group_by_field,
                  })}
            </span>
            <span>:</span>
          </strong>
          {streamValue && (
            <Tag
              onClick={(e) => {
                e.stopPropagation();
                copy2ClipBoard(streamValueFormat(streamValue));
              }}
            >
              {streamValueFormat(streamValue)}
            </Tag>
          )}
        </Space>
        <Space>
          <span
            style={{
              color: 'var(--fc-text-3)',
            }}
          >
            {item.list.length} {t('explorer.group_view.entries')}
          </span>
          <Button
            size='small'
            type='text'
            icon={expand ? <UpOutlined style={{ fontSize: ICON_SIZE }} /> : <DownOutlined style={{ fontSize: ICON_SIZE }} />}
            onClick={() => {
              setExpand(!expand);
            }}
          />
        </Space>
      </div>
      <div
        className='group-view-item-content'
        style={{
          display: expand ? 'block' : 'none',
        }}
      >
        {_.map(item.list, (log, logIndex) => {
          return (
            <div key={log._time + log._stream_id} className='group-view-row'>
              <div
                className='group-view-row-content'
                onClick={() => {
                  const isLogIndexInExpandLogsIndex = expandLogsIndex.includes(logIndex);
                  const newExpandLogsIndex = isLogIndexInExpandLogsIndex ? expandLogsIndex.filter((index) => index !== logIndex) : [...expandLogsIndex, logIndex];
                  setExpandLogsIndex(newExpandLogsIndex);
                }}
              >
                <div className='group-view-row-content-arrow'>
                  {expandLogsIndex.includes(logIndex) ? <DownOutlined style={{ fontSize: ICON_SIZE }} /> : <RightOutlined style={{ fontSize: ICON_SIZE }} />}
                </div>
                <div className='group-view-row-content-time'>{dateValueFormat(log._time, settings.date_format)}</div>
                <div className='group-view-row-content-msg'>
                  <span>
                    {_.map(settings.display_fields, (item) => {
                      const value = log[item];
                      if (value === undefined) {
                        return null;
                      }
                      return (
                        <span key={item} className='group-view-row-content-msg-item pr-2'>
                          {value}
                        </span>
                      );
                    })}
                  </span>
                </div>
              </div>
              {expandLogsIndex.includes(logIndex) && <RowFields log={log} settings={settings} setSettings={setSettings} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
