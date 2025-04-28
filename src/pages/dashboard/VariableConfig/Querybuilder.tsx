import React, { useContext } from 'react';
import { Form, Space, Input } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';

import { IVariable } from './definition';
import ElasticsearchSettings from './datasource/elasticsearch';
import { replaceExpressionVars } from './constant';

// @ts-ignore
import VariableQuerybuilderPro from 'plus:/parcels/Dashboard/VariableQuerybuilder';

interface Props {
  dashboardId: string;
  variables: IVariable[];
}

export default function Querybuilder(props: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const { darkMode, datasourceList } = useContext(CommonStateContext);
  const { dashboardId, variables } = props;
  const datasourceCate = Form.useWatch(['datasource', 'cate']);
  const datasourceValue = Form.useWatch(['datasource', 'value']);
  const definition = Form.useWatch(['definition']);
  const currentdatasourceValue = _.toNumber(
    replaceExpressionVars({
      text: datasourceValue,
      variables: variables,
      limit: variables.length,
      dashboardId,
      datasourceList,
    }),
  );

  if (_.includes(['prometheus', 'elasticsearch', 'pgsql'], datasourceCate)) {
    return (
      <div>
        {datasourceCate === 'elasticsearch' && <ElasticsearchSettings datasourceValue={currentdatasourceValue} />}
        <Form.Item
          label={
            <Space>
              {t('var.definition')}
              {_.includes(['prometheus', 'elasticsearch'], datasourceCate) && (
                <QuestionCircleOutlined
                  onClick={() => {
                    if (datasourceCate === 'prometheus') {
                      window.open('https://flashcat.cloud/media/?type=夜莺监控&source=aHR0cHM6Ly9kb3dubG9hZC5mbGFzaGNhdC5jbG91ZC9uOWUtMTMtZGFzaGJvYXJkLWludHJvLm1wNA==');
                    } else if (datasourceCate === 'elasticsearch') {
                      DocumentDrawer({
                        language: i18n.language,
                        darkMode,
                        title: t('var.definition'),
                        documentPath: '/docs/elasticsearch-template-variables',
                      });
                    }
                  }}
                />
              )}
            </Space>
          }
          name='definition'
          rules={[
            () => ({
              validator(_) {
                if (definition) {
                  if (datasourceCate === 'elasticsearch') {
                    try {
                      JSON.parse(definition);
                      return Promise.resolve();
                    } catch (e) {
                      return Promise.reject(t('var.definition_msg2'));
                    }
                  }
                  return Promise.resolve();
                } else {
                  return Promise.reject(new Error(t('var.definition_msg1')));
                }
              },
            }),
          ]}
          required
        >
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>
      </div>
    );
  }
  return <VariableQuerybuilderPro {...props} datasourceCate={datasourceCate} datasourceValue={currentdatasourceValue} />;
}
