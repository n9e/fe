import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

import { copy2ClipBoard } from '@/utils';

import { NAME_SPACE } from '../../constants';

import { Data } from './index';

interface Props {
  tabBarExtraContentElement: HTMLDivElement;
  data: Data;
}

export default function JSONCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { tabBarExtraContentElement, data } = props;
  const jsonValue = useMemo(() => {
    try {
      return JSON.stringify(data.logs, null, 4);
    } catch (e) {
      console.error(e);
      return '无法解析';
    }
  }, [data.version]);

  return (
    <div className='json-view'>
      {createPortal(
        <Button
          size='small'
          onClick={() => {
            copy2ClipBoard(jsonValue);
          }}
        >
          {t('explorer.copy_json')}
        </Button>,
        tabBarExtraContentElement,
      )}
      <div className='p-2'>
        <pre>
          <code>{jsonValue}</code>
        </pre>
      </div>
    </div>
  );
}
