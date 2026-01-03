import React from 'react';
import { Tooltip, Button, Form, Space } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { copyToClipBoard } from '@/utils';

import { NAME_SPACE } from '../../constants';
import getFormValuesBySearchParams from '../../utils/getFormValuesBySearchParams';

interface Props {
  tooltip?: string;
  hideIcon?: boolean;
  hideText?: boolean;
}

export default function index(props: Props) {
  const { tooltip, hideIcon, hideText = true } = props;
  const { t } = useTranslation(NAME_SPACE);
  const location = useLocation();
  const form = Form.useFormInstance();

  return (
    <Tooltip title={tooltip || t('share_tip')} placement='left'>
      <Button
        icon={!hideIcon && <ShareAltOutlined />}
        onClick={() => {
          const values = form.getFieldsValue();
          const locationsearch = getFormValuesBySearchParams(values);
          if (locationsearch) {
            copyToClipBoard(`${window.location.origin}${location.pathname}?${locationsearch}&__execute__=true`);
          }
        }}
      >
        {!hideText && t('share_btn')}
      </Button>
    </Tooltip>
  );
}

export function ShareLinkText(props: Props) {
  const { tooltip, hideIcon, hideText = true } = props;
  const { t } = useTranslation(NAME_SPACE);
  const location = useLocation();
  const form = Form.useFormInstance();

  return (
    <Tooltip title={tooltip || t('share_tip')} placement='left'>
      <Space
        onClick={() => {
          const values = form.getFieldsValue();
          const locationsearch = getFormValuesBySearchParams(values);
          if (locationsearch) {
            copyToClipBoard(`${window.location.origin}${location.pathname}?${locationsearch}&__execute__=true`);
          }
        }}
      >
        {!hideIcon && <ShareAltOutlined />}
        {!hideText && t('share_btn')}
      </Space>
    </Tooltip>
  );
}
