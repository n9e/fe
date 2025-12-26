import React, { useMemo } from 'react';
import { Button, Badge, Form } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import _ from 'lodash';

interface Props<FilterValues> {
  disabled?: boolean;
  filterValues?: FilterValues;
  oldFilterValues?: FilterValues;
  adjustOldFilterValues?: (values: any) => FilterValues;
}

export default function DropdownTrigger<FilterValues>(props: Props<FilterValues>) {
  const { disabled, filterValues, oldFilterValues, adjustOldFilterValues } = props;

  const formValues = Form.useWatch([]);

  const showDot = useMemo(() => {
    if (_.isEmpty(filterValues)) return false;
    if (oldFilterValues === undefined) {
      const adjustedOldValues = adjustOldFilterValues ? adjustOldFilterValues(formValues ?? {}) : ({} as FilterValues);
      if (_.isEmpty(adjustedOldValues)) return false;
      return !_.isEqual(adjustedOldValues, filterValues);
    } else {
      if (_.isEmpty(oldFilterValues)) return false;
      return !_.isEqual(oldFilterValues, filterValues);
    }
  }, [filterValues, oldFilterValues, formValues]);

  return (
    <Badge dot={showDot} {..._.omit(props, ['filterValues', 'oldFilterValues', 'adjustOldFilterValues'])}>
      <Button disabled={disabled} icon={<MoreOutlined className='w-[32px]' />} />
    </Badge>
  );
}
