import React, { useState, useContext } from 'react';
import { Resizable } from 're-resizable';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import Meta from '@/components/Meta';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NAME_SPACE, SQL_SIDEBAR_CACHE_KEY } from '../../constants';
import QueryBuilder from './QueryBuilder';
import Content from './Content';

interface Props {
  submode: string;
  disabled?: boolean;
  datasourceValue: number;
  executeQuery: () => void;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const form = Form.useFormInstance();
  const { submode, disabled, datasourceValue, executeQuery } = props;
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem(SQL_SIDEBAR_CACHE_KEY) || 200));
  const [executeLoading, setExecuteLoading] = useState(false);

  return (
    <div className='explorer-query-container'>
      <div className='explorer-meta-container rounded-sm'>
        <Resizable
          size={{ width, height: '100%' }}
          enable={{
            right: true,
          }}
          onResizeStop={(e, direction, ref, d) => {
            let curWidth = width + d.width;
            if (curWidth < 200) {
              curWidth = 200;
            }
            setWidth(curWidth);
            localStorage.setItem(SQL_SIDEBAR_CACHE_KEY, curWidth.toString());
          }}
        >
          <Meta
            datasourceCate={DatasourceCateEnum.doris}
            datasourceValue={datasourceValue}
            onTreeNodeClick={(nodeData) => {
              const query = form.getFieldValue(['query']);
              _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} limit 20;`);
              form.setFieldsValue({
                query,
              });
              executeQuery();
            }}
          />
        </Resizable>
      </div>
      <div
        className='explorer-main'
        style={{
          width: `calc(100% - ${width + 8}px)`,
        }}
      >
        <QueryBuilder
          extra={
            <Button type='primary' onClick={executeQuery} disabled={disabled} loading={executeLoading}>
              {t('query.execute')}
            </Button>
          }
          executeQuery={executeQuery}
          datasourceValue={datasourceValue}
          labelInfo={
            <InfoCircleOutlined
              onClick={() => {
                DocumentDrawer({
                  language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                  darkMode,
                  title: t('common:document_link'),
                  type: 'iframe',
                  documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-query-mode-in-doris-discover/',
                });
              }}
            />
          }
        />
        <Content submode={submode} setExecuteLoading={setExecuteLoading} />
      </div>
    </div>
  );
}
