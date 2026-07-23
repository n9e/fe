import React, { useContext, useState } from 'react';
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

import { NS, DEFAULT_PROCESSOR_CONFIG_MAP, documentPathMap } from '../../../constants';
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
}

// 处理器分类，用于类型选择器分组
const CATEGORY_ORDER = ['rewrite', 'denoise', 'enrich', 'dispatch', 'other'] as const;
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
  const { disabled, fields, field, add, remove, move, dragHandle } = props;
  const [collapsed, setCollapsed] = useState(false);
  const resetField = _.omit(field, ['name', 'key']);
  const form = Form.useFormInstance();
  const processorConfig = Form.useWatch(['processors', field.name]);
  const processorType = Form.useWatch(['processors', field.name, 'typ']);

  const availableTypes = _.concat(['relabel', 'event_drop', 'event_update', 'callback', 'ai_summary'], IS_PLUS ? PlusOptions : []);
  const typeLabel = processorType ? t(`processor.options.${processorType}`) : t('processor.title');
  const summaryText = getProcessorSummary(processorType, processorConfig?.config);

  const applyType = (newTyp: string) => {
    const newConfig = _.cloneDeep(DEFAULT_PROCESSOR_CONFIG_MAP[newTyp]);
    const formValues = _.cloneDeep(form.getFieldsValue());
    _.set(formValues, ['processors', field.name, 'config'], newConfig);
    form.setFieldsValue(formValues);
  };

  const onTypeChange = (newTyp: string) => {
    const currentTyp = processorType;
    const currentConfig = processorConfig?.config;
    const touched = !_.isEmpty(currentConfig) && !_.isEqual(currentConfig, DEFAULT_PROCESSOR_CONFIG_MAP[currentTyp]);
    if (!touched) {
      applyType(newTyp);
      return;
    }
    Modal.confirm({
      title: t('processor.switch_type_confirm'),
      onOk: () => applyType(newTyp),
      onCancel: () => {
        // 取消则把类型回退到切换前，避免配置被清掉
        const formValues = _.cloneDeep(form.getFieldsValue());
        _.set(formValues, ['processors', field.name, 'typ'], currentTyp);
        form.setFieldsValue(formValues);
      },
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

        <TestModal type='processor' config={processorConfig} />
      </div>
    </Card>
  );
}
