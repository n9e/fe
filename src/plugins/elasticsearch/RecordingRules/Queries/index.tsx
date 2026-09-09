import React, { useEffect, useState } from 'react';
import { Col, Form, Row, Select } from 'antd';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { getESClusterInfo } from '@/plugins/elasticsearch/services';

interface Props {
  datasourceValue: number;
  field: any;
  prefixPath: (string | number)[];
}

// 记录规则由 plus 的通用表单按数据源类别加载。本组件只负责 ES SQL 的配置结构，
// 执行仍走 n9e-plus recordx 的通用 QueryData 链路。
export default function ElasticsearchRecordingRuleQuery({ datasourceValue, field, prefixPath }: Props) {
  const { t: tES } = useTranslation('elasticsearch');
  const [supportsSQL, setSupportsSQL] = useState(false);
  const path = [field.name, 'config'];

  useEffect(() => {
    setSupportsSQL(false);
    if (!IS_PLUS || !datasourceValue) return;
    getESClusterInfo({ cate: DatasourceCateEnum.elasticsearch, datasource_id: datasourceValue })
      .then((info) => setSupportsSQL(info?.is_sql_supported ?? false))
      .catch(() => setSupportsSQL(false));
  }, [datasourceValue]);

  if (!supportsSQL) return null;

  return (
    <>
      <Form.Item name={[...prefixPath, ...path, 'sql']} label='SQL' rules={[{ required: true, message: tES('query.sql_required') }]}>
        <SqlMonacoEditor maxHeight={200} enableAutocomplete enableFormat />
      </Form.Item>
      <Row gutter={8}>
        <Col span={12}>
          <Form.Item name={[...prefixPath, ...path, 'keys', 'valueKey']} label={tES('query.advancedSettings.valueKey')} rules={[{ required: true, message: tES('query.advancedSettings.valueKey_required') }]}>
            <Select mode='tags' tokenSeparators={[' ']} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={[...prefixPath, ...path, 'keys', 'labelKey']} label={tES('query.advancedSettings.labelKey')}>
            <Select mode='tags' tokenSeparators={[' ']} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
