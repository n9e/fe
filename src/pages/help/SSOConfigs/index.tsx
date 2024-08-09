import React, { useState, useEffect } from 'react';
import { Tabs, Button, Card, message } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { EditorView } from '@codemirror/view';
import PageLayout from '@/components/pageLayout';
import CodeMirror from '@/components/CodeMirror';
import DocumentDrawer from '@/components/DocumentDrawer';
import { getSSOConfigs, putSSOConfig } from './services';
import { SSOConfigType } from './types';
import './locale';
//@ts-ignore
import Global from 'plus:/parcels/SSOConfigs/Global';

const documentMap = {
  OAuth2: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/sso/oauth2',
  LDAP: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/sso/ldap',
  CAS: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/sso/cas',
  OIDC: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/sso/oidc',
};

export default function index() {
  const { t, i18n } = useTranslation('SSOConfigs');
  const [data, setData] = useState<SSOConfigType[]>([]);
  const [activeKey, setActiveKey] = useState<string>();

  useEffect(() => {
    getSSOConfigs().then((res) => {
      setData(res);
      setActiveKey(res?.[0]?.name);
    });
  }, []);

  return (
    <PageLayout title={t('title')}>
      <main
        style={{
          padding: 16,
        }}
      >
        <Global SSOConfigs={data} />
        <Card
          bordered
          size='small'
          bodyStyle={{
            paddingTop: 2,
          }}
        >
          <Tabs
            activeKey={activeKey}
            onChange={(activeKey) => {
              setActiveKey(activeKey);
            }}
            tabBarExtraContent={
              activeKey &&
              documentMap[activeKey] && (
                <a
                  onClick={() => {
                    DocumentDrawer({
                      language: i18n.language,
                      title: t('common:document_link'),
                      type: 'iframe',
                      documentPath: documentMap[activeKey],
                    });
                  }}
                >
                  {t('common:document_link')}
                </a>
              )
            }
          >
            {data.map((item) => {
              return (
                <Tabs.TabPane tab={item.name} key={item.name}>
                  <div>
                    <CodeMirror
                      value={item.content}
                      onChange={(value) => {
                        const dataClone = _.cloneDeep(data);
                        const curItem = _.find(dataClone, (i) => i.id === item.id);
                        if (curItem) {
                          curItem.content = value;
                        }
                        setData(dataClone);
                      }}
                      height='auto'
                      basicSetup
                      editable
                      extensions={[
                        EditorView.lineWrapping,
                        EditorView.theme({
                          '&': {
                            backgroundColor: '#F6F6F6 !important',
                          },
                          '&.cm-editor.cm-focused': {
                            outline: 'unset',
                          },
                        }),
                      ]}
                    />
                    <Button
                      type='primary'
                      style={{ marginTop: 16 }}
                      onClick={() => {
                        const curItem = _.find(data, (i) => i.id === item.id);
                        if (curItem) {
                          putSSOConfig(curItem).then(() => {
                            message.success(t('common:success.save'));
                          });
                        }
                      }}
                    >
                      {t('common:btn.save')}
                    </Button>
                  </div>
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </Card>
      </main>
    </PageLayout>
  );
}
