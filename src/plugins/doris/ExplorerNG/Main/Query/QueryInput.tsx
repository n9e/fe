import React, { useContext } from 'react';
import { Space, Form, Popover, Tooltip, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import DocumentDrawer from '@/components/DocumentDrawer';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import QueryInput from '@/pages/logExplorer/components/QueryInput';
import QueryBoxPrefix, { QueryBoxColumn } from '@/components/QueryBoxPrefix';

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
  /** Sits inside the search box at its left end (e.g. the AI trigger). */
  queryExtra?: React.ReactNode;
  /** Hangs under the search box, as wide as it. */
  noticeBanner?: React.ReactNode;
  queryBoxRef?: React.Ref<HTMLDivElement>;
  /** The user committed an edit (blur or Enter); the value the box now holds. */
  onQueryEdit?: (query?: string) => void;
}

export default function QueryInputCpt(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  const { snapRangeRef, executeQuery, defaultSearchField, setDefaultSearchField, queryExtra, noticeBanner, queryBoxRef, onQueryEdit } = props;

  return (
    <QueryBoxColumn className='min-w-0' prefixed={!!queryExtra} below={noticeBanner}>
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
        <QueryBoxPrefix prefix={queryExtra} boxRef={queryBoxRef}>
          <Form.Item
            // With a dock under the box, the row's bottom margin moves to the column's end.
            className={queryExtra ? 'mb-0' : undefined}
            name={['query', 'query']}
          >
            <QueryInput
              onEnterPress={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
              onChange={(next) => onQueryEdit?.(next)}
              enableAddonBefore={defaultSearchField !== undefined}
              leadingExtra={!!queryExtra}
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
                className={classNames('absolute top-[4px] z-10', queryExtra ? 'left-[32px]' : 'left-[4px]')}
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
        </QueryBoxPrefix>
      </InputGroupWithFormItem>
    </QueryBoxColumn>
  );
}
