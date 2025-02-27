import React, { useEffect, useState, useContext } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';

import { CommonStateContext } from '@/App';

import './style.less';

interface Props {
  documentPath: string;
  type?: 'md' | 'iframe';
}

const filenameMap = {
  zh_CN: '',
  zh_HK: '_hk',
  en_US: '_en',
};

export default function index(props: Props) {
  const { i18n } = useTranslation();
  const { darkMode } = useContext(CommonStateContext);
  const { documentPath, type = 'md' } = props;
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(true);
  // 去除 documentPath 结尾的 /
  const realDocumentPath = documentPath.replace(/\/$/, '');

  useEffect(() => {
    if (documentPath && type === 'md') {
      fetch(`${documentPath}/${i18n.language}.md`)
        .then((res) => {
          return res.text();
        })
        .then((res) => {
          setDocument(res);
        });
    }
  }, [documentPath, i18n.language]);

  return (
    <>
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
            src={`${realDocumentPath}${filenameMap[i18n.language]}/?onlyContent`}
            style={{ width: '100%', height: '100%', border: '0 none', visibility: loading ? 'hidden' : 'visible' }}
            onLoad={() => {
              setLoading(false);
            }}
          />
        </Spin>
      )}
    </>
  );
}
