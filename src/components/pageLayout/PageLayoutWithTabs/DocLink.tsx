import React from 'react';
import { Button } from 'antd';
import i18next from 'i18next';
import IconFont from '@/components/IconFont';
import { useTranslation } from 'react-i18next';
import { IS_ENT } from '@/utils/constant';
import { localizeDocUrl } from '@/utils/docUrl';

export const DEFAULT_PRODUCT_DOCUMENT_URL_ENT = '/docs/content/flashcat/overview/';
export const DEFAULT_PRODUCT_DOCUMENT_URL = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/prologue/introduction/';

interface ProductDocumentLinkOptions {
  productDocLink?: string;
  doc?: string;
  siteDocumentUrl?: string;
}

export function getProductDocumentLink({ productDocLink, doc, siteDocumentUrl }: ProductDocumentLinkOptions, isEnt = IS_ENT) {
  return productDocLink || doc || siteDocumentUrl || (isEnt ? DEFAULT_PRODUCT_DOCUMENT_URL_ENT : DEFAULT_PRODUCT_DOCUMENT_URL);
}

export function getProductDocumentHref(pageDocumentUrl: string, isEnt = IS_ENT, language = i18next.language) {
  return isEnt ? pageDocumentUrl.replace('https://flashcat.cloud', '') : localizeDocUrl(pageDocumentUrl, language);
}

export default function DocLink({ link }: { link: string }) {
  const { t, i18n } = useTranslation();
  const href = getProductDocumentHref(link, IS_ENT, i18n.language);

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
