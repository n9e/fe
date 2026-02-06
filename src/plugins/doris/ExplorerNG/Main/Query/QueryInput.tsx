import React, { useContext } from 'react';
import { Space, Form, Popover, Tooltip, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import DocumentDrawer from '@/components/DocumentDrawer';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import QueryInput from '@/pages/logExplorer/components/QueryInput';

import { NAME_SPACE } from '../../../constants';
import { DefaultSearchIcon, UnDefaultSearchIcon } from '../../SideBarNav/FieldsSidebar/DefaultSearchIcon';
import QueryInputAddonAfter from '../../components/QueryInputAddonAfter';

interface Props {
  snapRangeRef: React.MutableRefObject<{
    from?: number;
    to?: number;
  }>;
  executeQuery: () => void;

  defaultSearchField?: string;
  setDefaultSearchField: (field?: string) => void;
}

export default function QueryInputCpt(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  const { snapRangeRef, executeQuery, defaultSearchField, setDefaultSearchField } = props;

  return (
    <InputGroupWithFormItem
      label={
        <Space>
          {t(`${logExplorerNS}:query`)}
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
        </Space>
      }
      addonAfter={<QueryInputAddonAfter executeQuery={executeQuery} />}
    >
      <div className='relative'>
        <Form.Item name={['query', 'query']}>
          <QueryInput
            onEnterPress={() => {
              snapRangeRef.current = {
                from: undefined,
                to: undefined,
              };
              executeQuery();
            }}
            enableAddonBefore={defaultSearchField !== undefined}
          />
        </Form.Item>
        {defaultSearchField && (
          <Popover
            content={
              <Space>
                <span>{t('query.default_search_by_tip')} :</span>
                <span>{defaultSearchField}</span>
                <Tooltip title={t('query.default_search_tip_2')}>
                  <Button
                    icon={<UnDefaultSearchIcon />}
                    size='small'
                    type='text'
                    onClick={() => {
                      setDefaultSearchField?.(undefined);
                    }}
                  />
                </Tooltip>
              </Space>
            }
          >
            <Button
              className='absolute top-[4px] left-[4px] z-10'
              size='small'
              type='text'
              icon={
                <DefaultSearchIcon
                  className='text-[12px]'
                  style={{
                    color: 'var(--fc-primary-color)',
                  }}
                />
              }
            />
          </Popover>
        )}
      </div>
    </InputGroupWithFormItem>
  );
}
