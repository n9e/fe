import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Select, SelectProps } from 'antd';

import { getContactKeys, Item } from './services';

export default function ContactKeysSelect(props: SelectProps) {
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
    getContactKeys().then((res) => {
      setData(
        _.concat(
          [
            {
              label: 'Phone',
              key: 'phone',
            },
            {
              label: 'Email',
              key: 'email',
            },
          ],
          res,
        ),
      );
    });
  }, []);

  return (
    <Select
      {...(props || {})}
      options={_.map(data, (item) => {
        return {
          label: item.label,
          value: item.key,
        };
      })}
    />
  );
}
