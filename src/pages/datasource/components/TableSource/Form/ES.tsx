import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Form, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import { getIndices } from '@/pages/explorer/Elasticsearch/services';
export default function ESForm({ dataSourceId }) {
  const { t } = useTranslation('datasourceManage');
  const [indexList, setIndexList] = useState<string[]>([]);

  useEffect(() => {
    if (!dataSourceId) return;
    getIndices(dataSourceId).then((res) => {
      setIndexList(res);
    });
  }, [dataSourceId]);

  return (
    <Form.Item label={t('auth.index')} name={['resource', 'es_resource', 'index']} rules={[{ required: true, message: t('auth.placeholder') }]}>
      <AutoComplete
        options={indexList.map((i) => ({ label: i, value: i }))}
        placeholder={t('auth.inputplaceholder')}
        filterOption={(input, option: any) => option.value && option.value.indexOf(input) >= 0}
      />
    </Form.Item>
  );
}
