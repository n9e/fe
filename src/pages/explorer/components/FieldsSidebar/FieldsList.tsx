import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Tag } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { getFieldLabel } from '../../Elasticsearch/utils';
import Field from './Field';

interface IProps {
  style?: React.CSSProperties;
  fieldsSearch?: string;
  fields: string[];
  type: 'selected' | 'available';
  onSelect?: (field: string) => void;
  onRemove?: (field: string) => void;
  fieldConfig?: any;
  params?: any;
}

export default function FieldsList(props: IProps) {
  const { t } = useTranslation('explorer');
  const { style = {}, fieldsSearch, fields, type, onSelect, onRemove, fieldConfig, params } = props;
  const [expanded, setExpanded] = React.useState<boolean>(true);
  const filteredFields = _.filter(fields, (field) => {
    if (fieldsSearch) {
      const fieldKey = getFieldLabel(field, fieldConfig);
      return fieldKey.indexOf(fieldsSearch) > -1;
    }
    return true;
  });

  if ((!_.isEmpty(filteredFields) && type === 'selected') || type === 'available') {
    return (
      <div
        style={{
          ...style,
        }}
      >
        <div
          className='discover-fields-title'
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <span>
            {expanded ? <DownOutlined /> : <RightOutlined />} {t(`log.${type}`)}
          </span>
          <span>
            <Tag color={fieldsSearch ? '#6C53B1' : ''}>{filteredFields.length}</Tag>
          </span>
        </div>
        {expanded &&
          _.map(filteredFields, (item) => {
            return <Field key={item} item={item} type={type} onSelect={onSelect} onRemove={onRemove} fieldConfig={fieldConfig} params={params} />;
          })}
      </div>
    );
  }
  return null;
}
