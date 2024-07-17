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
  onClose?: (destroy: () => void) => void;
}

function index(props: Props & ModalWrapProps) {
  const { visible, destroy, darkMode, language, title, width = '60%', documentPath, onClose } = props;
  const [document, setDocument] = useState('');

  useEffect(() => {
    if (documentPath) {
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
    </Drawer>
  );
}

export default ModalHOC<Props>(index);
