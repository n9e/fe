import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Tag, Modal, Alert, Select, Space, Input, Form, message } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import semver from 'semver';
import PageLayout from '@/components/pageLayout';
import { BusinessGroup } from '@/pages/targets';
import { CommonStateContext } from '@/App';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { getDashboards, getDashboard, updateDashboardConfigs } from '@/services/dashboardV2';
import { getAuthorizedDatasourceCates } from '@/components/AdvancedWrap';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import './locale';

export default function index() {
  const { t } = useTranslation('migrationDashboard');
  const commonState = useContext(CommonStateContext);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refresh_'));
  const [loading, setLoading] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [settingOpen, setSettingOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const { curBusiId: busiId, groupedDatasourceList } = commonState;
  const cates = getAuthorizedDatasourceCates();
  const [form] = Form.useForm();

  useEffect(() => {
    if (busiId) {
      setLoading(true);
      getDashboards(busiId)
        .then((res) => {
          let requests: Promise<any>[] = [];
          _.forEach(res, (board) => {
            requests.push(getDashboard(board.id));
          });
          Promise.all(requests)
            .then((res) => {
              setBoards(
                _.filter(res, (item) => {
                  try {
                    const configs = JSON.parse(item.configs);
                    // v6 对应的版本号是 3.0.0，小于 3.0.0 的都是需要迁移的
                    return configs && semver.lt(configs.version, '3.0.0');
                  } catch (e) {
                    return false;
                  }
                }),
              );
            })
            .finally(() => {
              setLoading(false);
            });
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [busiId, refreshFlag]);

  return (
    <PageLayout title={t('title')}>
      <div style={{ display: 'flex' }}>
        <BusinessGroup
          curBusiId={busiId}
          setCurBusiId={(id) => {
            commonState.setCurBusiId(id);
          }}
        />
        {busiId ? (
          <div className='dashboards-v2'>
            <div style={{ marginBottom: 10 }}>
              <Button
                type='primary'
                onClick={() => {
                  setSettingOpen(true);
                }}
              >
                迁移
              </Button>
            </div>
            <Alert
              message={
                <div>
                  v6 版本将不再支持全局集群切换，新版本可通过图表关联数据源变量来实现该能力。 <br />
                  迁移工具会创建数据源变量以及批量关联所有未关联数据源的图表。
                  <br />
                  以下是待迁移的仪表盘列表，点击迁移按钮开始迁移。
                </div>
              }
              type='warning'
            />
            <Table
              size='small'
              loading={loading}
              dataSource={boards}
              columns={[
                {
                  title: t('dashboard:name'),
                  dataIndex: 'name',
                },
                {
                  title: t('dashboard:tags'),
                  dataIndex: 'tags',
                  render: (text: string) => (
                    <>
                      {_.map(_.split(text, ' '), (tag, index) => {
                        return tag ? (
                          <Tag color='purple' key={index}>
                            {tag}
                          </Tag>
                        ) : null;
                      })}
                    </>
                  ),
                },
                {
                  title: t('common:table.update_at'),
                  width: 200,
                  dataIndex: 'update_at',
                  render: (text: number) => moment.unix(text).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  title: t('common:table.create_by'),
                  width: 70,
                  dataIndex: 'create_by',
                },
              ]}
              pagination={false}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text='监控仪表盘' />
        )}
      </div>
      <Modal
        title='迁移设置'
        destroyOnClose
        maskClosable={false}
        closable={false}
        visible={settingOpen}
        footer={[
          <Button
            key='back'
            loading={migrating}
            onClick={() => {
              setSettingOpen(false);
            }}
          >
            取消
          </Button>,
          <Button
            key='submit'
            type='primary'
            loading={migrating}
            onClick={() => {
              form.validateFields().then((values) => {
                setMigrating(true);
                const varName = `\${${values.name}}`;
                const requests = _.map(boards, (board) => {
                  try {
                    const configs = JSON.parse(board.configs);
                    configs.version = '3.0.0';
                    configs.var = configs.var || [];
                    configs.panels = configs.panels || [];
                    configs.var = _.map(configs.var, (item) => {
                      if (!item.type || item.type === 'query') {
                        return {
                          ...item,
                          type: 'query',
                          datasource: {
                            cate: item.datasource?.cate || values.datasourceCate,
                            value: item.datasource?.value || varName,
                          },
                        };
                      }
                      return item;
                    });
                    configs.var.unshift({
                      name: values.name,
                      type: 'datasource',
                      definition: values.datasourceCate,
                      defaultValue: values.datasourceValue,
                    });
                    configs.panels = _.map(configs.panels, (panel) => {
                      if (panel.type !== 'row') {
                        return {
                          ...panel,
                          datasourceCate: panel.datasourceCate || values.datasourceCate,
                          datasourceValue: panel.datasourceValue || varName,
                        };
                      }
                      return panel;
                    });
                    return updateDashboardConfigs(board.id, {
                      configs: JSON.stringify(configs),
                    });
                  } catch (e) {
                    return Promise.resolve();
                  }
                });
                Promise.all(requests).then(() => {
                  setSettingOpen(false);
                  setMigrating(false);
                  setRefreshFlag(_.uniqueId('refresh_'));
                  message.success('迁移成功');
                });
              });
            }}
          >
            迁移
          </Button>,
        ]}
      >
        <Form form={form}>
          <div style={{ marginBottom: 10 }}>数据源变量设置</div>
          <div>
            <InputGroupWithFormItem label='变量名称'>
              <Form.Item name='name' rules={[{ required: true, message: '请填写变量名称' }]}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </div>
          <div>
            <Space>
              <InputGroupWithFormItem label='数据源类型'>
                <Form.Item name='datasourceCate' initialValue='prometheus'>
                  <Select style={{ width: 120 }}>
                    {_.map(cates, (item) => {
                      return (
                        <Select.Option key={item.value} value={item.value}>
                          {item.label}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </InputGroupWithFormItem>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const datasourceCate = getFieldValue('datasourceCate');
                  return (
                    <InputGroupWithFormItem label='数据源默认值'>
                      <Form.Item name='datasourceValue'>
                        <Select allowClear style={{ width: 168 }}>
                          {_.map(groupedDatasourceList[datasourceCate], (item) => {
                            return (
                              <Select.Option key={item.id} value={item.id}>
                                {item.name}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </InputGroupWithFormItem>
                  );
                }}
              </Form.Item>
            </Space>
          </div>
        </Form>
      </Modal>
    </PageLayout>
  );
}
