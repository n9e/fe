import React, { useState } from 'react';
import { Form, Button, Drawer, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';

import { transformationsOptions } from './constant';
import Organize from './Organize';
import Merge from './Merge';
import JoinByField from './JoinByField';

export default function index() {
  const { t } = useTranslation('dashboard');
  const form = Form.useFormInstance();
  const [addTransformationDrawerVisible, setAddTransformationDrawerVisible] = useState(false);

  return (
    <div
      className='p2'
      style={{
        border: '1px solid var(--fc-border-color)',
        backgroundColor: 'var(--fc-fill-2)',
      }}
    >
      <Form.List name='transformationsNG'>
        {(fields, { add, remove }) => {
          return (
            <>
              {_.map(fields, (field) => {
                const { name, key, ...resetField } = field;
                const id = form.getFieldValue(['transformationsNG', name, 'id']);
                return (
                  <div key={key}>
                    <Form.Item {...resetField} name={[name, 'id']} hidden />
                    {id === 'organize' && (
                      <Form.Item {...resetField} name={[name, 'options']}>
                        <Organize
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
                    {id === 'joinByField' && (
                      <Form.Item {...resetField} name={[name, 'options']}>
                        <JoinByField
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
                {t('add_transformation')}
              </Button>
              <Drawer
                title={t('add_transformation')}
                placement='right'
                width='50%'
                visible={addTransformationDrawerVisible}
                onClose={() => setAddTransformationDrawerVisible(false)}
              >
                <Row gutter={SIZE}>
                  {_.map(transformationsOptions, (item) => {
                    return (
                      <Col
                        span={8}
                        key={item}
                        onClick={() => {
                          let options = {};
                          if (item === 'organize') {
                            options = {};
                          }
                          if (item === 'joinByField') {
                            options = { mode: 'outer' };
                          }
                          add({ id: item, options });
                          setAddTransformationDrawerVisible(false);
                        }}
                      >
                        {item === 'joinByField' && (
                          <div className='n9e-dashboard-editor-transformationNG-item'>
                            <h3>{t('transformations.joinByField.title')}</h3>
                            <p>{t('transformations.joinByField.desc')}</p>
                          </div>
                        )}
                        {item === 'organize' && (
                          <div className='n9e-dashboard-editor-transformationNG-item'>
                            <h3>{t('transformations.organize.title')}</h3>
                            <p>{t('transformations.organize.desc')}</p>
                          </div>
                        )}
                        {item === 'merge' && (
                          <div className='n9e-dashboard-editor-transformationNG-item'>
                            <h3>{t('transformations.merge.title')}</h3>
                            <p>{t('transformations.merge.desc')}</p>
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
