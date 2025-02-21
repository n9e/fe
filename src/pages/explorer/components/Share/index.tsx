import React from 'react';
import { Tooltip, Button, Form } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { copyToClipBoard } from '@/utils';
import { getLocationSearchByFormValues } from '../../utils';

interface Props {
  tooltip?: string;
}

export default function index(props: Props) {
  const { tooltip } = props;
  const { t } = useTranslation('explorer');
  const location = useLocation();
  const form = Form.useFormInstance();

  return (
    <Tooltip title={tooltip || t('share_tip')} placement='left'>
      <Button
        icon={<ShareAltOutlined />}
        onClick={() => {
          const values = form.getFieldsValue();
          const locationsearch = getLocationSearchByFormValues(values);
          if (locationsearch) {
            copyToClipBoard(`${window.location.origin}${location.pathname}?${locationsearch}&__execute__=true`);
          }
        }}
      />
    </Tooltip>
  );
}
