import React from 'react';
import { Button, Select } from 'antd';
import { useTranslation } from 'react-i18next';

type FieldKey = 'busi_group_id' | 'datasource_id' | string;

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
  };
  content: string;
}

export default function FormSelectContentBlock(props: { responseContent: string; onConfirm: (result: IFormSelectConfirmResult) => void }) {
  const { t } = useTranslation('AiChat');
  const payload = React.useMemo(() => safeParsePayload(props.responseContent), [props.responseContent]);

  const busiGroupField = React.useMemo(() => payload?.fields?.find((f) => f.key === 'busi_group_id'), [payload?.fields]);
  const datasourceField = React.useMemo(() => payload?.fields?.find((f) => f.key === 'datasource_id'), [payload?.fields]);

  const busiGroupOptions = React.useMemo(
    () => (busiGroupField?.candidates || []).map((c) => ({ value: c.id, label: c.name, raw: c })),
    [busiGroupField?.candidates],
  );
  const datasourceOptions = React.useMemo(
    () => (datasourceField?.candidates || []).map((c) => ({ value: c.id, label: c.name, raw: c })),
    [datasourceField?.candidates],
  );

  const [busiGroupId, setBusiGroupId] = React.useState<number | undefined>(() => getDefaultCandidateId(busiGroupField?.candidates));
  const [datasourceId, setDatasourceId] = React.useState<number | undefined>(() => getDefaultCandidateId(datasourceField?.candidates));

  React.useEffect(() => {
    setBusiGroupId(getDefaultCandidateId(busiGroupField?.candidates));
  }, [busiGroupField?.candidates]);

  React.useEffect(() => {
    setDatasourceId(getDefaultCandidateId(datasourceField?.candidates));
  }, [datasourceField?.candidates]);

  const selectedBusiGroupName = React.useMemo(() => busiGroupOptions.find((o) => o.value === busiGroupId)?.label, [busiGroupId, busiGroupOptions]);
  const selectedDatasourceName = React.useMemo(
    () => datasourceOptions.find((o) => o.value === datasourceId)?.label,
    [datasourceId, datasourceOptions],
  );

  const disabled =
    (!!busiGroupField && !busiGroupId) ||
    (!!datasourceField && !datasourceId) ||
    (!busiGroupField && !datasourceField) ||
    !payload;

  if (!payload || (!busiGroupField && !datasourceField)) {
    return (
      <div className='rounded-lg border border-dashed border-fc-200 bg-fc-50 px-4 py-3 text-sm text-hint'>
        {t('message.unsupported_type', { type: 'form_select' })}
      </div>
    );
  }

  return (
    <div className='rounded-lg border border-fc-200 bg-white px-4 py-3'>
      <div className='text-sm font-medium text-title'>{t('form_select.title')}</div>

      <div className='mt-3 space-y-3'>
        {busiGroupField ? (
          <div className='flex items-center gap-3'>
            <div className='w-20 shrink-0 text-sm text-title'>{t('form_select.busi_group')}</div>
            <Select
              className='min-w-0 flex-1'
              placeholder={t('form_select.placeholder_select')}
              value={busiGroupId}
              onChange={(value) => setBusiGroupId(value)}
              options={busiGroupOptions}
              showSearch
              optionFilterProp='label'
            />
          </div>
        ) : null}

        {datasourceField ? (
          <div className='flex items-center gap-3'>
            <div className='w-20 shrink-0 text-sm text-title'>{t('form_select.datasource')}</div>
            <Select
              className='min-w-0 flex-1'
              placeholder={t('form_select.placeholder_select')}
              value={datasourceId}
              onChange={(value) => setDatasourceId(value)}
              options={datasourceOptions}
              showSearch
              optionFilterProp='label'
            />
          </div>
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
    </div>
  );
}

