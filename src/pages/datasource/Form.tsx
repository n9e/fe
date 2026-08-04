import React, { useState, useEffect, useContext } from 'react';
import { message, Spin, Modal, Space } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import { createGlobalState } from 'react-hooks-global-state';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import BreadCrumb from '@/components/BreadCrumb';
import { CommonStateContext } from '@/App';
import { allCates, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';

import { getDataSourceDetailById, getDataSourceList, submitRequest } from './services';
import Form from './Datasources/Form';
import { helpLinkMap } from './config';
import NextStepModal, { Verification } from './components/NextStepModal';
import './index.less';

export const { useGlobalState } = createGlobalState<{
  saveMode: string;
}>({
  saveMode: 'saveAndTest',
});

/** 保存成功后引导弹窗要展示的最小信息集 */
interface SaveResult {
  id: number;
  name: string;
  verification?: Verification;
}

export default function FormCpt() {
  const { t, i18n } = useTranslation('datasourceManage');
  const { isPlus, reloadDatasourceList } = useContext(CommonStateContext);
  const history = useHistory();
  const params = useParams<{ action: string; type: string; id: string }>();
  const { action } = params;
  const id = action === 'edit' ? params.id : undefined;
  const [type, setType] = useState(action === 'add' ? params.type : '');
  const [data, setData] = useState<any>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [saveMode] = useGlobalState('saveMode');
  const [result, setResult] = useState<SaveResult>();
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
      force_save: saveMode === 'save',
    })
      .then(async (dat) => {
        // 新数据源要立刻进全局列表，否则弹窗里点「探索这些数据」跳过去认不出这个 id
        reloadDatasourceList();

        let resolvedId = _.get(dat, 'id') || data?.id;
        if (!resolvedId) {
          // 旧后端 upsert 不回 id：按 name 回捞（后端强制 name 唯一）
          try {
            resolvedId = _.get(_.find(await getDataSourceList(), { name: values.name }), 'id');
          } catch (e) {
            // 回捞失败不阻断保存结果，降级为提示 + 回列表
          }
        }

        if (resolvedId) {
          setResult({ id: resolvedId, name: values.name, verification: _.get(dat, 'verification') });
          return;
        }
        message.success(action === 'add' ? t('common:success.add') : t('common:success.modify'));
        history.push({ pathname: '/datasources' });
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
    // 依赖 action/id：新增保存成功后弹窗里点「编辑此配置」会 replace 到编辑地址，
    // 但两条路由渲染的是同一个组件、react-router 不会重新挂载，靠这里的依赖变化补上这次拉取。
    // 少了它 data 恒为 undefined，页面会卡在 action==='edit' 的 Spin 分支上出不来。
  }, [action, id]);

  return (
    <PageLayout
      title={
        <Space>
          <BreadCrumb
            size='large'
            crumbs={[
              {
                text: t('title'),
                link: '/datasources',
              },
              {
                text: getCateDisplayLabel(_.find(allCates, { value: type }), i18n.language) || type,
              },
            ]}
          />
        </Space>
      }
      doc={helpLinkMap[type]}
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
      {result && (
        <NextStepModal
          datasourceId={result.id}
          pluginType={type}
          name={result.name}
          mode={action === 'edit' ? 'updated' : 'saved'}
          verification={result.verification}
          onClose={() => {
            setResult(undefined);
            history.push({ pathname: '/datasources' });
          }}
          onContinueAdd={
            action === 'edit'
              ? undefined
              : () => {
                  setResult(undefined);
                  // 带着「打开类型选择」的意图回列表，省掉再点一次「添加」
                  history.push({ pathname: '/datasources', state: { openAddModal: true } });
                }
          }
          onEdit={() => {
            setResult(undefined);
            // 新增页此时已经存过一次，留在原地再提交会撞 name 冲突，必须换成编辑态
            history.replace({ pathname: `/datasources/edit/${type}/${result.id}` });
          }}
        />
      )}
    </PageLayout>
  );
}
