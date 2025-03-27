import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DocumentDrawer from '@/components/DocumentDrawer';
import { CommonStateContext } from '@/App';

interface Props {
  src: string;
}

export default function HelpLink(props: Props) {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(CommonStateContext);
  const { src } = props;

  return (
    <a
      className='text-12'
      onClick={() => {
        DocumentDrawer({
          language: i18n.language,
          darkMode,
          title: t('common:page_help'),
          type: 'iframe',
          documentPath: src,
        });
      }}
    >
      {t('common:page_help')}
    </a>
  );
}
