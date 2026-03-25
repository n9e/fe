import React, { Fragment, useEffect, useState } from 'react';
import { Form, Row, Col, Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getBusiGroups } from '@/Packages/Outfire/services';
import DashboardSelect from './DashboardSelect';
import { useTranslation } from 'react-i18next';

export interface ILabelName {
  id: number | string;
  name: string;
  ident?: string;
}

export default function DashboardConfig() {
  const { t } = useTranslation('aiChat');

  const form = Form.useFormInstance();

  const [businessList, setBusinessList] = useState<ILabelName[]>([]);

  useEffect(() => {
    getBusinessList();
  }, []);

  const getBusinessList = async () => {
    const res = await getBusiGroups();
    setBusinessList(res);
  };

  return (
    <Form.List name={'dashboard'}>
      {(fields, { add, remove }) => {
        return (
          <Row gutter={16}>
            {fields.map((field) => {
              return (
                <Fragment key={field.name}>
                  <Col span={12}>
                    <Form.Item name={[field.name, 'business_id']} rules={[{ required: true, message: t('knowledgeBase.form.businessPlaceholder') }]}>
                      <Select
                        placeholder={t('knowledgeBase.form.businessPlaceholder')}
                        showSearch
                        optionFilterProp='children'
                        onChange={() => {
                          form.setFields([
                            {
                              name: ['dashboard', field.name, 'dashboard_id'],
                              value: undefined,
                            },
                          ]);
                        }}
                      >
                        {businessList?.map((el) => {
                          return (
                            <Select.Option value={el.id} key={el.id} placeholder={t('knowledgeBase.form.businessPlaceholder')}>
                              {el.name}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <DashboardSelect fieldName={field.name} />
                  </Col>
                </Fragment>
              );
            })}

            <Col span={24}>
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  add();
                }}
              ></Button>
            </Col>
          </Row>
        );
      }}
    </Form.List>
  );
}
