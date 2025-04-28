import React from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import Markdown from '@/components/Markdown';
import categraf_zh_CN from '../../../../../public/docs/categraf/categraf_zh_CN.md';
import categraf_en_US from '../../../../../public/docs/categraf/categraf_en_US.md';
import categraf_zh_HK from '../../../../../public/docs/categraf/categraf_zh_HK.md';
import categraf_ru_RU from '../../../../../public/docs/categraf/categraf_ru_RU.md';

interface Props {
  darkMode: boolean;
}

function index(props: Props & ModalWrapProps) {
  const { darkMode, visible, destroy } = props;
  const { t, i18n } = useTranslation();

  let categrafDoc = categraf_zh_CN;
  if (i18n.language === 'en_US') {
    categrafDoc = categraf_en_US;
  }
  if (i18n.language === 'zh_HK') {
    categrafDoc = categraf_zh_HK;
  }
  if (i18n.language === 'ru_RU') {
    categrafDoc = categraf_ru_RU;
  }

  return (
    <Drawer
      width={800}
      title={t('categraf_doc')}
      placement='right'
      onClose={() => {
        destroy();
      }}
      visible={visible}
    >
      <Markdown content={categrafDoc} darkMode={darkMode} />
    </Drawer>
  );
}

export default ModalHOC<Props>(index);
