import React from 'react';
import { Button } from 'antd';
import IconFont from '@/components/IconFont';
import { useTranslation } from 'react-i18next';
import { IS_ENT } from '@/utils/constant';

export const PAGE_DOCUMENT_LABEL_KEY = 'common:document_title';

export function getPageDocumentHref(pageDocumentUrl: string, isEnt = IS_ENT) {
  return isEnt ? pageDocumentUrl.replace('https://flashcat.cloud', '') : pageDocumentUrl;
}

export default function PageDocLink({ link }: { link: string }) {
  const { t } = useTranslation();
  const href = getPageDocumentHref(link);

  return (
    <Button
      className='document-open-button page-layout-page-doc-button'
      size='small'
      type='link'
      icon={<IconFont type='icon-ic_book_one' />}
      href={href}
      target='_blank'
      rel='noopener'
    >
      {t(PAGE_DOCUMENT_LABEL_KEY)}
    </Button>
  );
}
