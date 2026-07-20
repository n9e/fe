import React from 'react';
import { Button, Select } from 'antd';
import { CheckCircleOutlined, ProfileOutlined } from '@ant-design/icons';
import i18next from 'i18next';
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

// approval 确认通道：对齐后端 aiagent.ApprovalParamKey 与候选 ID（1=确认，2=取消）。
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

function getDefaultCandidateIds(candidates?: IFormSelectCandidate[]) {
  return (candidates || []).filter((c) => c.is_default).map((c) => c.id);
}

function buildContentText(params: { busiGroupName?: string; datasourceName?: string; teamNames?: string[]; scopeName?: string }) {
  const { busiGroupName, datasourceName, teamNames, scopeName } = params;
  const isZh = i18next.language?.startsWith('zh');
  const colon = isZh ? '：' : ': ';
  const separator = isZh ? '、' : ', ';
  const label = (key: string) => i18next.t(`${NAME_SPACE}:form_select.${key}`);
  const parts: string[] = [];
  if (busiGroupName) parts.push(`${label('busi_group')}${colon}${busiGroupName}`);
  if (datasourceName) parts.push(`${label('datasource')}${colon}${datasourceName}`);
  if (teamNames?.length) parts.push(`${label('team')}${colon}${teamNames.join(separator)}`);
  if (scopeName) parts.push(`${label('skill_scope')}${colon}${scopeName}`);
  return parts.join(' ');
}

export interface IFormSelectConfirmResult {
  param: {
    busi_group_id?: number;
    datasource_id?: number;
    team_ids?: number[];
    skill_scope?: number;
    approval?: number;
  };
  content: string;
}

// 含 approval 字段走确认按钮视图，否则走补全视图；拆子组件隔离各自 hooks，避免条件调用 hooks。
export default function FormSelectContentBlock(props: { responseContent: string; onConfirm: (result: IFormSelectConfirmResult) => void }) {
  const payload = React.useMemo(() => safeParsePayload(props.responseContent), [props.responseContent]);
  const approvalField = React.useMemo(() => payload?.fields?.find((f) => f.key === APPROVAL_FIELD_KEY), [payload?.fields]);

  if (approvalField) {
    return <FormApprovalView field={approvalField} onConfirm={props.onConfirm} />;
  }
  return <FormFieldsView payload={payload} onConfirm={props.onConfirm} />;
}

// 候选名（含语言）由后端下发，直接用作按钮文案与回传 content；取消在前、确认主按钮靠右。
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

  const teamField = React.useMemo(() => payload?.fields?.find((f) => f.key === 'team_ids'), [payload?.fields]);
  const teamOptions = React.useMemo(() => (teamField?.candidates || []).map((c) => ({ value: c.id, label: c.name })), [teamField?.candidates]);
  const [teamIds, setTeamIds] = React.useState<number[]>(() => getDefaultCandidateIds(teamField?.candidates));

  React.useEffect(() => {
    setTeamIds(getDefaultCandidateIds(teamField?.candidates));
  }, [teamField?.candidates]);

  const selectedTeamNames = React.useMemo(() => teamOptions.filter((o) => teamIds.includes(o.value)).map((o) => o.label), [teamIds, teamOptions]);

  // 可见范围（创建技能时后端只对管理员下发该字段；候选名与默认值均由后端给出）。
  const scopeField = React.useMemo(() => payload?.fields?.find((f) => f.key === 'skill_scope'), [payload?.fields]);
  const scopeOptions = React.useMemo(() => (scopeField?.candidates || []).map((c) => ({ value: c.id, label: c.name })), [scopeField?.candidates]);
  const [scopeId, setScopeId] = React.useState<number | undefined>(() => getDefaultCandidateId(scopeField?.candidates));

  React.useEffect(() => {
    setScopeId(getDefaultCandidateId(scopeField?.candidates));
  }, [scopeField?.candidates]);

  const selectedScopeName = React.useMemo(() => scopeOptions.find((o) => o.value === scopeId)?.label, [scopeId, scopeOptions]);

  const disabled =
    (!!busiGroupField && !busiGroupId) ||
    (!!datasourceField && !datasourceId) ||
    (!!teamField && !teamIds.length) ||
    (!!scopeField && !scopeId) ||
    (!busiGroupField && !datasourceField && !teamField && !scopeField) ||
    !payload;

  if (!payload || (!busiGroupField && !datasourceField && !teamField && !scopeField)) {
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

        {teamField ? (
          <>
            <div className='shrink-0 text-right text-sm text-title'>{t('form_select.team')}</div>
            <Select
              className='w-full min-w-0'
              mode='multiple'
              placeholder={t('form_select.placeholder_select')}
              value={teamIds}
              onChange={(value) => setTeamIds(value)}
              options={teamOptions}
              showSearch
              optionFilterProp='label'
            />
          </>
        ) : null}

        {scopeField ? (
          <>
            <div className='shrink-0 text-right text-sm text-title'>{t('form_select.skill_scope')}</div>
            <Select className='w-full min-w-0' placeholder={t('form_select.placeholder_select')} value={scopeId} onChange={(value) => setScopeId(value)} options={scopeOptions} />
          </>
        ) : null}
      </div>

      <div className='mt-4 flex justify-end'>
        <Button
          type='primary'
          disabled={disabled}
          onClick={() => {
            const param: IFormSelectConfirmResult['param'] = {};
            if (busiGroupField && busiGroupId) param.busi_group_id = busiGroupId;
            if (datasourceField && datasourceId) param.datasource_id = datasourceId;
            if (teamField && teamIds.length) param.team_ids = teamIds;
            if (scopeField && scopeId) param.skill_scope = scopeId;

            props.onConfirm({
              param,
              content: buildContentText({
                busiGroupName: selectedBusiGroupName,
                datasourceName: selectedDatasourceName,
                teamNames: selectedTeamNames,
                scopeName: selectedScopeName,
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
