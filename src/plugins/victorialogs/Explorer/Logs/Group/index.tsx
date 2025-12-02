import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Space, Tooltip, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NAME_SPACE, GROUP_DEFAULT_SETTINGS, UNGROUPED_VALUE } from '../../../constants';
import ExpandIcon from '../../../components/ExpandIcon';
import CollapseIcon from '../../../components/CollapseIcon';

import { Data } from '../index';

import GroupItem from './GroupItem';
import SettingsModal from './SettingsModal';

interface Props {
  tabBarExtraContentElement: HTMLDivElement;
  data: Data;
}

export interface Settings {
  group_by_field: string;
  display_fields: string[];
  display_default_field_changed: boolean;
  date_format: string;
}

export default function Group(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { tabBarExtraContentElement, data } = props;
  const [settings, setSettings] = useState<Settings>(GROUP_DEFAULT_SETTINGS);
  const [expandAll, setExpandAll] = useState(true);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const groupedData = useMemo(() => {
    if (settings.group_by_field === UNGROUPED_VALUE) {
      return [
        {
          name: UNGROUPED_VALUE,
          list: data.logs,
        },
      ];
    }
    return _.map(_.groupBy(data.logs, settings.group_by_field), (list, name) => {
      return {
        name,
        list,
      };
    });
  }, [data.version, settings.group_by_field]);

  return (
    <div className='group-view'>
      {createPortal(
        <Space size={4}>
          <Space>
            <span
              style={{
                color: 'var(--fc-text-3)',
              }}
            >
              {t('explorer.total_groups')}:
            </span>
            <strong>{groupedData.length}</strong>
          </Space>
          <Space size={2}>
            <Tooltip placement='bottom' title={expandAll ? t('explorer.collapse_all') : t('explorer.expand_all')}>
              <Button
                size='small'
                type='text'
                icon={expandAll ? <CollapseIcon /> : <ExpandIcon />}
                onClick={() => {
                  setExpandAll(!expandAll);
                }}
              />
            </Tooltip>
            <Button
              size='small'
              type='text'
              icon={<SettingOutlined />}
              onClick={() => {
                setSettingsModalVisible(true);
              }}
            />
          </Space>
        </Space>,
        tabBarExtraContentElement,
      )}
      {_.map(groupedData, (item, index) => {
        return <GroupItem key={item.name} expandAll={expandAll} settings={settings} setSettings={setSettings} item={item} index={index} />;
      })}
      <SettingsModal
        settings={settings}
        setSettings={setSettings}
        settingsModalVisible={settingsModalVisible}
        setSettingsModalVisible={setSettingsModalVisible}
        fields={data.fields}
      />
    </div>
  );
}
