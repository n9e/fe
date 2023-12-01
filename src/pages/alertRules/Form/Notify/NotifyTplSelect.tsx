import React, { useState } from 'react';
import _ from 'lodash';
import { Menu, Dropdown } from 'antd';
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
    <Dropdown
      trigger={['click']}
      overlay={
        <Menu>
          {_.map(
            _.concat(
              [
                {
                  id: undefined,
                  name: t('extra_config.default_tpl'),
                },
              ],
              notifyTpls,
            ),
            (tpl) => {
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
            },
          )}
        </Menu>
      }
    >
      <a>{selected ? _.get(_.find(notifyTpls, { channel: selected }), 'name', selected) : t('extra_config.default_tpl')}</a>
    </Dropdown>
  );
}
