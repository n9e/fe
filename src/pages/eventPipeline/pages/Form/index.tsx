import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Form, Input, Card, Space, Row, Col, Select, Switch, Button, Affix, Alert } from 'antd';
import { PlusOutlined, HolderOutlined } from '@ant-design/icons';
import { ListFilter, Workflow as WorkflowIcon, FileText } from 'lucide-react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { getTeamInfoList } from '@/services/manage';
import { scrollToFirstError } from '@/utils';
import { KVTags } from '@/components/KVTagSelect';
import SectionCard, { SectionItem } from '@/pages/alertRules/FormNG/components/SectionCard';

import { Item } from '../../types';
import { NS, DEFAULT_VALUES, DOC_URL } from '../../constants';
import { buildWorkflowName } from '../../components/buildWorkflowName';
import Attributes from './Attributes';
import Processor from './Processor';
import TestModal from './TestModal';
import ScenarioTips from '../../components/ScenarioTips';

interface Props {
  disabled?: boolean;
  initialValues?: Item;
  /** 仅新建（非克隆）时展示场景提示卡 */
  showScenarioTips?: boolean;
  onOk?: (values: Item) => void;
  onCancel?: () => void;
}

// 校验失败时把出错字段映射到所在分区，展开后错误项才可见、才能被滚动定位
const FIELD_SECTION_MAP: Record<string, string> = {
  filter_enable: 'filter',
  label_filters: 'filter',
  attribute_filters: 'filter',
  processors: 'processor',
  name: 'basic',
  team_ids: 'basic',
  disabled: 'basic',
  description: 'basic',
};

const DragHandle = SortableHandle(() => <HolderOutlined className='cursor-move text-soft' />);
const SortableItem = SortableElement(({ children }: { children: React.ReactNode }) => <div className='mb-4'>{children}</div>);
const SortableList = SortableContainer(({ children }: { children: React.ReactNode }) => <div>{children}</div>);

const hasKey = (items?: { key?: string }[]) => _.filter(items, (i) => !!i?.key).length;

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NS);
  const { disabled, initialValues, showScenarioTips, onOk, onCancel } = props;
  const [form] = Form.useForm();
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const formValues = Form.useWatch([], form);
  const filterEnable = Form.useWatch(['filter_enable'], form);
  const labelFilters = Form.useWatch(['label_filters'], form);
  const attrFilters = Form.useWatch(['attribute_filters'], form);
  const processors = Form.useWatch(['processors'], form);
  const nameValue = Form.useWatch(['name'], form);
  const disabledValue = Form.useWatch(['disabled'], form);

  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({ filter: false, processor: false, basic: false });

  useEffect(() => {
    form.setFieldsValue(initialValues ?? DEFAULT_VALUES);
  }, []);

  useEffect(() => {
    getTeamInfoList().then((res) => {
      const list = res.dat ?? [];
      setUserGroups(list);
      // 新建（非克隆）且只属于一个团队时，默认选中它，省去新人第一步的卡点
      if (!initialValues && _.isEmpty(form.getFieldValue('team_ids')) && list.length === 1) {
        form.setFieldsValue({ team_ids: [list[0].id] });
      }
    });
  }, []);

  const sections = useMemo<Record<string, SectionItem>>(
    () => ({
      filter: { key: 'filter', title: t('form_section.filter.title'), description: t('form_section.filter.desc'), tag: 'core', icon: <ListFilter size={14} />, helpDoc: { documentPath: DOC_URL } },
      processor: { key: 'processor', title: t('form_section.processor.title'), description: t('form_section.processor.desc'), tag: 'core', icon: <WorkflowIcon size={14} /> },
      basic: { key: 'basic', title: t('form_section.basic.title'), description: t('form_section.basic.desc'), tag: 'default', icon: <FileText size={14} /> },
    }),
    [i18n.language],
  );

  // 分区顺序的唯一来源：SectionCard 头部的圆形序号按它推导，
  // 增删或调整分区时只改上面的 sections，不用再去每个调用点对数字
  const sectionKeys = useMemo(() => _.keys(sections), [sections]);

  const processorTypes = useMemo(() => _.compact(_.map(processors, (p: any) => p?.typ ?? p?.type)), [processors]);
  const processorLabels = useMemo(() => _.map(processorTypes, (typ) => t(`processor.options.${typ}`)), [processorTypes, i18n.language]);

  const hasFilter = !!filterEnable && (hasKey(labelFilters) > 0 || hasKey(attrFilters) > 0);
  const hasDrop = _.includes(processorTypes, 'event_drop');

  const filterSummary = useMemo(() => {
    if (!hasFilter) return t('section_summary.no_filter');
    const parts: string[] = [];
    const lc = hasKey(labelFilters);
    const ac = hasKey(attrFilters);
    if (lc) parts.push(t('section_summary.label_count', { count: lc }));
    if (ac) parts.push(t('section_summary.attr_count', { count: ac }));
    return parts.join(' · ') || t('section_summary.no_filter');
  }, [hasFilter, labelFilters, attrFilters, i18n.language]);

  const processorSummary = useMemo(() => processorLabels.join(' → ') || t('section_summary.processor_count', { count: 0 }), [processorLabels, i18n.language]);

  const basicSummary = useMemo(
    () => [nameValue || t('section_summary.unnamed'), disabledValue ? t('section_summary.disabled') : t('section_summary.enabled')].join(' · '),
    [nameValue, disabledValue, i18n.language],
  );

  // 自动命名：仅当名称为空或仍是上次自动生成值时覆盖，用户手动改过就不再干预
  const lastAutoNameRef = useRef<string>();
  useEffect(() => {
    // 关掉过滤开关后过滤条件仍留在表单里（只是 display:none），此时实际会处理所有告警事件，
    // 名称不能再宣称只处理某个范围，否则与页面上的 no_filter_warning 自相矛盾
    const suggestion = buildWorkflowName(
      { labelFilters: filterEnable ? labelFilters : undefined, attrFilters: filterEnable ? attrFilters : undefined, processorLabels },
      { joiner: t('name_auto.joiner'), arrow: t('name_auto.arrow'), all: t('name_auto.all') },
    );
    if (!suggestion) return;
    const current = form.getFieldValue('name');
    if (current && current !== lastAutoNameRef.current) return;
    if (current !== suggestion) form.setFieldsValue({ name: suggestion });
    lastAutoNameRef.current = suggestion;
  }, [i18n.language, filterEnable, JSON.stringify(labelFilters), JSON.stringify(attrFilters), JSON.stringify(processorLabels)]);

  const expandErrorSections = (errorFields?: { name: (string | number)[] }[]) => {
    const keys = _.compact(_.map(errorFields, ({ name }) => FIELD_SECTION_MAP[_.toString(name?.[0])]));
    if (keys.length) {
      setSectionCollapsed((prev) => ({ ...prev, ..._.zipObject(keys, _.map(keys, () => false)) }));
    }
  };

  return (
    <Form form={form} layout='vertical' disabled={disabled}>
      <Form.Item name='id' hidden>
        <Input />
      </Form.Item>

      <div className='w-full max-w-[1200px] mx-auto'>
        {showScenarioTips && <ScenarioTips />}

        <SectionCard
          item={sections.filter}
          index={sectionKeys.indexOf('filter')}
          summary={filterSummary}
          collapsed={sectionCollapsed.filter}
          setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, filter: collapsed }))}
        >
          {!hasFilter && <Alert className='mb-4' type={hasDrop ? 'warning' : 'info'} showIcon message={t('no_filter_warning')} />}
          <div className='mb-2'>
            <Space>
              <span>{t('filter_enable')}</span>
              <Form.Item name='filter_enable' valuePropName='checked' noStyle>
                <Switch size='small' />
              </Form.Item>
            </Space>
          </div>
          <div style={{ display: filterEnable ? 'block' : 'none' }}>
            <div className='mb-2'>
              <KVTags
                disabled={disabled}
                name={['label_filters']}
                keyLabel={t('label_filters')}
                keyLabelTootip={<Trans ns={NS} i18nKey={`${NS}:label_filters_tip`} components={{ br: <br /> }} />}
                funcName='op'
              />
            </div>
            <Attributes disabled={disabled} name={['attribute_filters']} />
          </div>
        </SectionCard>

        <SectionCard
          className='mt-4'
          item={sections.processor}
          index={sectionKeys.indexOf('processor')}
          summary={processorSummary}
          collapsed={sectionCollapsed.processor}
          setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, processor: collapsed }))}
        >
          <Form.List name='processors'>
            {(fields, { add, remove, move }) => (
              <>
                <SortableList useDragHandle helperClass='row-dragging' onSortEnd={({ oldIndex, newIndex }) => move(oldIndex, newIndex)}>
                  {fields.map((field, idx) => (
                    <SortableItem key={field.key} index={idx}>
                      <Processor disabled={disabled} fields={fields} field={field} add={add} remove={remove} move={move} dragHandle={disabled ? undefined : <DragHandle />} />
                    </SortableItem>
                  ))}
                </SortableList>
                {!disabled && (
                  <Button className='w-full' type='dashed' onClick={() => add(_.cloneDeep(DEFAULT_VALUES.processors[0]))} icon={<PlusOutlined />}>
                    {t('processor.add_btn')}
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </SectionCard>

        <SectionCard
          className='mt-4'
          item={sections.basic}
          index={sectionKeys.indexOf('basic')}
          summary={basicSummary}
          collapsed={sectionCollapsed.basic}
          setCollapsed={(collapsed) => setSectionCollapsed((prev) => ({ ...prev, basic: collapsed }))}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t('common:table.name')} name='name' tooltip={t('name_auto.tip')} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col flex='auto'>
              <Form.Item
                label={t('teams')}
                tooltip={{ title: <Trans ns={NS} i18nKey={`${NS}:teams_tip`} components={{ br: <br /> }} />, overlayClassName: 'ant-tooltip-auto-width' }}
                name='team_ids'
                rules={[{ required: true }]}
              >
                <Select showSearch optionFilterProp='label' mode='multiple' options={_.map(userGroups, (item) => ({ label: item.name, value: item.id }))} />
              </Form.Item>
            </Col>
            <Col flex='none'>
              <Form.Item
                label={t('disabled.form_label')}
                name='disabled'
                valuePropName='checked'
                initialValue={false}
                getValueFromEvent={(checked) => !checked}
                getValueProps={(val) => ({ checked: !val })}
              >
                <Switch size='small' />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t('common:table.note')} name='description' className='mb-0'>
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
          </Form.Item>
        </SectionCard>
      </div>

      {!disabled && (
        <Affix offsetBottom={0}>
          <Card size='small' className='affix-bottom-shadow max-w-[1200px] mx-auto mt-4'>
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  form
                    .validateFields()
                    .then(async (values) => {
                      onOk && onOk(values);
                    })
                    .catch((err) => {
                      // 校验失败的 err 带 errorFields；onOk 里同步抛出的异常没有，不能跟着一起静默掉
                      if (!err?.errorFields) console.error(err);
                      expandErrorSections(err?.errorFields);
                      scrollToFirstError();
                    });
                }}
              >
                {t('common:btn.save')}
              </Button>
              <TestModal type='pipeline' config={formValues} />
              {onCancel ? (
                <Button onClick={onCancel}>{t('common:btn.cancel')}</Button>
              ) : (
                <Link to={`/${NS}`}>
                  <Button>{t('common:btn.back')}</Button>
                </Link>
              )}
            </Space>
          </Card>
        </Affix>
      )}
    </Form>
  );
}
