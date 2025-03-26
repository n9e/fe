import React, { useState, useEffect } from 'react';
import { Form, Select, Space, Drawer, Spin, message } from 'antd';
import { SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { getItems as getNotificationRules, getItem as getNotificationRule, putItem as putNotificationRule, RuleItem } from '@/pages/notificationRules/services';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { NS as notificationRulesNS, CN as notificationRulesCN, PERM } from '@/pages/notificationRules/constants';
import NotificationRuleForm from '@/pages/notificationRules/pages/Form';
import { normalizeInitialValues } from '@/pages/notificationRules/utils/normalizeValues';

interface Props {
  label?: React.ReactNode;
}

export default function NotificationRuleSelect(props: Props) {
  const { t } = useTranslation('alertRules');
  const { label = t('notify_rule_ids') } = props;
  const [options, setOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const isAuthorized = useIsAuthorized([PERM]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerData, setDrawerData] = useState<RuleItem>();
  const fetchData = () => {
    getNotificationRules()
      .then((res) => {
        setOptions(
          _.map(res, (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }),
        );
      })
      .catch(() => {
        setOptions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Form.Item
        name='notify_rule_ids'
        label={
          <Space>
            {label}
            {isAuthorized && (
              <Link to='/notification-rules' target='_blank'>
                <SettingOutlined />
              </Link>
            )}
            <SyncOutlined
              spin={loading}
              onClick={(e) => {
                fetchData();
                e.preventDefault();
              }}
            />
          </Space>
        }
      >
        <Select
          options={_.map(options, (item) => {
            return {
              label: (
                <Space>
                  {item.label}
                  {isAuthorized && (
                    <a
                      onClick={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        e.preventDefault();
                        setDrawerVisible(true);
                        getNotificationRule(item.value).then((res) => {
                          setDrawerData(normalizeInitialValues(res));
                        });
                      }}
                    >
                      {t('common:btn.view')}
                    </a>
                  )}
                </Space>
              ),
              value: item.value,
            };
          })}
          showSearch
          optionFilterProp='label'
          mode='multiple'
        />
      </Form.Item>
      <Drawer
        title={t(`${notificationRulesNS}:title`)}
        placement='right'
        width='80%'
        onClose={() => {
          setDrawerVisible(false);
        }}
        visible={drawerVisible}
      >
        <div className={`n9e ${notificationRulesCN}`}>
          {drawerData ? (
            <NotificationRuleForm
              initialValues={drawerData}
              onOk={(values) => {
                putNotificationRule(values).then(() => {
                  message.success(t('common:success.add'));
                  setDrawerVisible(false);
                });
              }}
              onCancel={() => {
                setDrawerVisible(false);
              }}
            />
          ) : (
            <div>
              <Spin spinning />
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
