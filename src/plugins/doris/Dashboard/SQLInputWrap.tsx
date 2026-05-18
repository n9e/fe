import React, { useContext, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';
import { WandSparkles } from 'lucide-react';

import { CommonStateContext } from '@/App';

interface Props {
  placeholder: string;
  validateBeforeChange: (val: string) => boolean;

  value?: string;
  onChange?: (val: string) => void;
}

export default function SQLInputWrap(props: Props) {
  const { t } = useTranslation();
  const { darkMode } = useContext(CommonStateContext);

  const { placeholder, validateBeforeChange, onChange } = props;

  const [value, setValue] = useState<string>(props.value || '');

  return (
    <SqlMonacoEditor
      maxHeight={200}
      theme={darkMode ? 'dark' : 'light'}
      enableAutocomplete={true}
      enableFormat
      renderFormatButton={() => {
        return (
          <Tooltip title={t('common:format_sql')}>
            <Button size='small' type='text' icon={<WandSparkles size={12} strokeWidth={1} />} />
          </Tooltip>
        );
      }}
      placeholder={placeholder}
      value={value}
      onChange={(val) => {
        setValue(val);
      }}
      onEnter={(val) => {
        if (validateBeforeChange(val)) {
          onChange?.(val);
        }
      }}
      onBlur={(val) => {
        if (validateBeforeChange(val)) {
          onChange?.(val);
        }
      }}
    />
  );
}
