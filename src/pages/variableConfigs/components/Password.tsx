import React, { useImperativeHandle, forwardRef } from 'react';
import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { RsaEncry } from '@/utils/rsa';
import { RASConfig } from '../types';

interface Props {
  rsaConfig: RASConfig;
  disabled?: boolean;
  value?: string;
  onChange?: (value?: string) => void;
}

function Password(props: Props, ref) {
  const { t } = useTranslation('variableConfigs');
  const { rsaConfig, value, onChange } = props;
  const [disabled, setDisabled] = React.useState(props.disabled !== undefined ? props.disabled : true);
  const [password, setPassword] = React.useState<string>();
  const inputRef = React.useRef<any>(null);

  useImperativeHandle(
    ref,
    () => ({
      validator: () => {
        return disabled;
      },
    }),
    [disabled],
  );

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Input.Password
        ref={inputRef}
        key={disabled ? 'disabled' : 'enabled'}
        visibilityToggle={!disabled}
        value={disabled ? value : password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        disabled={disabled}
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
      ) : (
        <>
          <Button
            ghost
            type='primary'
            onClick={() => {
              setDisabled(true);
              if (password) {
                const rsaPassword = RsaEncry(password, rsaConfig.RSAPublicKey);
                if (rsaPassword) {
                  onChange && onChange(rsaPassword);
                }
              } else {
                onChange && onChange(password);
              }
            }}
          >
            {t('common:btn.ok')}
          </Button>
          <Button
            onClick={() => {
              setDisabled(true);
              onChange && onChange(value);
            }}
          >
            {t('common:btn.cancel')}
          </Button>
        </>
      )}
    </div>
  );
}

export default forwardRef(Password);
