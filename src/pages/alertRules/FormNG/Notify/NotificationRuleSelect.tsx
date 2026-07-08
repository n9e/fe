import React, { useMemo, useState } from 'react';
import { Form, Select, Space, Drawer, Spin, message } from 'antd';
import { SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { getItem as getNotificationRule, putItem as putNotificationRule, RuleItem } from '@/pages/notificationRules/services';
import { NS as notificationRulesNS, CN as notificationRulesCN } from '@/pages/notificationRules/constants';
import NotificationRuleForm from '@/pages/notificationRules/pages/Form';
import { normalizeInitialValues } from '@/pages/notificationRules/utils/normalizeValues';
import { useFormNGData } from '../context';

interface Props {
  label?: React.ReactNode;
}

export default function NotificationRuleSelect(props: Props) {
  const { t } = useTranslation('alertRules');
  const { label = t('notify_rule_ids') } = props;
  const { permissions, notificationRules, notificationRulesLoading, refreshNotificationRules } = useFormNGData();
  const isAuthorized = permissions.notificationRules;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerData, setDrawerData] = useState<RuleItem>();
  const options = useMemo(
    () =>
      _.map(notificationRules, (item) => {
        return {
          label: item.name,
          value: item.id,
        };
      }),
    [notificationRules],
  );

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
            {isAuthorized && (
              <SyncOutlined
                spin={notificationRulesLoading}
                onClick={(e) => {
                  refreshNotificationRules();
                  e.preventDefault();
                }}
              />
            )}
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
              originalLabel: item.label,
              value: item.value,
            };
          })}
          showSearch
          optionFilterProp='originalLabel'
          optionLabelProp='originalLabel'
          mode='multiple'
        />
      </Form.Item>
      <Drawer
        title={t(`${notificationRulesNS}:title`)}
        placement='right'
        width='80%'
        onClose={() => {
          setDrawerVisible(false);
          setDrawerData(undefined);
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
                  refreshNotificationRules();
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
