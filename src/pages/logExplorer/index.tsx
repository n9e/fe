import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { Alert } from 'antd';
import { useTranslation, Trans } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import { getDefaultDatasourceValue } from '@/utils';
import PageLayout from '@/components/pageLayout';

import { DEFAULT_DATASOURCE_CATE, ENABLED_VIEW_CATES, NAME_SPACE } from './constants';
import { getLocalItems, setLocalItems } from './utils/getLocalItems';
import { getLocalActiveKey } from './utils/getLocalActiveKey';
import getDefaultDatasourceCate from './utils/getDefaultDatasourceCate';
import Header from './Header';
import Explorer from './Explorer';

export default function index() {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceList, groupedDatasourceList } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const params = queryString.parse(location.search) as { [index: string]: string | null };

  useEffect(() => {
    // mouted 后清空掉所有参数，这里是多 tabs 的设计，url search 只在外部链接进入时生效一次
    history.replace({ pathname: location.pathname });
  }, []);

  const datasourceManagePath = IS_ENT ? '/settings/source/log' : '/datasources';
  const enabledDatasourceTypes = ENABLED_VIEW_CATES.join(', ');

  const defaultDatasourceCate = params['data_source_name'] || getDefaultDatasourceCate(datasourceList, DEFAULT_DATASOURCE_CATE);

  // 如果没有可用的数据源类型，直接提示错误
  if (defaultDatasourceCate === undefined) {
    return (
      <PageLayout title={t('title')} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/'>
        <div className='n9e'>
          <Alert
            showIcon
            className='m-4'
            type='error'
            message={t('no_supported_datasource_types_title')}
            description={
              <Trans
                ns={NAME_SPACE}
                i18nKey='no_supported_datasource_types_desc'
                values={{ types: enabledDatasourceTypes }}
                components={{
                  a: <a href={datasourceManagePath} target='_blank'></a>,
                }}
              />
            }
          />
        </div>
      </PageLayout>
    );
  }

  const defaultDatasourceValue = params['data_source_id'] ? _.toNumber(params['data_source_id']) : getDefaultDatasourceValue(defaultDatasourceCate, groupedDatasourceList);

  const defaultItems = getLocalItems(params, {
    datasourceCate: defaultDatasourceCate,
    datasourceValue: defaultDatasourceValue,
  });
  const [items, setItems] = useState<{ key: string; isInited?: boolean; formValues?: any }[]>(defaultItems);
  const [activeKey, setActiveKey] = useState<string>(getLocalActiveKey(params, defaultItems));

  return (
    <PageLayout
      title={
        <Header
          items={items}
          setItems={setItems}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          defaultDatasourceCate={defaultDatasourceCate}
          defaultDatasourceValue={defaultDatasourceValue}
        />
      }
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/ad-hoc/'
    >
      <div className='n9e'>
        {_.map(items, (item, itemIndex) => {
          return (
            <div key={item.key} className='h-full w-full' style={{ display: item.key === activeKey ? 'block' : 'none' }}>
              <Explorer
                active={item.key === activeKey}
                tabKey={item.key}
                tabIndex={itemIndex}
                defaultFormValuesControl={{
                  isInited: item?.isInited,
                  setIsInited: () => {
                    const newItems = _.map(items, (i) => {
                      if (i.key === item?.key) {
                        return {
                          ...i,
                          isInited: true,
                        };
                      }
                      return i;
                    });
                    setItems(newItems);
                  },
                  defaultFormValues: item?.formValues,
                  setDefaultFormValues: (newValues) => {
                    const newItems = _.map(items, (i) => {
                      if (i.key === item?.key) {
                        return {
                          ...i,
                          isInited: true,
                          formValues: newValues,
                        };
                      }
                      return i;
                    });
                    setLocalItems(newItems);
                    setItems(newItems);
                  },
                }}
              />
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}
