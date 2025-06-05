import React from 'react';
import { Form, Space } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import LogQL from '@/components/LogQL';

import AdvancedSettings from '../../components/AdvancedSettings';
import GraphPreview from '../../AlertRule/Queries/GraphPreview';
import { NAME_SPACE, QUERY_KEY } from '../../constants';

interface IProps {
  datasourceValue: number;
  field: any;
  prefixPath: (string | number)[];
  path: (string | number)[];
}

export default function index(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceValue, field, prefixPath } = props;
  const disabled = false;
  const path = [field.name, 'config'];
  const query = Form.useWatch([...prefixPath, 'config']);

  return (
    <>
      <InputGroupWithFormItem label={<Space>{t('query.query')}</Space>}>
        <Form.Item {...field} name={[...path, QUERY_KEY]}>
          <LogQL datasourceCate={NAME_SPACE} datasourceValue={datasourceValue} query={{}} historicalRecords={[]} placeholder={t('query.query_placeholder2')} />
        </Form.Item>
      </InputGroupWithFormItem>
      <AdvancedSettings mode='graph' prefixField={field} prefixName={path} disabled={disabled} expanded />
      <GraphPreview cate={NAME_SPACE} datasourceValue={datasourceValue} query={query} />
    </>
  );
}
