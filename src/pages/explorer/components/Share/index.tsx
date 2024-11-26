import React from 'react';
import { Tooltip, Button, Form } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { copyToClipBoard } from '@/utils';
import { getLocationSearchByFormValues } from '../../utils';

interface Props {
  tooltip?: string;
}

export default function index(props: Props) {
  const { tooltip } = props;
  const { t } = useTranslation('explorer');
  const form = Form.useFormInstance();

  return (
    <Tooltip title={tooltip || t('share_tip')} placement='left'>
      <Button
        icon={<ShareAltOutlined />}
        onClick={() => {
          const values = form.getFieldsValue();
          const locationsearch = getLocationSearchByFormValues(values);
          if (locationsearch) {
            copyToClipBoard(locationsearch);
          }
          console.log('locationsearch', locationsearch);
        }}
      />
    </Tooltip>
  );
}
