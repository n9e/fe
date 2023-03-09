import React, { useState, useEffect } from 'react';
import { Tabs, Button, message } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import PageLayout from '@/components/pageLayout';
import { getSSOConfigs, putSSOConfig } from './services';
import { SSOConfigType } from './types';
import './locale';

export default function index() {
  const { t } = useTranslation('SSOConfigs');
  const [data, setData] = useState<SSOConfigType[]>([]);

  useEffect(() => {
    getSSOConfigs().then((res) => {
      setData(res);
    });
  }, []);

  return (
    <PageLayout title={t('title')}>
      <div>
        <div style={{ padding: '0 16px 16px 16px' }}>
          <Tabs>
            {data.map((item) => {
              return (
                <Tabs.TabPane tab={item.name} key={item.id}>
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
                      theme='light'
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
                            message.success('common:success.save');
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
        </div>
      </div>
    </PageLayout>
  );
}
