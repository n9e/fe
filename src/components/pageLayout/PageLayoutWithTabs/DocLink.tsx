import React from 'react';
import { Button } from 'antd';
import IconFont from '@/components/IconFont';
import { useTranslation } from 'react-i18next';
import { IS_ENT } from '@/utils/constant';

export default function DocLink({ link }: { link: string }) {
  const { t } = useTranslation();
  const href = IS_ENT ? link.replace('https://flashcat.cloud', '') : link;

  return (
    <Button
      className='document-open-button page-layout-header-button'
      size='small'
      type='default'
      icon={<IconFont type='icon-ic_book_one' />}
      href={href}
      target='_blank'
      rel='noopener'
    >
      {t('common:product_document_title')}
    </Button>
  );
}
