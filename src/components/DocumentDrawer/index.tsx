import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Drawer, Space, Spin } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { useTranslation } from 'react-i18next';

import { IS_ENT } from '@/utils/constant';

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
  zIndex?: number;
  onClose?: (destroy: () => void) => void;
}

const filenameMap = {
  zh_CN: '',
  zh_HK: '_hk',
  en_US: '_en',
};

function index(props: Props & ModalWrapProps) {
  const { t } = useTranslation();
  const { visible, destroy, title, width = '60%', documentPath, onClose, type = 'md', zIndex } = props;
  const language = 'zh_CN'; // TODO: 因为文档那边还没有多语言支持，先默认写死为中文
  const darkMode = props.darkMode ?? window.document.body.classList.contains('theme-dark');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(true);
  // 去除 documentPath 结尾的 /
  let realDocumentPath = documentPath.replace(/\/$/, '');

  if (type === 'iframe' && IS_ENT) {
    realDocumentPath = realDocumentPath.replace('https://flashcat.cloud', '');
  }

  useEffect(() => {
    if (documentPath && type === 'md') {
      fetch(`${documentPath}/${language}.md`)
        .then((res) => {
          // 如果获取文档失败，使用 en_US 作为默认语言
          if (res.status === 404) {
            return fetch(`${documentPath}/en_US.md`).then((res) => res.text());
          }
          return res.text();
        })
        .then((res) => {
          setDocument(res);
        })
        .catch(() => {
          // 如果获取文档失败，使用 en_US 作为默认语言
          return fetch(`${documentPath}/en_US.md`)
            .then((res) => res.text())
            .then((res) => {
              setDocument(res);
            });
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
            <a target='_blank' href={`${realDocumentPath}${filenameMap[language]}/`} className='text-[12px]'>
              <Space size={4}>
                {t('common:more_document_link')}
                <ExportOutlined />
              </Space>
            </a>
          )}
        </Space>
      }
      zIndex={zIndex}
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
            src={`${realDocumentPath}${filenameMap[language]}/?onlyContent&theme=${darkMode ? 'dark' : 'light'}`}
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
