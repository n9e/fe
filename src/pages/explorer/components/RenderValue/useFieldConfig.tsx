import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { getESIndexPattern, standardizeFieldConfig } from '@/pages/log/IndexPatterns/services';
type IFieldCate = 'elasticsearch';
export default function useFieldConfig(datasourceCate: IFieldCate, id: number): FieldConfigVersion2 | undefined {
  const [fieldConfig, setFieldConfig] = useState<FieldConfigVersion2>();
  useEffect(() => {
    if (datasourceCate === 'elasticsearch') {
      id &&
        getESIndexPattern(id).then((res) => {
          let fieldConfig;
          try {
            fieldConfig = standardizeFieldConfig(JSON.parse(res.fields_format));
          } catch (error) {
            console.error(error);
          }
          setFieldConfig(fieldConfig);
        });
    }
  }, [datasourceCate, id]);
  return fieldConfig;
}
