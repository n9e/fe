import React, { useContext, useMemo } from 'react';
import _ from 'lodash';
import { Button, Space, Tooltip } from 'antd';
import { CopyOutlined, EyeFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { copy2ClipBoard } from '@/utils';

import { NAME_SPACE, DEFAULT_DISPLAY_FIELD, UNGROUPED_VALUE } from '../../../constants';
import UnorderedListIcon from '../../../components/UnorderedListIcon';

import { Settings } from './index';

interface Props {
  log: {
    [index: string]: string;
  };
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export default function RowFields(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { log, settings, setSettings } = props;
  const displayFields = useMemo(() => {
    if (!settings.display_default_field_changed) {
      return _.filter(settings.display_fields, (item) => item !== DEFAULT_DISPLAY_FIELD);
    } else {
      return settings.display_fields;
    }
  }, [JSON.stringify(settings.display_fields), settings.display_default_field_changed]);
  const selectedColor = darkMode ? 'var(--fc-primary-color)' : 'var(--fc-red-6-color)';

  return (
    <div className='group-view-row-fields'>
      <table>
        <tbody>
          {_.map(log, (value, key) => {
            return (
              <tr key={key} className='group-view-row-fields-item'>
                <td className='group-view-row-fields-item-controls'>
                  <Space size={0}>
                    <Button
                      size='small'
                      type='text'
                      icon={<CopyOutlined />}
                      onClick={() => {
                        copy2ClipBoard(`${key}: ${value}`);
                      }}
                    />
                    <Tooltip title={_.includes(displayFields, key) ? t('explorer.group_view.hide_field_tip') : t('explorer.group_view.show_field_tip')}>
                      <Button
                        size='small'
                        type='text'
                        icon={
                          <EyeFilled
                            style={{
                              color: _.includes(displayFields, key) ? selectedColor : undefined,
                            }}
                          />
                        }
                        onClick={() => {
                          if (_.includes(settings.display_fields, key)) {
                            let display_fields = _.filter(settings.display_fields, (item) => item !== key);
                            let display_default_field_changed = settings.display_default_field_changed;
                            if (!settings.display_default_field_changed && _.isEqual(settings.display_fields, [DEFAULT_DISPLAY_FIELD])) {
                              display_fields = [DEFAULT_DISPLAY_FIELD];
                              display_default_field_changed = true;
                            } else if (display_fields.length === 0) {
                              display_fields = [DEFAULT_DISPLAY_FIELD];
                              display_default_field_changed = false;
                            }
                            setSettings({
                              ...settings,
                              display_fields,
                              display_default_field_changed,
                            });
                          } else {
                            let display_fields = [...settings.display_fields, key];
                            let display_default_field_changed = settings.display_default_field_changed;
                            if (!settings.display_default_field_changed && _.includes(settings.display_fields, DEFAULT_DISPLAY_FIELD)) {
                              display_fields = _.filter(display_fields, (item) => item !== DEFAULT_DISPLAY_FIELD);
                              display_default_field_changed = true;
                            }
                            setSettings({
                              ...settings,
                              display_fields,
                              display_default_field_changed,
                            });
                          }
                        }}
                      />
                    </Tooltip>
                    <Tooltip title={t('explorer.group_view.group_by_field_icon_tip')}>
                      <Button
                        size='small'
                        type='text'
                        icon={
                          <UnorderedListIcon
                            style={{
                              color: settings.group_by_field === key ? selectedColor : undefined,
                            }}
                          />
                        }
                        onClick={() => {
                          setSettings({
                            ...settings,
                            group_by_field: settings.group_by_field === key ? UNGROUPED_VALUE : key,
                          });
                        }}
                      />
                    </Tooltip>
                  </Space>
                </td>
                <td className='group-view-row-fields-item-key'>{key}</td>
                <td>{value}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
