import React, { useState } from 'react';
import { Form, Button, Drawer, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { transformationsOptions } from './constant';
import OrganizeFields from './OrganizeFields';
import Merge from './Merge';

export default function index() {
  const [addTransformationDrawerVisible, setAddTransformationDrawerVisible] = useState(false);
  const form = Form.useFormInstance();

  return (
    <div
      className='p2'
      style={{
        border: '1px solid var(--fc-border-color)',
        backgroundColor: 'var(--fc-fill-2)',
      }}
    >
      <Form.List name='transformations'>
        {(fields, { add, remove }) => {
          return (
            <>
              {_.map(fields, (field) => {
                const { name, key, ...resetField } = field;
                const id = form.getFieldValue(['transformations', name, 'id']);
                return (
                  <div key={key}>
                    <Form.Item {...resetField} name={[name, 'id']} hidden />
                    {id === 'organize' && (
                      <Form.Item {...resetField} name={[name, 'options']}>
                        <OrganizeFields
                          field={field}
                          onClose={() => {
                            remove(field.name);
                          }}
                        />
                      </Form.Item>
                    )}
                    {id === 'merge' && (
                      <Form.Item {...resetField} name={[name, 'options']}>
                        <Merge
                          field={field}
                          onClose={() => {
                            remove(field.name);
                          }}
                        />
                      </Form.Item>
                    )}
                  </div>
                );
              })}
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => {
                  setAddTransformationDrawerVisible(true);
                }}
              >
                Add transformation
              </Button>
              <Drawer title='Add transformation' placement='right' width='50%' visible={addTransformationDrawerVisible} onClose={() => setAddTransformationDrawerVisible(false)}>
                <Row gutter={SIZE}>
                  {_.map(transformationsOptions, (item) => {
                    return (
                      <Col
                        span={8}
                        key={item}
                        onClick={() => {
                          add({ id: item, options: {} });
                          setAddTransformationDrawerVisible(false);
                        }}
                      >
                        {item === 'merge' && (
                          <div className='n9e-dashboard-editor-transformationNG-item'>
                            <h3>Merge</h3>
                            <p>Merge multiple series. Values will be combined into one row.</p>
                          </div>
                        )}
                        {item === 'organize' && (
                          <div className='n9e-dashboard-editor-transformationNG-item'>
                            <h3>Organize fields by name</h3>
                            <p>Re-order, hide, or rename fields.</p>
                          </div>
                        )}
                      </Col>
                    );
                  })}
                </Row>
              </Drawer>
            </>
          );
        }}
      </Form.List>
    </div>
  );
}
