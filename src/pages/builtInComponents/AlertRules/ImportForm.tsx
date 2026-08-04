/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Form, Button, Select, Switch, message, Alert } from 'antd';
import DatasourceValueSelectV2 from '@/pages/alertRules/Form/components/DatasourceValueSelect/V2';
import RuleDropdownSelect, { RuleItemData } from '@/pages/notificationRules/components/RuleDropdownSelect';
import { getItems as getNotificationRules } from '@/pages/notificationRules/services';
import { createRule } from './services';

/**
 * 导入内置告警规则的表单本体，两个宿主共用：
 *   - Import.tsx 的弹窗（集成中心走这条，行为与拆分前一致）
 *   - 数据源引导的模板匹配弹窗，直接内联在「告警规则模板」Tab 里，不再叠第二层弹窗
 *
 * 抽出来是为了让「导入时该怎么处理这批规则」只有一份实现 —— 默认停用、多 cate 守卫、
 * notify_version/notify_rule_ids 处理、id 类字段剔除、失败按规则名汇总 —— 免得两处慢慢漂移。
 */

export interface ImportFormProps {
  /** 模板 JSON 字符串。contextBound 时它会随用户勾选变化，直接在提交时读 prop，不进表单 store */
  data: string;
  busiGroups: any;
  groupedDatasourceList: any;
  reloadGroupedDatasourceList: any;
  datasourceCateOptions: any;
  /** 预绑定数据源（从数据源引导进入时携带），形如 [{ match_type: 0, op: 'in', values: [id] }] */
  initialDatasourceQueries?: { match_type: number; op: string; values: number[] }[];
  /**
   * 上下文已定死：从「某个数据源的模板匹配」进来时，原始 JSON、数据源类型、数据源筛选
   * 三者都由入口决定，不该再摆出来让用户看/改。
   */
  contextBound?: boolean;
  /** 预填业务组：只有一个可选时不必让用户点一次没得选的下拉 */
  initialBgid?: number;
  /**
   * 是否有通知规则查看权限。弹窗宿主经 ModalHOC 渲染在游离节点上，拿不到 CommonStateContext，
   * useIsAuthorized 在那里恒为 false，只能由调用方算好传入。
   * 必填而非可选：漏传会让无权限用户白吃一个 403，交给类型检查兜底。
   */
  notificationRulesAuthorized: boolean;
  /** 提交按钮文案；内联时通常带上条数 */
  submitText?: React.ReactNode;
  submitDisabled?: boolean;
  /**
   * 插在表单字段与提交按钮之间的内容。内联宿主用它放「选哪些规则」的长列表 ——
   * 配置项要在列表之前，否则几十条规则一滚，业务组/通知规则就被埋到底下看不见了。
   */
  beforeSubmit?: React.ReactNode;
  onSuccess?: () => void;
}

/** 从模板 JSON 里推出数据源类型；混了多种 cate 的一批模板不允许一次导入 */
function parseCate(data: string): { derivedCate?: string; multiCate: boolean } {
  try {
    const parsed = JSON.parse(data);
    const dataList = _.isArray(parsed) ? parsed : [parsed];
    const cates = _.union(
      _.map(
        _.filter(dataList, (item) => item.cate !== 'host'),
        (item) => item.cate,
      ),
    );
    if (cates.length === 1) return { derivedCate: cates[0], multiCate: false };
    return { derivedCate: undefined, multiCate: cates.length > 1 };
  } catch (e) {
    return { derivedCate: undefined, multiCate: false };
  }
}

export default function ImportForm(props: ImportFormProps) {
  const { t } = useTranslation('builtInComponents');
  const {
    data,
    busiGroups,
    groupedDatasourceList,
    reloadGroupedDatasourceList,
    datasourceCateOptions,
    initialDatasourceQueries,
    contextBound,
    initialBgid,
    notificationRulesAuthorized,
    submitText,
    submitDisabled,
    beforeSubmit,
    onSuccess,
  } = props;
  const datasourceCates = _.filter(datasourceCateOptions, (item) => !!item.alertRule);
  const [form] = Form.useForm();

  // 派生而非 state：contextBound 时 data 会随勾选变化，放进 state 会和 useMemo 打架
  const { derivedCate, multiCate } = useMemo(() => parseCate(data), [data]);
  const allowSubmit = !multiCate;

  // 通知规则就地选/就地建：导入的规则本来就要发通知，等导完再回头补是多余的一趟
  const [notificationRules, setNotificationRules] = useState<RuleItemData[]>([]);
  const [notificationRulesLoading, setNotificationRulesLoading] = useState(false);
  const fetchNotificationRules = () => {
    // 后端 GET /notify-rules 挂了 /notification-rules 权限点，而 getItems 没设 silence，
    // 无权限时会弹一条全局错误。门控放在函数内部：它还作为 refresh 传给 RuleDropdownSelect，
    // 只拦 useEffect 的话点刷新按钮照样会打出 403。与 alertRules/FormNG/context.tsx 的 ready 一致。
    if (!notificationRulesAuthorized) {
      setNotificationRules([]);
      return;
    }
    setNotificationRulesLoading(true);
    getNotificationRules()
      .then((res) => {
        setNotificationRules(res as unknown as RuleItemData[]);
      })
      .catch(() => {
        setNotificationRules([]);
      })
      .finally(() => {
        setNotificationRulesLoading(false);
      });
  };
  useEffect(() => {
    fetchNotificationRules();
  }, [notificationRulesAuthorized]);

  return (
    <>
      {!allowSubmit && <Alert className='mb-2' message={t('import_to_buisGroup_invaild')} type='error' showIcon />}
      <Form
        layout='vertical'
        form={form}
        initialValues={{
          import: data,
          bgid: initialBgid,
          datasource_cate: derivedCate,
          datasource_queries: initialDatasourceQueries,
          enabled: false,
        }}
        onFinish={(vals) => {
          // contextBound 时模板内容不进表单：它随勾选变化，onFinish 每次渲染重建，读 prop 恒为最新
          const raw = contextBound ? data : vals.import;
          let list: any[] = [];
          try {
            list = JSON.parse(raw);
            if (!_.isArray(list)) {
              list = [list];
            }
            list = _.map(list, (item) => {
              const record = _.omit(item, ['id', 'group_id', 'create_at', 'create_by', 'update_at', 'update_by']);
              return {
                ...record,
                cate: record.cate === 'host' ? 'host' : derivedCate,
                datasource_queries: vals?.datasource_queries,
                disabled: vals.enabled ? 0 : 1,
                notify_version: 1, // 导入内置规则时强制使用通知规则的版本
                // 内置规则自带的通知设置一律丢弃，只认用户在本表单选的（不选就是空）
                notify_rule_ids: vals.notify_rule_ids || [],
              };
            });
          } catch (e) {
            message.error(t('json_msg'));
            return;
          }
          createRule(vals.bgid, list).then((res) => {
            const failed = _.some(res, (val) => !!val);
            if (failed) {
              Modal.error({
                title: t('common:error.clone'),
                content: (
                  <div>
                    {_.map(res, (val, key) => (
                      <div key={key}>
                        {key}: {val}
                      </div>
                    ))}
                  </div>
                ),
              });
            } else {
              message.success(t('common:success.clone'));
              onSuccess?.();
            }
          });
        }}
      >
        {/* 启用是个开关，独占一行太浪费垂直空间，和业务组并排 */}
        <div className='flex gap-3'>
          <Form.Item
            className='flex-1 min-w-0'
            label={t('common:business_group')}
            name='bgid'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch optionFilterProp='children'>
              {_.map(busiGroups, (item) => {
                return (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item className='shrink-0' label={t('common:table.enabled')} name='enabled' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </div>
        {/* 纯展示：值由模板推出，用户改不了，contextBound 时连看都不必看 */}
        <Form.Item label={t('common:datasource.type')} name='datasource_cate' hidden={contextBound || !derivedCate}>
          <Select disabled>
            {_.map(datasourceCates, (item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        {derivedCate && (
          // contextBound 时只隐藏、不卸载：里面是 Form.List，一旦卸载 datasource_queries 就不会
          // 出现在提交值里，数据源预绑定会静默丢失
          <div style={contextBound ? { display: 'none' } : undefined}>
            <DatasourceValueSelectV2 datasourceList={groupedDatasourceList[derivedCate] || []} reloadGroupedDatasourceList={reloadGroupedDatasourceList} />
          </div>
        )}
        <RuleDropdownSelect notificationRules={notificationRules} loading={notificationRulesLoading} refresh={fetchNotificationRules} isAuthorized={notificationRulesAuthorized} />
        {!contextBound && (
          <Form.Item
            label={t('content')}
            name='import'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.TextArea className='code-area' rows={16} />
          </Form.Item>
        )}
        {beforeSubmit}
        <Form.Item className='mb-0'>
          <Button type='primary' htmlType='submit' disabled={!allowSubmit || submitDisabled}>
            {submitText || t('common:btn.import')}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
