import React from 'react';
import { Form, Radio } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../../constants';

interface Props {
  sqlVizType: string;
  onChange?: (value: string) => void;
}

export default function SqlVizTypeSwitch(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { sqlVizType, onChange } = props;
  const form = Form.useFormInstance();

  return (
    <Radio.Group
      options={[
        { label: t('query.sqlVizType.table'), value: 'table' },
        { label: t('query.sqlVizType.timeseries'), value: 'timeseries' },
      ]}
      optionType='button'
      size='small'
      value={sqlVizType}
      onChange={(e) => {
        form.setFields([{ name: ['query', 'sqlVizType'], value: e.target.value }]);
        onChange?.(e.target.value);
      }}
    />
  );
}
