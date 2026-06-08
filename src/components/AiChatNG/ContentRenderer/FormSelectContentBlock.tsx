import React from 'react';
import { Button, Select } from 'antd';
import { CheckCircleOutlined, ProfileOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { NAME_SPACE } from '../constants';
import ContentCard from './ContentCard';

type FieldKey = 'busi_group_id' | 'datasource_id' | 'approval' | string;

interface IFormSelectCandidate {
  id: number;
  name: string;
  is_default?: boolean;
  extra?: string;
}

interface IFormSelectField {
  key: FieldKey;
  type?: 'single' | string;
  candidates?: IFormSelectCandidate[];
}

interface IFormSelectPayload {
  skill_name?: string;
  fields?: IFormSelectField[];
}

// approval 结构化确认通道，与后端 aiagent.ApprovalParamKey / ApprovalCandidate* 对齐：
// 写工具执行前弹「确认执行 / 取消」二选一，点击经 action.param.approval 回传数值 ID，
// 下一轮后端零 NLP 直接裁决（id=1 确认，id=2 取消）。
const APPROVAL_FIELD_KEY = 'approval';
const APPROVAL_CANDIDATE_APPROVE = 1;

function safeParsePayload(raw: string): IFormSelectPayload | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return undefined;
    return parsed as IFormSelectPayload;
  } catch {
    return undefined;
  }
}

function getDefaultCandidateId(candidates?: IFormSelectCandidate[]) {
  if (!candidates?.length) return undefined;
  return candidates.find((c) => c.is_default)?.id;
}

function buildContentText(params: { busiGroupName?: string; datasourceName?: string }) {
  const { busiGroupName, datasourceName } = params;
  if (busiGroupName && datasourceName) return `业务组：${busiGroupName} 数据源：${datasourceName}`;
  if (busiGroupName) return `业务组：${busiGroupName}`;
  if (datasourceName) return `数据源：${datasourceName}`;
  return '';
}

export interface IFormSelectConfirmResult {
  param: {
    busi_group_id?: number;
    datasource_id?: number;
    approval?: number;
  };
  content: string;
}

// 默认导出按字段类型分流：含 approval 字段走确认按钮视图，其余走业务组/数据源补全视图。
// 解析放在这里只算一次，子组件各自持有自己的 hooks，避免条件调用 hooks。
export default function FormSelectContentBlock(props: { responseContent: string; onConfirm: (result: IFormSelectConfirmResult) => void }) {
  const payload = React.useMemo(() => safeParsePayload(props.responseContent), [props.responseContent]);
  const approvalField = React.useMemo(() => payload?.fields?.find((f) => f.key === APPROVAL_FIELD_KEY), [payload?.fields]);

  if (approvalField) {
    return <FormApprovalView field={approvalField} onConfirm={props.onConfirm} />;
  }
  return <FormFieldsView payload={payload} onConfirm={props.onConfirm} />;
}

// approval 二选一确认：候选名（含语言）由后端下发，直接作为按钮文案与回传 content。
// 取消按钮在前、确认主按钮靠右，与 antd 弹窗一致；点击后禁用两个按钮防重复提交
// （后端有 Resume 幂等台账兜底，这里只做交互层防抖）。
function FormApprovalView(props: { field: IFormSelectField; onConfirm: (result: IFormSelectConfirmResult) => void }) {
  const { t } = useTranslation(NAME_SPACE);
  const [submitted, setSubmitted] = React.useState(false);
  const candidates = props.field.candidates || [];

  const orderedCandidates = React.useMemo(() => {
    const approve = candidates.find((c) => c.id === APPROVAL_CANDIDATE_APPROVE);
    const rest = candidates.filter((c) => c.id !== APPROVAL_CANDIDATE_APPROVE);
    return approve ? [...rest, approve] : candidates;
  }, [candidates]);

  if (!candidates.length) {
    return <div className='rounded-lg border border-dashed border-fc-200 bg-fc-50 px-4 py-3 text-sm text-hint'>{t('message.unsupported_type', { type: 'form_select' })}</div>;
  }

  return (
    <ContentCard icon={<CheckCircleOutlined />} title={t('form_select.approval_title')}>
      <div className='flex flex-wrap items-center justify-end gap-2'>
        {orderedCandidates.map((c) => (
          <Button
            key={c.id}
            type={c.id === APPROVAL_CANDIDATE_APPROVE ? 'primary' : 'default'}
            disabled={submitted}
            onClick={() => {
              setSubmitted(true);
              props.onConfirm({ param: { approval: c.id }, content: c.name });
            }}
          >
            {c.name}
          </Button>
        ))}
      </div>
    </ContentCard>
  );
}

// 业务组 / 数据源补全（原 form_select 行为）。
function FormFieldsView(props: { payload?: IFormSelectPayload; onConfirm: (result: IFormSelectConfirmResult) => void }) {
  const { t } = useTranslation(NAME_SPACE);
  const { payload } = props;

  const busiGroupField = React.useMemo(() => payload?.fields?.find((f) => f.key === 'busi_group_id'), [payload?.fields]);
  const datasourceField = React.useMemo(() => payload?.fields?.find((f) => f.key === 'datasource_id'), [payload?.fields]);

  const busiGroupOptions = React.useMemo(() => (busiGroupField?.candidates || []).map((c) => ({ value: c.id, label: c.name, raw: c })), [busiGroupField?.candidates]);
  const datasourceOptions = React.useMemo(() => (datasourceField?.candidates || []).map((c) => ({ value: c.id, label: c.name, raw: c })), [datasourceField?.candidates]);

  const [busiGroupId, setBusiGroupId] = React.useState<number | undefined>(() => getDefaultCandidateId(busiGroupField?.candidates));
  const [datasourceId, setDatasourceId] = React.useState<number | undefined>(() => getDefaultCandidateId(datasourceField?.candidates));

  React.useEffect(() => {
    setBusiGroupId(getDefaultCandidateId(busiGroupField?.candidates));
  }, [busiGroupField?.candidates]);

  React.useEffect(() => {
    setDatasourceId(getDefaultCandidateId(datasourceField?.candidates));
  }, [datasourceField?.candidates]);

  const selectedBusiGroupName = React.useMemo(() => busiGroupOptions.find((o) => o.value === busiGroupId)?.label, [busiGroupId, busiGroupOptions]);
  const selectedDatasourceName = React.useMemo(() => datasourceOptions.find((o) => o.value === datasourceId)?.label, [datasourceId, datasourceOptions]);

  const disabled = (!!busiGroupField && !busiGroupId) || (!!datasourceField && !datasourceId) || (!busiGroupField && !datasourceField) || !payload;

  if (!payload || (!busiGroupField && !datasourceField)) {
    return <div className='rounded-lg border border-dashed border-fc-200 bg-fc-50 px-4 py-3 text-sm text-hint'>{t('message.unsupported_type', { type: 'form_select' })}</div>;
  }

  return (
    <ContentCard icon={<ProfileOutlined />} title={t('form_select.title')}>
      <div className='grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-3'>
        {busiGroupField ? (
          <>
            <div className='shrink-0 text-right text-sm text-title'>{t('form_select.busi_group')}</div>
            <Select
              className='w-full min-w-0'
              placeholder={t('form_select.placeholder_select')}
              value={busiGroupId}
              onChange={(value) => setBusiGroupId(value)}
              options={busiGroupOptions}
              showSearch
              optionFilterProp='label'
            />
          </>
        ) : null}

        {datasourceField ? (
          <>
            <div className='shrink-0 text-right text-sm text-title'>{t('form_select.datasource')}</div>
            <Select
              className='w-full min-w-0'
              placeholder={t('form_select.placeholder_select')}
              value={datasourceId}
              onChange={(value) => setDatasourceId(value)}
              options={datasourceOptions}
              showSearch
              optionFilterProp='label'
            />
          </>
        ) : null}
      </div>

      <div className='mt-4 flex justify-end'>
        <Button
          type='primary'
          disabled={disabled}
          onClick={() => {
            const param: { busi_group_id?: number; datasource_id?: number } = {};
            if (busiGroupField && busiGroupId) param.busi_group_id = busiGroupId;
            if (datasourceField && datasourceId) param.datasource_id = datasourceId;

            props.onConfirm({
              param,
              content: buildContentText({
                busiGroupName: selectedBusiGroupName,
                datasourceName: selectedDatasourceName,
              }),
            });
          }}
        >
          {t('form_select.confirm')}
        </Button>
      </div>
    </ContentCard>
  );
}
