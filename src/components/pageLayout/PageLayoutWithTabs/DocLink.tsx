import React from 'react';
import { Button } from 'antd';
import IconFont from '@/components/IconFont';
import { useTranslation } from 'react-i18next';
import { IS_ENT } from '@/utils/constant';

export const PRODUCT_DOCUMENT_URL_ENT = '/docs/content/flashcat/overview/';
export const PRODUCT_DOCUMENT_URL = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/prologue/introduction/';

export function getProductDocumentHref(_pageDocumentUrl?: string, isEnt = IS_ENT) {
  return isEnt ? PRODUCT_DOCUMENT_URL_ENT : PRODUCT_DOCUMENT_URL;
}

export default function DocLink({ link }: { link?: string }) {
  const { t } = useTranslation();
  const href = getProductDocumentHref(link);

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
