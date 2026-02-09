import React, { useContext } from 'react';
import { Space, Form, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import KQLInput from '@/components/KQLInput';
import DocumentDrawer from '@/components/DocumentDrawer';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import QueryInput from '@/pages/logExplorer/components/QueryInput';

import { NAME_SPACE } from '../../constants';
import QueryInputAddonAfter from '../components/QueryInputAddonAfter';

interface Props {
  snapRangeRef: React.MutableRefObject<{
    from?: number;
    to?: number;
  }>;
  executeQuery: () => void;
}

export default function QueryInputCpt(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  const { snapRangeRef, executeQuery } = props;

  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);

  if (!datasourceValue) return null;

  return (
    <InputGroupWithFormItem
      label={
        <Space>
          {t(`${logExplorerNS}:query`)}
          <Tooltip title={t('common:page_help')}>
            <QuestionCircleOutlined
              onClick={() => {
                DocumentDrawer({
                  language: i18n.language,
                  darkMode,
                  title: t('common:page_help'),
                  type: 'iframe',
                  documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/log-analysis/elasticserch/',
                });
              }}
            />
          </Tooltip>
        </Space>
      }
      addonAfter={<QueryInputAddonAfter executeQuery={executeQuery} />}
    >
      <div className='relative'>
        {queryValues?.syntax === 'lucene' ? (
          <Form.Item name={['query', 'query']}>
            <QueryInput
              onEnterPress={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item name={['query', 'query']}>
            <KQLInput
              datasourceValue={datasourceValue}
              query={{
                index: queryValues?.index,
                date_field: queryValues?.date_field,
              }}
              historicalRecords={[]}
              onEnter={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
            />
          </Form.Item>
        )}
      </div>
    </InputGroupWithFormItem>
  );
}
