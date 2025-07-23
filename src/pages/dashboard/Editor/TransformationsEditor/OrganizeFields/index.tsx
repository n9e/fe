import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import OrganizeFields from './OrganizeFields';

export default function index() {
  return (
    <Form.List
      name='transformations'
      initialValue={[
        {
          id: 'organize',
          options: {},
        },
      ]}
    >
      {(fields) => {
        return (
          <>
            {_.map(fields, ({ name, key, ...resetField }) => {
              return (
                <div key={key}>
                  <Form.Item {...resetField} name={[name, 'id']} hidden />
                  <Form.Item {...resetField} name={[name, 'options']}>
                    <OrganizeFields />
                  </Form.Item>
                </div>
              );
            })}
          </>
        );
      }}
    </Form.List>
  );
}
