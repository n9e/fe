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
import React, { useContext, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { Alert, Button, Form, Input, InputNumber, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useTranslation } from 'react-i18next';
import { FileText, Terminal, Server, SlidersHorizontal } from 'lucide-react';

import { CommonStateContext } from '@/App';
import { scrollToFirstError } from '@/utils';
import SectionCard, { SectionItem } from '@/pages/alertRules/FormNG/components/SectionCard';

import Editor from './editor';
import hostsFilterModal from './hostsFilterModal';
import VarPanel from './components/VarPanel';
import { SCRIPT_SKELETON } from './constants';

import './style.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const NS = 'alertSelfHealing';

// 校验失败时，把出错字段映射到所在分区，用于自动展开
const FIELD_SECTION_MAP: Record<string, string> = {
  title: 'basic',
  tags: 'basic',
  script: 'script',
  args: 'script',
  hosts: 'target',
  account: 'target',
  batch: 'strategy',
  tolerance: 'strategy',
  timeout: 'strategy',
  pause: 'strategy',
};

// 骨架的标志是 evt() 函数定义；调用处写作 `evt ident`，不会误判成已定义
const hasSkeleton = (editor: any) => _.includes(editor.getValue(), 'evt()');

export interface TplFormHandle {
  getForm: () => FormInstance;
}

interface TplFormProps {
  footer?: React.ReactNode;
  footerRenderToEle?: HTMLElement | null;
  initialValues?: any;
  type?: string;
  bgid?: number;
  onSubmit?: (values: any) => void;
}

export const defaultInitialValues = {
  title: '',
  batch: 0,
  tolerance: 0,
  timeout: 30,
  pause: '',
  script: SCRIPT_SKELETON,
  args: '',
  tags: undefined,
  account: 'root',
  hosts: [],
};

const TplForm = forwardRef<TplFormHandle, TplFormProps>(function TplForm(props, ref) {
  const { t, i18n } = useTranslation('common');
  const { t: tsh } = useTranslation(NS);
  const [form] = Form.useForm();
  const { businessGroup } = useContext(CommonStateContext);
  const aceRef = useRef<any>(null);

  const { initialValues = defaultInitialValues, type = 'tpl', bgid } = props;

  // 分区折叠状态：执行策略默认收起（都是高级项）
  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({
    basic: false,
    script: false,
    target: false,
    strategy: true,
  });

  // 摘要与提示需要的字段
  const hosts = Form.useWatch('hosts', form);
  const titleValue = Form.useWatch('title', form);
  const tagsValue = Form.useWatch('tags', form);
  const scriptValue = Form.useWatch('script', form);
  const argsValue = Form.useWatch('args', form);
  const accountValue = Form.useWatch('account', form);
  const batchValue = Form.useWatch('batch', form);
  const toleranceValue = Form.useWatch('tolerance', form);
  const timeoutValue = Form.useWatch('timeout', form);

  const hostCount = useMemo(() => _.size(_.compact(_.map(_.split(_.trim(hosts || ''), '\n'), (h) => _.trim(h)))), [hosts]);

  const sections: SectionItem[] = useMemo(
    () => [
      { key: 'basic', title: tsh('section.basic_title'), description: tsh('section.basic_desc'), tag: 'core', icon: <FileText size={14} /> },
      { key: 'script', title: tsh('section.script_title'), description: tsh('section.script_desc'), tag: 'core', icon: <Terminal size={14} /> },
      { key: 'target', title: tsh('section.target_title'), description: tsh('section.target_desc'), tag: 'core', icon: <Server size={14} /> },
      { key: 'strategy', title: tsh('section.strategy_title'), description: tsh('section.strategy_desc'), tag: 'optional', icon: <SlidersHorizontal size={14} /> },
    ],
    [i18n.language],
  );

  const basicSummary = useMemo(() => {
    const parts: string[] = [titleValue || tsh('summary.unnamed')];
    if (type === 'tpl') {
      parts.push(_.size(tagsValue) ? tsh('summary.tags_count', { count: _.size(tagsValue) }) : tsh('summary.no_tags'));
    }
    return parts.join(' · ');
  }, [i18n.language, titleValue, tagsValue, type]);

  const scriptSummary = useMemo(() => {
    const lines = scriptValue ? _.size(_.split(scriptValue, '\n')) : 0;
    const argsCount = argsValue ? _.size(_.split(argsValue, ',,')) : 0;
    return [tsh('summary.script_lines', { count: lines }), argsCount ? tsh('summary.args_count', { count: argsCount }) : tsh('summary.no_args')].join(' · ');
  }, [i18n.language, scriptValue, argsValue]);

  const targetSummary = useMemo(() => {
    return [hostCount ? tsh('summary.hosts_count', { count: hostCount }) : tsh('summary.no_hosts'), accountValue || 'root'].join(' · ');
  }, [i18n.language, hostCount, accountValue]);

  const strategySummary = useMemo(() => {
    const concurrency = !batchValue ? tsh('summary.concurrency_full') : batchValue === 1 ? tsh('summary.concurrency_seq') : tsh('summary.concurrency_n', { count: batchValue });
    const tol = toleranceValue ? tsh('summary.tolerance_n', { count: toleranceValue }) : tsh('summary.tolerance_none');
    const to = tsh('summary.timeout', { count: _.isNil(timeoutValue) ? 30 : timeoutValue });
    return [concurrency, tol, to].join(' · ');
  }, [i18n.language, batchValue, toleranceValue, timeoutValue]);

  const handleSubmit = (values) => {
    props.onSubmit?.({
      ...values,
      // 主机列表按行拆分并去掉空行，避免空 textarea 产生 hosts: ['']
      hosts: _.compact(_.map(_.split(_.trim(values.hosts || ''), '\n'), (h) => _.trim(h))),
      // pause 在表单里是数组，统一在此 join，避免各调用页各写一遍
      pause: _.join(values.pause || [], ','),
      // auth_level 无 UI，但后端缺字段会反序列化为 0（=关闭），编辑时须显式回填原值，避免静默清零
      auth_level: values.auth_level ?? initialValues.auth_level ?? 1,
    });
  };

  // 校验失败：展开出错分区后再滚动定位，否则错误项藏在收起的分区里
  const expandErrorSections = (errorFields?: { name: (string | number)[] }[]) => {
    const keys = _.compact(_.map(errorFields, ({ name }) => FIELD_SECTION_MAP[_.toString(name?.[0])]));
    if (keys.length) {
      setSectionCollapsed((prev) => ({ ...prev, ..._.zipObject(keys, _.map(keys, () => false)) }));
    }
  };

  const setCollapsed = (key: string) => (collapsed: boolean) => setSectionCollapsed((prev) => ({ ...prev, [key]: collapsed }));

  // 在脚本编辑器光标处插入文本，并同步回表单
  const insertToEditor = (text: string, position?: { row: number; column: number }) => {
    const editor = aceRef.current;
    if (!editor) return;
    editor.session.insert(position ?? editor.getCursorPosition(), text);
    editor.focus();
    form.setFieldsValue({ script: editor.getValue() });
  };

  // 编辑存量脚本时可能没有 evt() 定义，此时直接插入 "$(evt xxx)" 运行期会 command not found
  // 并静默取到空串，故先补齐骨架再插入
  const handleInsertVar = (text: string) => {
    const editor = aceRef.current;
    if (!editor) return;
    if (!hasSkeleton(editor)) {
      const skeletonRows = _.size(_.split(SCRIPT_SKELETON, '\n'));
      insertToEditor(`${SCRIPT_SKELETON}\n`, { row: 0, column: 0 });
      // 骨架插在开头，原光标会随之下移；若仍落在骨架区内（含从未聚焦的 0,0），
      // 改插到文末，避免变量被塞进 shebang 之前
      if (editor.getCursorPosition().row < skeletonRows) {
        editor.gotoLine(editor.session.getLength(), 0, false);
      }
    }
    insertToEditor(text);
  };

  const handleInsertSkeleton = () => {
    const editor = aceRef.current;
    if (!editor) return;
    // 已有骨架（evt 函数）则不重复插入
    if (hasSkeleton(editor)) return;
    insertToEditor(`${SCRIPT_SKELETON}\n`, { row: 0, column: 0 });
  };

  useImperativeHandle(ref, () => ({
    getForm: () => form,
  }));

  const sectionMap = _.keyBy(sections, 'key') as Record<string, SectionItem>;
  const sectionKeys = _.map(sections, 'key');
  const idxOf = (key: string) => sectionKeys.indexOf(key);

  return (
    <div className='job-tpl-form w-full max-w-[1200px] mx-auto'>
      <Form
        onFinish={handleSubmit}
        onFinishFailed={({ errorFields }) => {
          expandErrorSections(errorFields);
          scrollToFirstError();
        }}
        form={form}
        layout='vertical'
      >
        <Form.Item name='group_id' initialValue={initialValues.group_id} hidden>
          <div />
        </Form.Item>

        {/* 基本信息 */}
        <SectionCard item={sectionMap.basic} index={idxOf('basic')} summary={basicSummary} collapsed={sectionCollapsed.basic} setCollapsed={setCollapsed('basic')}>
          <FormItem
            label={
              <>
                <strong>{t('tpl.title')}</strong>
                {type === 'tpl' ? t('tpl.title.tpl.help') : t('tpl.title.task.help')}
              </>
            }
            name='title'
            initialValue={initialValues.title}
            rules={[{ required: true, message: t('common:required') }]}
          >
            <Input />
          </FormItem>
          {type === 'tpl' ? (
            <FormItem
              label={
                <>
                  <strong>{t('tpl.tags')}</strong>
                  {t('tpl.tags.help')}
                </>
              }
              name='tags'
              initialValue={initialValues.tags}
              className='mb-0'
            >
              <Select mode='tags' open={false} style={{ width: '100%' }} />
            </FormItem>
          ) : null}
        </SectionCard>

        {/* 脚本内容 */}
        <SectionCard className='mt-4' item={sectionMap.script} index={idxOf('script')} summary={scriptSummary} collapsed={sectionCollapsed.script} setCollapsed={setCollapsed('script')}>
          <div className='flex flex-col lg:flex-row gap-4'>
            <div className='flex-1 min-w-0'>
              <FormItem
                label={
                  <>
                    <strong>{t('task.script')}</strong>
                    {t('tpl.script.help')}
                  </>
                }
                name='script'
                initialValue={initialValues.script}
                rules={[{ required: true, message: t('common:required') }]}
              >
                <Editor onLoad={(editor) => (aceRef.current = editor)} />
              </FormItem>
              <FormItem
                label={
                  <span>
                    <strong>{t('task.script.args')}</strong>
                    {t('tpl.args.help')}
                  </span>
                }
                name='args'
                initialValue={initialValues.args}
                className='mb-0'
              >
                <Input />
              </FormItem>
            </div>
            <div className='lg:w-[320px] shrink-0'>
              <VarPanel onInsert={handleInsertVar} onInsertSkeleton={handleInsertSkeleton} />
            </div>
          </div>
        </SectionCard>

        {/* 执行目标 */}
        <SectionCard className='mt-4' item={sectionMap.target} index={idxOf('target')} summary={targetSummary} collapsed={sectionCollapsed.target} setCollapsed={setCollapsed('target')}>
          <Alert className='mb-4' type='info' showIcon message={tsh('prereq.title')} description={tsh('prereq.desc')} />
          <FormItem
            label={
              <div className='flex items-center gap-2'>
                <strong>{t('task.host.label')}</strong>
                <span className='text-soft'>{t('tpl.host.help')}</span>
                <Button
                  type='link'
                  size='small'
                  style={{ padding: 0 }}
                  onClick={() => {
                    hostsFilterModal({
                      group_id: bgid || businessGroup.id!,
                      onOk: (pickedHosts, mode) => {
                        const idents = _.map(pickedHosts, 'ident');
                        // 追加模式下与已填主机合并去重，替换模式下直接覆盖
                        const existing = mode === 'append' ? _.compact(_.split(_.trim(form.getFieldValue('hosts') || ''), '\n')) : [];
                        form.setFieldsValue({ hosts: _.join(_.uniq(_.concat(existing, idents)), '\n') });
                      },
                    });
                  }}
                >
                  {t('tpl.host.filter_btn')}
                </Button>
                {hostCount > 0 && <span className='text-soft text-[12px]'>{tsh('host_count', { count: hostCount })}</span>}
              </div>
            }
            name='hosts'
            initialValue={_.join(initialValues.hosts, '\n')}
            rules={[{ required: type !== 'tpl', message: t('common:required') }]}
          >
            <TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
          </FormItem>
          <FormItem
            label={
              <>
                <strong>{t('task.account')}</strong>
                {t('tpl.account.help')}
              </>
            }
            name='account'
            initialValue={initialValues.account}
            rules={[{ required: true, message: t('common:required') }]}
            className='mb-0'
          >
            <Input />
          </FormItem>
          {accountValue === 'root' && <Alert className='mt-2' type='warning' showIcon message={tsh('account_root_warning')} />}
        </SectionCard>

        {/* 执行策略 */}
        <SectionCard className='mt-4' item={sectionMap.strategy} index={idxOf('strategy')} summary={strategySummary} collapsed={sectionCollapsed.strategy} setCollapsed={setCollapsed('strategy')}>
          <FormItem
            label={
              <>
                <strong>{t('task.batch')}</strong>
                {t('tpl.batch.help')}
              </>
            }
            name='batch'
            initialValue={initialValues.batch}
            rules={[{ required: true, message: t('common:required') }]}
          >
            <InputNumber min={0} />
          </FormItem>
          <FormItem
            label={
              <>
                <strong>{t('task.tolerance')}</strong>
                {t('tpl.tolerance.help')}
              </>
            }
            name='tolerance'
            initialValue={initialValues.tolerance}
            rules={[{ required: true, message: t('common:required') }]}
          >
            <InputNumber min={0} />
          </FormItem>
          <FormItem
            label={
              <>
                <strong>{t('task.timeout')}</strong>
                {t('tpl.timeout.help')}
              </>
            }
            name='timeout'
            initialValue={initialValues.timeout}
          >
            <InputNumber min={0} />
          </FormItem>
          <FormItem
            label={
              <span>
                <strong>{t('task.pause')}</strong>
                {t('tpl.pause.help')}
              </span>
            }
            name='pause'
            initialValue={initialValues.pause ? _.split(initialValues.pause, ',') : []}
            className='mb-0'
          >
            <Select
              mode='multiple'
              options={hosts ? _.map(_.compact(_.split(hosts, '\n')), (item) => ({ label: item, value: item })) : []}
            />
          </FormItem>
        </SectionCard>

        <FormItem className='mt-4'>{props.footer}</FormItem>
      </Form>
    </div>
  );
});

export default TplForm;
