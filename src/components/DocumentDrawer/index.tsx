import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Drawer } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import ModalHOC, { ModalWrapProps } from '../ModalHOC';
import './style.less';

interface Props {
  darkMode?: boolean;
  language?: string;
  width?: string | number;
  title: string;
  documentPath: string;
  type?: 'md' | 'iframe';
  onClose?: (destroy: () => void) => void;
}

const filenameMap = {
  zh_CN: '',
  zh_HK: '_hk',
  en_US: '_en',
};

function index(props: Props & ModalWrapProps) {
  const { visible, destroy, darkMode, language = 'zh_CN', title, width = '60%', documentPath, onClose, type = 'md' } = props;
  const [document, setDocument] = useState('');

  useEffect(() => {
    if (documentPath && type === 'md') {
      fetch(`${documentPath}/${language}.md`)
        .then((res) => {
          return res.text();
        })
        .then((res) => {
          setDocument(res);
        });
    }
  }, []);

  return (
    <Drawer
      width={width}
      title={title}
      placement='right'
      onClose={() => {
        if (onClose) {
          onClose(destroy);
        } else {
          destroy();
        }
      }}
      visible={visible}
    >
      {type === 'md' && (
        <div data-color-mode={darkMode ? 'dark' : 'light'}>
          <MDEditor.Markdown
            source={document}
            rehypeRewrite={(node: any) => {
              if (_.includes(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], node.tagName)) {
                node.children = node.children.filter((item) => item.tagName != 'a');
              }
            }}
          />
        </div>
      )}
      {type === 'iframe' && <iframe src={`${documentPath}${filenameMap[language]}?onlyContent`} style={{ width: '100%', height: '100%', border: '0 none' }} />}
    </Drawer>
  );
}

export default ModalHOC<Props>(index);
