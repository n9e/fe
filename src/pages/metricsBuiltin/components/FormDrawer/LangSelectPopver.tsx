import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Popover, Select, Button, Space } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_MAP } from '@/utils/constant';

interface Props {
  otherLangs: string[];
  onOk: (lang: string) => void;
}

export default function LangSelectPopver(props: Props) {
  const { t } = useTranslation();
  const { otherLangs, onOk } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [value, setValue] = useState<string>(_.head(otherLangs) as string);

  useEffect(() => {
    if (visible) {
      setValue(_.head(otherLangs) as string);
    }
  }, [visible]);

  return (
    <Popover
      trigger={['click']}
      visible={visible}
      onVisibleChange={(v) => {
        if (v && !_.isEmpty(otherLangs)) {
          setVisible(true);
        }
        if (!v) {
          setVisible(false);
        }
      }}
      content={
        <Space>
          <Select
            options={_.map(otherLangs, (lang) => ({ label: LANGUAGE_MAP[lang] || lang, value: lang }))}
            value={value}
            onChange={(val) => {
              setValue(val);
            }}
            dropdownMatchSelectWidth={false}
            style={{ width: 100 }}
          />
          <Button
            type='primary'
            onClick={() => {
              onOk(value);
              setVisible(false);
            }}
          >
            {t('common:btn.ok')}
          </Button>
        </Space>
      }
    >
      <Button type='text' size='small' disabled={_.isEmpty(otherLangs)} icon={<PlusCircleOutlined />} />
    </Popover>
  );
}
