import React, { useContext, useRef, useState } from 'react';
import { Form, Input, Checkbox, Card, Tooltip, Alert, Drawer, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { IS_PLUS } from '@/utils/constant';
import { CommonStateContext } from '@/App';
import { scrollToFirstError } from '@/utils';
import Markdown from '@/components/Markdown';
import Name from '../../components/items/Name';
import HTTP from '../../components/items/HTTP';
import BasicAuth from '../../components/items/BasicAuth';
import SkipTLSVerify from '../../components/items/SkipTLSVerify';
import Headers from '../../components/items/Headers';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';
import Cluster from '../../components/items/Cluster';
import prom_installation from './prom_installation.md';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const datasources = _.get(groupedDatasourceList, 'prometheus', []);
  const [helpDrawerVisible, setHelpDrawerVisible] = useState(false);

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={(values) => {
        onFinish(values, clusterRef.current);
      }}
      onFinishFailed={() => {
        scrollToFirstError();
      }}
      initialValues={data}
      className='settings-source-form'
    >
      {_.isEmpty(datasources) && (
        <Alert
          className='mb2'
          message={
            <Trans
              ns='datasourceManage'
              i18nKey='form.prom.help_content'
              components={{
                a: (
                  <a
                    onClick={() => {
                      setHelpDrawerVisible(true);
                    }}
                  />
                ),
              }}
            />
          }
        />
      )}
      <Card title={t(`${action}_title`)}>
        <Name />
        <HTTP
          urlExtra={
            <>
              <div
                className='second-color'
                style={{
                  paddingLeft: '12px',
                  margin: '0 0 18px',
                }}
              >
                <div>{t('form.prom.url_tip')}</div>
                <div>{'1. Prometheus:  http://localhost:9090/'}</div>
                <div>{'2. Thanos:  http://localhost:19192/'}</div>
                <div>{'3. VictoriaMetrics Cluster Version:  http://{vmselect}:8481/select/0/prometheus/'}</div>
                <div>{'4. VictoriaMetrics Single Version: http://{vmselect}:8428/'}</div>
                <div>{'5. M3:  http://localhost:7201/'}</div>
                <div>{'6. SLS:  https://{project}.{sls-enpoint}/prometheus/{project}/{metricstore}/'}</div>
              </div>
            </>
          }
        />
        <BasicAuth />
        <SkipTLSVerify />
        <Headers />
        <div className='page-title' style={{ marginTop: 0 }}>
          {t('form.other')}
        </div>
        <Form.Item
          label={
            <div>
              <span>Remote Write URL</span>
              <Tooltip
                overlayClassName='ant-tooltip-auto-width'
                title={
                  <div style={{ width: 600 }}>
                    {t('form.prom.write_addr_tip')}
                    <br />
                    1. Prometheus: http://localhost:9090/api/v1/write <br />
                    2. Thanos: http://localhost:19192/ <br />
                    3. VictoriaMetrics Cluster Version: http://{'{'}vminsert{'}'}:8480/insert/0/prometheus/api/v1/write <br />
                    4. VictoriaMetrics Single Version: http://localhost:8428/api/v1/write
                  </div>
                }
              >
                <QuestionCircleOutlined className='ant-form-item-tooltip' />
              </Tooltip>
            </div>
          }
          name={['settings', 'write_addr']}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t('form.prom.read_addr')} tooltip={t('form.prom.read_addr_tip')} name={['settings', 'internal_addr']}>
          <Input />
        </Form.Item>
        <Cluster form={form} clusterRef={clusterRef} />
        <Form.Item valuePropName='checked' name={[`is_default`]} hidden={!IS_PLUS}>
          <Checkbox>
            {t('default')}
            <Tooltip title={t('default_tip')}>
              <div className='ant-form-item-label' style={{ padding: 0 }}>
                <label>
                  <QuestionCircleOutlined className='ant-form-item-tooltip' />
                </label>
              </div>
            </Tooltip>
          </Checkbox>
        </Form.Item>
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
      <Drawer
        visible={helpDrawerVisible}
        width={800}
        title={t('form.prom.prom_installation_title')}
        onClose={() => {
          setHelpDrawerVisible(false);
        }}
      >
        <div>
          <Trans
            ns='datasourceManage'
            i18nKey='form.prom.prom_installation'
            components={{
              a: <a href='https://prometheus.io/docs/prometheus/latest/installation/' target='_blank' />,
            }}
          />
        </div>
        <Markdown content={prom_installation} />
      </Drawer>
    </Form>
  );
}
