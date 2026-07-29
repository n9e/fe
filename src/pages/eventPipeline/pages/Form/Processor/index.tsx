import React, { useContext, useEffect, useState } from 'react';
import { Card, Space, Form, Select, Tooltip, Modal, Tag } from 'antd';
import { MinusCircleOutlined, CopyOutlined, UpCircleOutlined, DownCircleOutlined, DownOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { IS_PLUS } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';

// @ts-ignore
import PlusProcessor, { options as PlusOptions } from 'plus:/parcels/eventPipeline';

import { NS, getDefaultProcessorConfig, documentPathMap } from '../../../constants';
import { getProcessorSummary } from '../../../components/getProcessorSummary';
import TestModal from '../TestModal';
import Relabel from './Relabel';
import Callback from './Callback';
import EventDrop from './EventDrop';
import AISummary from './AISummary';

interface Props {
  disabled?: boolean;
  fields: FormListFieldData[];
  field: FormListFieldData;
  add: (defaultValue?: any, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
  /** 由父级 Form.List 注入的拖拽手柄（react-sortable-hoc 的 SortableHandle） */
  dragHandle?: React.ReactNode;
  /** 父级校验失败后要求展开的处理器下标；tick 变化即为一次新的展开请求 */
  expandSignal?: { indexes: number[]; tick: number };
  /** 由父级注入的带作用域校验，本卡片只对自己子树里的错误负责 */
  validateForTest?: (prefix?: (string | number)[]) => Promise<unknown>;
}

// 处理器分类，用于类型选择器分组。
// 顺序刻意与新建页顶部场景卡的 SCENARIO_KEYS（降噪 / 富化 / 外呼）对齐——用户刚读完那三条，
// 打开下拉就该看到同样的顺序。「改写事件」排最后：relabel 是门槛最高的一类，不该占首位。
const CATEGORY_ORDER = ['denoise', 'enrich', 'dispatch', 'rewrite', 'other'] as const;
const TYPE_CATEGORY: Record<string, string> = {
  relabel: 'rewrite',
  event_update: 'rewrite',
  event_drop: 'denoise',
  inhibit: 'denoise',
  inhibit_qd: 'denoise',
  label_enrich: 'enrich',
  ai_summary: 'enrich',
  annotation_qd: 'enrich',
  callback: 'dispatch',
  script: 'dispatch',
  event_recover: 'dispatch',
  alert_shot: 'dispatch',
};

export default function NotifyConfig(props: Props) {
  const { t, i18n } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
  const { disabled, fields, field, add, remove, move, dragHandle, expandSignal, validateForTest } = props;
  const [collapsed, setCollapsed] = useState(false);

  // 折叠时卡片内容是 display:none，里面的必填错误既看不见也无法被 scrollToFirstError 定位，
  // 所以校验失败时必须由父级把出错的卡片重新展开，否则点保存表现为「毫无反应」
  useEffect(() => {
    if (expandSignal && _.includes(expandSignal.indexes, field.name)) {
      setCollapsed(false);
    }
  }, [expandSignal?.tick]);

  const resetField = _.omit(field, ['name', 'key']);
  const form = Form.useFormInstance();
  const processorConfig = Form.useWatch(['processors', field.name]);
  const processorType = Form.useWatch(['processors', field.name, 'typ']);

  const availableTypes = _.concat(['relabel', 'event_drop', 'event_update', 'callback', 'ai_summary'], IS_PLUS ? PlusOptions : []);
  const typeLabel = processorType ? t(`processor.options.${processorType}`) : t('processor.title');
  const summaryText = getProcessorSummary(processorType, processorConfig?.config);

  // 整体替换该处理器。setFieldsValue 对数组是整体覆盖，因此能顺带清掉
  // 新类型编辑器挂载时写进 config 的 initialValue，而不是与旧字段合并
  const replaceProcessor = (value: any) => {
    const formValues = _.cloneDeep(form.getFieldsValue());
    _.set(formValues, ['processors', field.name], value);
    form.setFieldsValue(formValues);
  };

  const onTypeChange = (newTyp: string) => {
    // Form.Item 先把新 typ 写进表单才调用这里，Form.useWatch 的值仍是切换前的那次渲染结果，正好当快照
    const snapshot = _.cloneDeep(processorConfig);
    const currentConfig = snapshot?.config;
    // 与「该类型的默认配置」比对来判断用户改没改过。默认值只能取自 getDefaultProcessorConfig，
    // 编辑器里的 initialValue 也引用同一份常量，否则这里会恒为 touched、每次切换都弹确认
    const touched = !_.isEmpty(currentConfig) && !_.isEqual(currentConfig, getDefaultProcessorConfig(snapshot?.typ, t));
    const applyType = () => replaceProcessor({ ...snapshot, typ: newTyp, config: getDefaultProcessorConfig(newTyp, t) });

    if (!touched) {
      applyType();
      return;
    }
    // 此刻新类型的编辑器已经挂载，并把自己的 initialValue（如 ai_summary 的提示词模板、超时）写进了 config。
    // 若放着不管：确认后 applyType 会把 config 整体换成默认值，已挂载的编辑器不会再补 initialValue，必填项变空；
    // 取消则只回退 typ，新写入的字段残留在旧配置里。所以先整体回滚到快照，确认后再一次性写入 typ 与默认 config，
    // 让目标编辑器在 config 就位之后才挂载。
    replaceProcessor(snapshot);
    Modal.confirm({
      title: t('processor.switch_type_confirm'),
      onOk: applyType,
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t('processor.delete_confirm'),
      okButtonProps: { danger: true },
      onOk: () => remove(field.name),
    });
  };

  const title = (
    <div className='flex items-center gap-2 min-w-0 cursor-pointer select-none' onClick={() => setCollapsed((prev) => !prev)}>
      <DownOutlined className='text-soft text-[10px] transition-transform duration-200' style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }} />
      <Tag color='purple' className='mr-0'>
        {field.name + 1}
      </Tag>
      <span className='font-medium shrink-0'>{typeLabel}</span>
      {collapsed && summaryText && <span className='text-soft text-[12px] truncate'>{summaryText}</span>}
    </div>
  );

  return (
    <Card
      key={field.key}
      size='small'
      // 供 scrollToFirstError 按作用域定位到「这张卡片内的」第一个错误项
      data-processor-index={field.name}
      title={title}
      extra={
        !disabled && (
          <Space>
            {dragHandle && <Tooltip title={t('processor.drag_tip')}>{dragHandle}</Tooltip>}
            <Tooltip title={t('processor.copy_tip')}>
              <CopyOutlined onClick={() => add(_.cloneDeep(processorConfig), field.name + 1)} />
            </Tooltip>
            {fields.length > 1 && field.name !== 0 && (
              <Tooltip title={t('processor.move_up')}>
                <UpCircleOutlined onClick={() => move(field.name, field.name - 1)} />
              </Tooltip>
            )}
            {fields.length > 1 && field.name !== fields.length - 1 && (
              <Tooltip title={t('processor.move_down')}>
                <DownCircleOutlined onClick={() => move(field.name, field.name + 1)} />
              </Tooltip>
            )}
            <Tooltip title={t('common:btn.delete')}>
              <MinusCircleOutlined onClick={handleDelete} />
            </Tooltip>
          </Space>
        )
      }
    >
      <div style={{ display: collapsed ? 'none' : undefined }}>
        <Form.Item
          {...resetField}
          name={[field.name, 'typ']}
          label={
            <Space>
              {t('processor.typ')}
              {documentPathMap[processorType] && (
                <a
                  onClick={(event) => {
                    event.stopPropagation();
                    DocumentDrawer({
                      language: i18n.language,
                      darkMode,
                      type: 'iframe',
                      title: t('processor.help_btn'),
                      documentPath: documentPathMap[processorType],
                    });
                  }}
                >
                  {t('processor.help_btn')}
                </a>
              )}
            </Space>
          }
        >
          <Select showSearch optionFilterProp='label' optionLabelProp='label' disabled={disabled} onChange={onTypeChange}>
            {_.map(CATEGORY_ORDER, (category) => {
              const typesInCategory = _.filter(availableTypes, (typ) => (TYPE_CATEGORY[typ] ?? 'other') === category);
              if (_.isEmpty(typesInCategory)) return null;
              return (
                <Select.OptGroup key={category} label={t(`processor.category.${category}`)}>
                  {_.map(typesInCategory, (typ) => (
                    <Select.Option key={typ} value={typ} label={t(`processor.options.${typ}`)}>
                      <div className='leading-tight py-0.5'>
                        <div>{t(`processor.options.${typ}`)}</div>
                        <div className='text-soft text-[12px]'>{t(`processor.options_desc.${typ}`)}</div>
                      </div>
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              );
            })}
          </Select>
        </Form.Item>
        {processorType === 'relabel' && <Relabel field={field} namePath={[field.name, 'config']} prefixNamePath={['processors']} />}
        {processorType === 'callback' && <Callback field={field} namePath={[field.name, 'config']} />}
        {processorType === 'event_update' && <Callback field={field} namePath={[field.name, 'config']} />}
        {processorType === 'event_drop' && <EventDrop field={field} namePath={[field.name, 'config']} />}
        {processorType === 'ai_summary' && <AISummary field={field} namePath={[field.name, 'config']} prefixNamePath={['processors']} />}
        <PlusProcessor processorType={processorType} field={field} />

        <TestModal type='processor' config={processorConfig} onBeforeOpen={validateForTest ? () => validateForTest(['processors', field.name]) : undefined} />
      </div>
    </Card>
  );
}
