import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Drawer, Space, Spin } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import ModalHOC, { ModalWrapProps } from '../ModalHOC';
import Document from './Document';
import './style.less';

export { Document };
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
  const [loading, setLoading] = useState(true);
  // 去除 documentPath 结尾的 /
  const realDocumentPath = documentPath.replace(/\/$/, '');

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
      title={
        <Space>
          {title}
          {type === 'iframe' && (
            <a target='_blank' href={`${realDocumentPath}${filenameMap[language]}`}>
              <ExportOutlined />
            </a>
          )}
        </Space>
      }
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
      {type === 'iframe' && (
        <Spin spinning={loading} wrapperClassName='n9e-document-drawer-iframe-loading'>
          <iframe
            src={`${realDocumentPath}${filenameMap[language]}/?onlyContent`}
            style={{ width: '100%', height: '100%', border: '0 none', visibility: loading ? 'hidden' : 'visible' }}
            onLoad={() => {
              setLoading(false);
            }}
          />
        </Spin>
      )}
    </Drawer>
  );
}

export default ModalHOC<Props>(index);
