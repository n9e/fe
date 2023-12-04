import React, { useState } from 'react';
import _ from 'lodash';
import { Menu, Dropdown, Select } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  notifyTpls: any[];
  value?: string;
  onSelect: (ident?: string) => void;
}

export default function NotifyTplSelect(props: Props) {
  const { t } = useTranslation('alertRules');
  const { notifyTpls, value, onSelect } = props;
  const [selected, setSelected] = useState<string | undefined>(value);

  return (
    <Select
      showSearch
      bordered={false}
      value={selected}
      onChange={(value) => {
        setSelected(value);
        onSelect(value);
      }}
      placeholder={t('extra_config.default_tpl')}
      options={_.map(notifyTpls, (tpl) => {
        return {
          label: tpl.name,
          value: tpl.channel,
        };
        return (
          <Menu.Item
            key={tpl.channel}
            onClick={() => {
              setSelected(tpl.channel);
              onSelect(tpl.channel);
            }}
          >
            {tpl.name}
          </Menu.Item>
        );
      })}
    />
  );
}
