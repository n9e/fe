import React from 'react';
import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  disabled?: boolean;
  value?: string;
  onChange?: (value?: string) => void;
}

function Password(props: Props) {
  const { t } = useTranslation('variableConfigs');
  const { value, onChange } = props;
  const [disabled, setDisabled] = React.useState(props.disabled !== undefined ? props.disabled : true);
  const [password, setPassword] = React.useState<string>();
  const inputRef = React.useRef<any>(null);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Input.Password
        ref={inputRef}
        key={disabled ? 'disabled' : 'enabled'}
        visibilityToggle={!disabled}
        value={disabled ? value : password}
        onChange={(e) => {
          const val = e.target.value;
          setPassword(e.target.value);
          onChange && onChange(val);
        }}
        disabled={disabled}
        onBlur={() => {
          if (password === '') {
            setDisabled(true);
          }
        }}
      />
      {disabled ? (
        <Button
          onClick={() => {
            setPassword('');
            setDisabled(false);
            setTimeout(() => {
              inputRef.current!.focus({
                cursor: 'start',
              });
            }, 200);
          }}
        >
          {t('resetPassword')}
        </Button>
      ) : null}
    </div>
  );
}

export default Password;
