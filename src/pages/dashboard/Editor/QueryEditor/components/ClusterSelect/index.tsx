import React, { useContext } from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';

interface IProps {
  cate: string;
  name?: string | string[];
  label?: React.ReactNode;
  datasourceVars?: any[];
}

export default function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { cate, name = 'datasourceValue', label, datasourceVars } = props;
  const { groupedDatasourceList } = useContext(CommonStateContext);

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[
        {
          required: true,
          message: t('query.datasource_msg'),
        },
      ]}
    >
      <Select allowClear placeholder={t('query.datasource_placeholder')} style={{ minWidth: 70 }} dropdownMatchSelectWidth={false}>
        {_.map(datasourceVars, (item, idx) => {
          return (
            <Select.Option value={`\${${item.name}}`} key={`${item.name}_${idx}`}>
              {`\${${item.name}}`}
            </Select.Option>
          );
        })}
        {_.map(groupedDatasourceList[cate], (item) => (
          <Select.Option value={item.id} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
