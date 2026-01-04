import React, { useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Form } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import ViewSelect from '@/components/ViewSelect';
import { allCates } from '@/components/AdvancedWrap/utils';

import { NAME_SPACE, ENABLED_VIEW_CATES } from './constants';
import { Query, DefaultFormValuesControl } from './types';
import omitUndefinedDeep from './utils/omitUndefinedDeep';

// @ts-ignore
import PlusLogExplorer from 'plus:/parcels/LogExplorer';

interface Props {
  headerContainerMounted?: boolean;
  tabKey: string;
  tabIndex?: number;
  defaultFormValuesControl?: DefaultFormValuesControl;
  viewSelectContainerRef?: React.RefObject<HTMLDivElement>;
  defaultDatasourceCate: string;
  defaultDatasourceValue: number;
}

export default function Explorer(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceList } = useContext(CommonStateContext);
  const history = useHistory();
  const location = useLocation();
  const { headerContainerMounted, tabKey, tabIndex, defaultFormValuesControl, viewSelectContainerRef, defaultDatasourceCate, defaultDatasourceValue } = props;
  const [form] = Form.useForm();
  const datasourceCate = Form.useWatch('datasourceCate', form);
  const datasourceValue = Form.useWatch('datasourceValue', form);

  useEffect(() => {
    if (defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      const searchParams = new URLSearchParams(location.search);
      defaultFormValuesControl.setIsInited();
      form.setFieldsValue({
        ...defaultFormValuesControl.defaultFormValues,
        refreshFlag: searchParams.get('__execute__') ? _.uniqueId('refreshFlag_') : undefined,
      });
    }
  }, []);

  return (
    <div className={`h-full explorer-container-${tabKey}`}>
      <div className='h-full bg-fc-100 border border-fc-300 rounded-sm p-4'>
        <Form form={form} layout='vertical' className='h-full'>
          {headerContainerMounted &&
            viewSelectContainerRef?.current &&
            createPortal(
              <ViewSelect<Query>
                disabled={!_.includes(ENABLED_VIEW_CATES, datasourceCate)}
                page={location.pathname}
                getFilterValuesJSONString={() => {
                  const formValues = form.getFieldsValue();
                  let range = formValues.query?.range;
                  if (moment.isMoment(range?.start) && moment.isMoment(range?.end)) {
                    range = {
                      start: range.start.unix(),
                      end: range.end.unix(),
                    };
                  }
                  const filterValues = {
                    datasourceCate: formValues.datasourceCate,
                    datasourceValue: formValues.datasourceValue,
                    query: {
                      ...formValues.query,
                      range,
                    },
                  };
                  return JSON.stringify(filterValues);
                }}
                renderOptionExtra={(filterValues) => {
                  const { datasourceCate, datasourceValue } = filterValues;
                  return (
                    <div className='flex items-center gap-2'>
                      <img src={_.get(_.find(allCates, { value: datasourceCate }), 'logo')} alt={datasourceCate} className='w-[12px] h-[12px]' />
                      <span>{_.find(datasourceList, { id: datasourceValue })?.name ?? datasourceValue}</span>
                    </div>
                  );
                }}
                onSelect={(filterValues) => {
                  filterValues.datasourceCate = filterValues.datasourceCate || defaultDatasourceCate;
                  filterValues.datasourceValue = filterValues.datasourceValue || defaultDatasourceValue;
                  if (datasourceCate === DatasourceCateEnum.doris) {
                    // 完全重置表单后再设置新值，避免旧值残留
                    form.setFieldsValue({
                      query: undefined,
                    });
                    let range = filterValues.query?.range;
                    if (_.isNumber(range?.start) && _.isNumber(range?.end)) {
                      range = {
                        start: moment.unix(range.start),
                        end: moment.unix(range.end),
                      };
                    }
                    form.setFieldsValue({
                      ...filterValues,
                      range,
                      refreshFlag: _.uniqueId('refreshFlag_'),
                      query: {
                        ...filterValues.query,
                        mode: filterValues.query?.mode || 'query',
                      },
                    });
                  }
                  if (tabIndex === 0) {
                    history.replace({
                      search: `?data_source_name=${filterValues.datasourceCate ?? defaultDatasourceCate}&${filterValues.datasourceValue ?? defaultDatasourceValue}`,
                    });
                  }
                }}
                adjustOldFilterValues={(values) => {
                  if (values) {
                    // 去掉 query 中值为 undefined 的字段
                    const cleanedQuery = omitUndefinedDeep(values.query) || {};
                    return {
                      datasourceCate: values.datasourceCate,
                      datasourceValue: values.datasourceValue,
                      query: cleanedQuery,
                    };
                  }
                  return {};
                }}
              />,
              viewSelectContainerRef.current,
            )}
          <Form.Item name='datasourceCate' hidden>
            <div />
          </Form.Item>
          <Form.Item name='datasourceValue' hidden>
            <div />
          </Form.Item>
          <PlusLogExplorer datasourceCate={datasourceCate} datasourceValue={datasourceValue} defaultFormValuesControl={defaultFormValuesControl} />
        </Form>
      </div>
    </div>
  );
}
