import React, { useState } from 'react';
import { Select, Input, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

export default function HostsSelect(props: Props) {
  const { t } = useTranslation('targets');
  const { value, onChange } = props;
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState<string>();

  return (
    <>
      <Select
        style={{ minWidth: 120, maxWidth: 200 }}
        allowClear
        mode='multiple'
        maxTagCount='responsive'
        open={false}
        onClick={() => {
          setVisible(true);
          setInputValue(value ? _.join(_.split(value, ','), '\n') : '');
        }}
        placeholder={t('hosts_select.placeholder')}
        value={value ? _.split(value, ',') : []}
        onChange={(v) => {
          onChange(_.join(v, ','));
        }}
      />
      <Modal
        title={t('hosts_select.modal_title')}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => {
          const hosts = _.compact(_.map(_.split(inputValue, '\n'), _.trim));
          onChange(_.join(hosts, ','));
          setInputValue('');
          setVisible(false);
        }}
      >
        <Input.TextArea
          autoSize={{
            minRows: 3,
          }}
          placeholder={t('hosts_select.modal_placeholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </Modal>
    </>
  );
}
