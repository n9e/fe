import React, { useContext } from 'react';
import { Button } from 'antd';
import DocumentDrawer from '@/components/DocumentDrawer';
import IconFont from '@/components/IconFont';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';

export const PAGE_DOCUMENT_LABEL_KEY = 'common:document_title';

export function shouldShowPageDocLink(documentPath: string | undefined, isEnt = IS_ENT): documentPath is string {
  return isEnt && !!documentPath;
}

export function getPageDocumentDrawerOptions(documentPath: string, title: string, language: string, darkMode: boolean) {
  return {
    darkMode,
    documentPath,
    language,
    title,
    type: 'iframe' as const,
  };
}

export default function PageDocLink({ link }: { link: string }) {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(CommonStateContext);

  return (
    <Button
      className='document-open-button page-layout-page-doc-button'
      size='small'
      type='link'
      icon={<IconFont type='icon-ic_book_one' />}
      onClick={() => {
        DocumentDrawer(getPageDocumentDrawerOptions(link, t(PAGE_DOCUMENT_LABEL_KEY), i18n.language, darkMode));
      }}
    >
      {t(PAGE_DOCUMENT_LABEL_KEY)}
    </Button>
  );
}
