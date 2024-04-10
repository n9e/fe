import React, { useState, useEffect, ChangeEventHandler } from 'react';
import { Input, Tooltip } from 'antd';
import { InputRef } from 'antd/lib/input';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { validator } from './utils';
export { generateQueryName } from './utils';
import './locale';

interface Props {
  existingNames?: string[];
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
}

export default function index(props: Props) {
  const { t } = useTranslation('QueryName');
  const { existingNames, value, onChange } = props;
  const inputRef = React.useRef<InputRef>(null);
  const [editabled, setEditabled] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [visible, setVisible] = useState(false);
  const [curVal, setCurVal] = useState(value);
  const [tooltipTitle, setTooltipTitle] = useState();

  useEffect(() => {
    if (value !== curVal) {
      setCurVal(value);
    }
  }, [value]);

  return (
    <>
      {editabled ? (
        <Tooltip
          title={tooltipTitle}
          placement='right'
          visible={visible}
          onVisibleChange={(newVisible) => {
            if (!editabled) {
              setVisible(newVisible);
            }
          }}
        >
          <Input
            ref={inputRef}
            readOnly={!editabled}
            style={{ width: 64 }}
            onPressEnter={(e: any) => {
              setVisible(false);
              setTimeout(() => {
                setEditabled(false);
                validator(e.target.value, value, existingNames)
                  .then(() => {
                    onChange && onChange(e.target.value);
                  })
                  .catch(() => {
                    setCurVal(value);
                  });
              }, 100);
            }}
            onBlur={(e: any) => {
              setVisible(false);
              setTimeout(() => {
                setEditabled(false);
                validator(e.target.value, value, existingNames)
                  .then(() => {
                    onChange && onChange(e.target.value);
                  })
                  .catch(() => {
                    setCurVal(value);
                  });
              }, 100);
            }}
            value={curVal}
            onChange={(e: any) => {
              setCurVal(e.target.value);
              validator(e.target.value, value, existingNames)
                .then(() => {
                  setVisible(false);
                  setTooltipTitle(t('tooltip'));
                })
                .catch((errMsg) => {
                  setVisible(true);
                  setTooltipTitle(errMsg);
                });
            }}
          />
        </Tooltip>
      ) : (
        <Tooltip
          title={t('tooltip')}
          visible={visible1}
          onVisibleChange={(newVisible) => {
            setVisible1(newVisible);
          }}
        >
          <div
            className='ant-input'
            style={{ cursor: 'pointer', minWidth: 32, height: 32 }}
            onClick={() => {
              setVisible1(false);
              setTimeout(() => {
                setEditabled(true);
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 0);
              }, 100);
            }}
          >
            {value}
          </div>
        </Tooltip>
      )}
    </>
  );
}
