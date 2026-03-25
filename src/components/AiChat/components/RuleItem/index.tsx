import React, { ReactNode, useEffect, useState } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './style.less';
import { Form } from 'antd';
import { useRuleFormError } from '@/utils/useHook';

interface IProps {
  step: number;
  title: ReactNode;
  children?: ReactNode;
  showLine?: boolean;
  errorInfo?: string;
  defaultFold?: boolean;
}
import { useContext } from 'react';
import { CommonStateContext } from '@/App';

export default function RuleItem(props: IProps) {
  /** @ts-ignore */
  const { darkMode, isMcDonalds = false } = useContext(CommonStateContext);
  const { t } = useTranslation();
  const { step, title, children, showLine = true, errorInfo, defaultFold = false } = props;

  const [RuleFormError, setRuleFormError] = useRuleFormError();
  const [isFold, setIsFold] = useState<boolean>(defaultFold);

  useEffect(() => {
    setIsFold(defaultFold);
  }, [defaultFold]);

  useEffect(() => {
    if (RuleFormError && document.querySelector(`.customRuleBox[data-step="${step}"] .children .ant-form-item-has-error`)) {
      setIsFold(false);
    }
  }, [RuleFormError]);

  return (
    <div className='customRuleBox' data-step={step}>
      <div className='stepBox'>
        <div className='stepLeft'>
          <div className='count' style={{ color: isMcDonalds ? 'var(--fc-gold-text)' : undefined }}>
            {step}
          </div>
          {!isFold && showLine && <div className='line'></div>}
        </div>
        <div className='stepRight'>
          <div
            className='foldIcon'
            onClick={() => {
              setIsFold(!isFold);
            }}
          >
            {isFold ? <RightOutlined /> : <DownOutlined />}
          </div>
          <div className='content'>
            <div className='title'>{title}</div>
            <div className='children' style={{ display: !isFold ? 'block' : 'none' }}>
              {children}
            </div>
            {errorInfo && <div className='errorInfo'>{errorInfo}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
