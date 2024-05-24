import React, { useState } from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Component } from '../../services';
import './style.less';

interface Props {
  components: Component[];
  children: React.ReactNode;
  onSelect: (logoURL: string) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation('builtInComponents');
  const { components, children, onSelect } = props;
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Modal
        width={700}
        visible={visible}
        title={t('logo_picker_title')}
        onCancel={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <div className='n9e-logo-picker-content'>
          {_.map(components, (item) => {
            return (
              <div key={item.id} className='n9e-logo-picker-item'>
                <img
                  key={item.id}
                  src={item.logo}
                  alt={item.ident}
                  onClick={() => {
                    setVisible(false);
                    onSelect(item.logo);
                  }}
                />
              </div>
            );
          })}
        </div>
      </Modal>
      <div
        className='n9e-logo-picker-trigger'
        onClick={() => {
          setVisible(true);
        }}
      >
        {children}
      </div>
    </>
  );
}
