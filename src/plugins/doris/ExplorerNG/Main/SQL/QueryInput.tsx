import React, { useContext } from 'react';
import { Space, Form } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import DocumentDrawer from '@/components/DocumentDrawer';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../../constants';
import QueryInput from '../../components/QueryInput';
import QueryInputAddonAfter from '../../components/QueryInputAddonAfter';

interface Props {
  snapRangeRef: React.MutableRefObject<{
    from?: number;
    to?: number;
  }>;
  executeQuery: () => void;

  queryBuilderPinned: boolean;
  queryBuilderVisible: boolean;
  onLableClick: () => void;
}

export default function QueryInputCpt(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  const { snapRangeRef, executeQuery, queryBuilderPinned, queryBuilderVisible, onLableClick } = props;

  const [focused, setFocused] = React.useState(false);

  return (
    <InputGroupWithFormItem
      className={classNames({
        'doris-sql-input-container-with-builder': queryBuilderVisible,
      })}
      label={
        <Space
          className='cursor-pointer'
          onClick={(e) => {
            e.stopPropagation();
            onLableClick();
          }}
        >
          {t(`${logExplorerNS}:query`)}
          <InfoCircleOutlined
            onClick={(e) => {
              e.stopPropagation();
              DocumentDrawer({
                language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                darkMode,
                title: t('common:document_link'),
                type: 'iframe',
                documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/',
              });
            }}
          />
        </Space>
      }
      addonAfter={<QueryInputAddonAfter executeQuery={executeQuery} />}
    >
      <div
        className={classNames('relative w-full hover:z-10', {
          'z-10': focused,
        })}
      >
        <div
          className={classNames('w-full', {
            absolute: queryBuilderPinned,
          })}
        >
          <Form.Item noStyle name={['query', 'sql']} rules={[{ required: true, message: t(`${logExplorerNS}:query_is_required`) }]}>
            <QueryInput
              onEnterPress={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
              onFocus={() => {
                setFocused(true);
              }}
              onBlur={() => {
                setFocused(false);
              }}
            />
          </Form.Item>
        </div>
      </div>
    </InputGroupWithFormItem>
  );
}
