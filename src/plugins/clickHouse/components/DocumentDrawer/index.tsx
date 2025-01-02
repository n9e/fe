import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Drawer } from 'antd';
import i18next from 'i18next';
import MDEditor from '@uiw/react-md-editor';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import document_zh_CN from './document_zh_CN.md';
import document_zh_HK from './document_zh_HK.md';
import document_en_US from './document_en_US.md';
import { NAME_SPACE } from '../../constants';

interface Props {
  darkMode: boolean;
}

function index(props: Props & ModalWrapProps) {
  const { darkMode, visible, destroy } = props;
  const { i18n } = useTranslation();
  const document = {
    zh_CN: document_zh_CN,
    zh_HK: document_zh_HK,
    en_US: document_en_US,
  }[i18n.language];

  return (
    <Drawer width='60%' title={i18next.t(`${NAME_SPACE}:query.document`)} placement='right' onClose={destroy} visible={visible}>
      <div className='builtin-w-md-editor' data-color-mode={darkMode ? 'dark' : 'light'}>
        <MDEditor.Markdown
          source={document}
          rehypeRewrite={(node: any) => {
            if (_.includes(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], node.tagName)) {
              node.children = node.children.filter((item) => item.tagName != 'a');
            }
          }}
        />
      </div>
    </Drawer>
  );
}

export default ModalHOC<Props>(index);
