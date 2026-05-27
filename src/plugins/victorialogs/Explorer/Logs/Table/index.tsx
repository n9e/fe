import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Table as AntTable, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useSize } from 'ahooks';

import getTextWidth from '@/pages/dashboard/Renderer/utils/getTextWidth';

import { toString } from '../../../utils';
import { TABLE_DEFAULT_SETTINGS, DEFAULT_DISPLAY_FIELD } from '../../../constants';
import { Data } from '../index';

import SettingsModal from './SettingsModal';

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

interface Props {
  tabBarExtraContentElement: HTMLDivElement;
  data: Data;
}

export interface Settings {
  customize_columns?: string[];
}

function Table(
  props: Props & {
    height: number;
    settings: Settings;
  },
) {
  const { data, height, settings } = props;

  return (
    <AntTable
      size='small'
      tableLayout='auto'
      showSorterTooltip={false}
      columns={_.map(
        _.filter(data.fields, (item) => {
          if (settings.customize_columns === undefined) return true;
          return _.includes(settings.customize_columns, item);
        }),
        (item) => {
          return {
            title: item,
            dataIndex: item,
            key: item,
            sorter: (a, b) => localeCompareFunc(_.get(a, item, ''), _.get(b, item, '')),
            render: (text) => {
              return (
                <div
                  style={{
                    minWidth: getTextWidth(item) + 4,
                    whiteSpace: item !== DEFAULT_DISPLAY_FIELD ? 'nowrap' : undefined,
                  }}
                >
                  {toString(text)}
                </div>
              );
            },
          };
        },
      )}
      dataSource={data.logs}
      scroll={{
        x: '100%',
        y: `calc(${height}px - 76px)`,
      }}
    />
  );
}

export default function TableWrapper(props: Props) {
  const { tabBarExtraContentElement, data } = props;
  const wrapperElementRef = useRef<HTMLDivElement>(null);
  const wrapperElementSize = useSize(wrapperElementRef);
  const [settings, setSettings] = useState<Settings>(TABLE_DEFAULT_SETTINGS);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  return (
    <div className='table-view' ref={wrapperElementRef}>
      {createPortal(
        <Button
          size='small'
          type='text'
          icon={<SettingOutlined />}
          onClick={() => {
            setSettingsModalVisible(true);
          }}
        />,
        tabBarExtraContentElement,
      )}
      {wrapperElementSize && <Table {...props} height={wrapperElementSize.height} settings={settings} />}
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
