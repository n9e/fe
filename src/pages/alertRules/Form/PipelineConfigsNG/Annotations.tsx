import React, { useContext } from 'react';
import { Form, Space, Row, Col, AutoComplete, Input, Tooltip } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';
import { ANNOTATIONS_ENRICH_QUERIES_DOC_URL } from '@/pages/alertRules/constants';

export default function Annotations() {
  const { t, i18n } = useTranslation('alertRules');
  const { darkMode } = useContext(CommonStateContext);

  return (
    <Form.List name='annotations'>
      {(fields, { add, remove }) => (
        <div>
          <Space align='baseline'>
            {t('annotations')}
            <Tooltip title={t('annotations_tip')} overlayStyle={{ maxWidth: 400 }}>
              <InfoCircleOutlined />
            </Tooltip>
            <PlusCircleOutlined className='leading-[32px]' onClick={() => add()} />
            <a
              onClick={() => {
                DocumentDrawer({
                  language: i18n.language,
                  darkMode,
                  type: 'iframe',
                  title: t('common:page_help'),
                  documentPath: ANNOTATIONS_ENRICH_QUERIES_DOC_URL,
                });
              }}
            >
              {t('common:page_help')}
            </a>
          </Space>
          {fields.map((field) => (
            <Row gutter={16} key={field.key}>
              <Col flex='120px'>
                <Form.Item {...field} name={[field.name, 'key']}>
                  <AutoComplete
                    options={[
                      {
                        value: 'recovery_promql',
                      },
                      {
                        value: 'runbook_url',
                      },
                      {
                        value: 'dashboard_url',
                      },
                      {
                        value: 'summary',
                      },
                    ]}
                    style={{ width: 200 }}
                  />
                </Form.Item>
              </Col>
              <Col flex='auto'>
                <Form.Item {...field} name={[field.name, 'value']}>
                  <Input.TextArea autoSize />
                </Form.Item>
              </Col>
              <Col flex='40px'>
                <MinusCircleOutlined className='leading-[32px]' onClick={() => remove(field.name)} />
              </Col>
            </Row>
          ))}
        </div>
      )}
    </Form.List>
  );
}
