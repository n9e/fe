import React, { useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Button, message, Row, Space, Select } from 'antd';
import PageLayout from '@/components/pageLayout';
import { getN9eConfig, putN9eConfig } from './services';
import './locale';

// @ts-ignore
import SiteSettingsPlus from 'plus:/parcels/SiteSettings';

export default function index() {
  const { t } = useTranslation('siteInfo');
  const [form] = Form.useForm();
  const businessGroupDisplayMode = Form.useWatch('businessGroupDisplayMode', form);
  const teamDisplayMode = Form.useWatch('teamDisplayMode', form);

  useEffect(() => {
    getN9eConfig('site_info').then((res) => {
      if (res) {
        try {
          const result = JSON.parse(res);
          if (_.isPlainObject(result)) {
            form.setFieldsValue(result);
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  }, []);

  return (
    <PageLayout title={t('title')}>
      <div className='srm'>
        <div>
          <Card>
            <Form
              layout='vertical'
              form={form}
              onFinish={(value) => {
                putN9eConfig({
                  ckey: 'site_info',
                  cval: JSON.stringify(value),
                }).then(() => {
                  message.success(t('common:success.save'));
                  location.reload();
                });
              }}
            >
              <SiteSettingsPlus />
              <Form.Item name={['home_page_url']} label={t('home_page_url')} tooltip={t('home_page_url_tip')}>
                <Input />
              </Form.Item>
              <div>
                <Space>
                  <Form.Item label={t('businessGroupDisplayMode')} name={['businessGroupDisplayMode']} initialValue='tree'>
                    <Select
                      style={{ width: 200 }}
                      options={[
                        {
                          label: t('displayMode.tree'),
                          value: 'tree',
                        },
                        {
                          label: t('displayMode.list'),
                          value: 'list',
                        },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label={t('businessGroupSeparator')} name={['businessGroupSeparator']} initialValue='-' hidden={businessGroupDisplayMode === 'list'}>
                    <Input style={{ width: 200 }} />
                  </Form.Item>
                </Space>
              </div>
              <div>
                <Space>
                  <Form.Item label={t('teamDisplayMode')} name={['teamDisplayMode']} initialValue='tree'>
                    <Select
                      style={{ width: 200 }}
                      options={[
                        {
                          label: t('displayMode.tree'),
                          value: 'tree',
                        },
                        {
                          label: t('displayMode.list'),
                          value: 'list',
                        },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label={t('teamSeparator')} name={['teamSeparator']} initialValue='-' hidden={teamDisplayMode === 'list'}>
                    <Input style={{ width: 200 }} />
                  </Form.Item>
                </Space>
              </div>
              <Button type='primary' htmlType='submit'>
                {t('common:btn.save')}
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
