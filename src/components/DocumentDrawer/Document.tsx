import React, { useEffect, useState, useContext } from 'react';
import _ from 'lodash';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';

import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import { DOC_URL_LANG_SUFFIX } from '@/utils/docUrl';

import './style.less';
import renderVariables from './renderVariables';

interface Props {
  documentPath: string;
  type?: 'md' | 'iframe';
  /** 文档里 {{key}} 占位符的替换值，与 DocumentDrawer 保持一致 */
  variables?: Record<string, string | undefined>;
}

export default function index(props: Props) {
  const { i18n } = useTranslation();
  const { darkMode } = useContext(CommonStateContext);
  const { documentPath, type = 'md', variables } = props;
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(true);
  // 去除 documentPath 结尾的 /
  let realDocumentPath = documentPath.replace(/\/$/, '');

  if (type === 'iframe' && IS_ENT) {
    realDocumentPath = realDocumentPath.replace('https://flashcat.cloud', '');
  }

  useEffect(() => {
    if (documentPath && type === 'md') {
      fetch(`${documentPath}/${i18n.language}.md`)
        .then((res) => {
          // 如果获取文档失败，使用 en_US 作为默认语言
          if (res.status === 404) {
            return fetch(`${documentPath}/en_US.md`).then((res) => res.text());
          }
          return res.text();
        })
        .then((res) => {
          setDocument(renderVariables(res, variables));
        })
        .catch(() => {
          // 如果获取文档失败，使用 en_US 作为默认语言
          return fetch(`${documentPath}/en_US.md`)
            .then((res) => res.text())
            .then((res) => {
              setDocument(renderVariables(res, variables));
            });
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
            src={`${realDocumentPath}${DOC_URL_LANG_SUFFIX[i18n.language] || ''}/?onlyContent&theme=${darkMode ? 'dark' : 'light'}`}
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
