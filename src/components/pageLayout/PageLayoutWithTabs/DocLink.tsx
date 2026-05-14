import React from 'react';
import { Button } from 'antd';
import DocumentDrawer from '@/components/DocumentDrawer';
import IconFont from '@/components/IconFont';
import { useTranslation } from 'react-i18next';

export default function DocLink({ link }: { link: string }) {
  const { t } = useTranslation();
  return (
    <Button
      className='document-open-button page-layout-header-button'
      size='small'
      type='default'
      icon={<IconFont type='icon-ic_book_one' />}
      onClick={() =>
        DocumentDrawer({
          title: t('common:page_help'),
          type: 'iframe',
          documentPath: link,
        })
      }
    >
      {t('common:document_title')}
    </Button>
  );
}
