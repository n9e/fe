import React, { useState, useEffect, useContext } from 'react';
import { message, Spin, Modal, Space } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import { createGlobalState } from 'react-hooks-global-state';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import BreadCrumb from '@/components/BreadCrumb';
import { CommonStateContext } from '@/App';
import { allCates } from '@/components/AdvancedWrap/utils';

import { getDataSourceDetailById, submitRequest } from './services';
import Form from './Datasources/Form';
import { helpLinkMap } from './config';
import './index.less';

export const { useGlobalState } = createGlobalState<{
  saveMode: string;
}>({
  saveMode: 'saveAndTest',
});

export default function FormCpt() {
  const { t } = useTranslation('datasourceManage');
  const { isPlus } = useContext(CommonStateContext);
  const history = useHistory();
  const params = useParams<{ action: string; type: string; id: string }>();
  const { action } = params;
  const id = action === 'edit' ? params.id : undefined;
  const [type, setType] = useState(action === 'add' ? params.type : '');
  const [data, setData] = useState<any>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saveMode] = useGlobalState('saveMode');
  const onFinish = async (values: any) => {
    setSubmitLoading(true);
    // 转换 headers 格式
    if (_.get(values, ['http', 'headers'])) {
      _.set(
        values,
        'http.headers',
        _.transform(
          values?.http?.headers,
          (result, item) => {
            result[item.key] = item.value;
          },
          {},
        ),
      );
    } else if (_.get(values, ['settings', `${type}.headers`])) {
      _.set(
        values,
        ['settings', `${type}.headers`],
        _.transform(
          values?.settings?.[`${type}.headers`],
          (result, item) => {
            result[item.key] = item.value;
          },
          {},
        ),
      );
    }
    return submitRequest({
      ...values,
      plugin_type: type,
      id: data?.id,
      is_enable: data ? undefined : true,
      is_test: true,
      force_save: saveMode === 'save',
    })
      .then(() => {
        message.success(action === 'add' ? t('common:success.add') : t('common:success.modify'));
        setTimeout(() => {
          history.push({
            pathname: '/help/source',
          });
        }, 2000);
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  useEffect(() => {
    if (action === 'edit' && id !== undefined) {
      getDataSourceDetailById(id).then((res: any) => {
        const plugin_type = res.plugin_type;
        if (res?.http?.headers) {
          _.set(res, 'http.headers', _.map(res?.http?.headers, (value, key) => ({ key, value })) || []);
        } else if (_.get(res, ['settings', `${plugin_type}.headers`])) {
          _.set(res, ['settings', `${plugin_type}.headers`], _.map(_.get(res, ['settings', `${plugin_type}.headers`]), (value, key) => ({ key, value })) || []);
        }
        setData(res);
        setType(plugin_type);
      });
    }
  }, []);

  return (
    <PageLayout
      title={
        <Space>
          <BreadCrumb
            size='large'
            crumbs={[
              {
                text: t('title'),
                link: '/help/source',
              },
              {
                text: _.find(allCates, { value: type })?.label || type,
              },
            ]}
          />
          {helpLinkMap[type] && <HelpLink src={helpLinkMap[type]} />}
        </Space>
      }
    >
      <div className='srm'>
        {action === 'edit' && data === undefined ? (
          <Spin spinning={true} />
        ) : (
          <Form
            action={action}
            data={data}
            onFinish={(values, clusterInstance) => {
              if (
                (type === 'prometheus' && !values.cluster_name) ||
                (type === 'elasticsearch' && !values.cluster_name && isPlus) ||
                (type === 'influxdb' && !values.cluster_name) ||
                (type === 'ck' && !values.cluster_name) ||
                (type === 'aliyun-sls' && !values.cluster_name)
              ) {
                Modal.confirm({
                  title: t('form.cluster_confirm'),
                  okText: t('form.cluster_confirm_ok'),
                  cancelText: t('form.cluster_confirm_cancel'),
                  onOk: () => {
                    onFinish(values);
                  },
                  onCancel: () => {
                    if (clusterInstance && clusterInstance.focus) {
                      clusterInstance.focus();
                    }
                  },
                });
              } else {
                onFinish(values);
              }
            }}
            submitLoading={submitLoading}
          />
        )}
      </div>
    </PageLayout>
  );
}
