import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import _ from 'lodash';
import { Affix, Button } from 'antd';

import PageLayout from '@/components/pageLayout';

import { NS } from '../../constants';
import Detail from './Detail';

export default function EditWithPageLayout() {
  const { t } = useTranslation(NS);
  const params = useParams<{
    id: string;
  }>();

  return (
    <PageLayout title={t('executions.title')}>
      <div className='n9e'>
        <div className='bg-fc-100 p-4 mb-4'>{params.id && <Detail id={params.id} />}</div>
        {/* <Affix offsetBottom={0}>
          <Link to={`/${NS}-executions`}>
            <Button>{t('common:btn.back')}</Button>
          </Link>
        </Affix> */}
      </div>
    </PageLayout>
  );
}
