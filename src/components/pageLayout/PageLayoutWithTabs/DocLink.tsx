import React from 'react';
import { Menu, Dropdown, Space, Drawer, Button, Tooltip, Divider } from 'antd';
import DocumentDrawer from '@/components/DocumentDrawer';
import IconFont from '@/components/IconFont';
import { useTranslation } from 'react-i18next';
import { IS_ENT } from '@/utils/constant';

export default function DocLink({ link }: { link: string }) {
  const { t } = useTranslation();
  return (
    <>
      <Divider type='vertical' style={{ margin: '0 0 0 12px' }} />
      <Button
        className='document-open-button'
        type='link'
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
    </>
  );
}
