import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { NAME_SPACE } from '@/pages/login/constants';

interface Props {
  err: React.ReactNode;
}

export default function CallbackFailed(props: Props) {
  const { t } = useTranslation(NAME_SPACE);

  return (
    <div className='flex justify-center items-center h-full text-center'>
      <div>
        <h1>{t('callback.failed')}</h1>
        <div className='text-sm'>{props.err}</div>
        <div>
          <Link to='/login'>{t('callback.back')}</Link>
        </div>
      </div>
    </div>
  );
}
