import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Form, Select, Input, Table, Space, Tag, Button, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { getComponents, getPayloads, Component, Payload } from '@/pages/builtInComponents/services';
import { TypeEnum } from '@/pages/builtInComponents/types';
import { createDashboard } from '@/services/dashboardV2';
import EditItems from '@/pages/dashboard/VariableConfig/EditItems';
import { IVariable } from '@/pages/dashboard/VariableConfig/definition';

export default function ImportBuiltinContent({ busiId, onOk }) {
  const { t } = useTranslation('dashboard');
  const [filter, setFilter] = useState<{
    query?: string;
  }>({ query: undefined });
  const [components, setComponents] = useState<Component[]>([]);
  const [dashboards, setDashboards] = useState<Payload[]>([]);
  const [varsEditData, setVarsEditData] = useState<{
    editing: boolean;
    value?: IVariable[];
    id?: number;
  }>({
    editing: false,
    value: undefined,
  });
  const [form] = Form.useForm();
  const component_id = Form.useWatch('component_id', form);
  const selectedBoards = Form.useWatch('selectedBoards', form);

  useEffect(() => {
    getComponents({
      disabled: 0,
    }).then((res) => {
      setComponents(res);
    });
  }, []);

  useEffect(() => {
    if (component_id) {
      getPayloads<Payload[]>({
        component_id,
        type: TypeEnum.dashboard,
        query: filter.query,
      }).then((res) => {
        setDashboards(res);
      });
    }
  }, [component_id, filter.query]);

  return (
    <>
      <Form
        layout='vertical'
        form={form}
        onFinish={(vals) => {
          const requests = _.map(vals.selectedBoards, (item) => {
            const curDashboard = _.find(dashboards, { uuid: item.uuid });
            if (curDashboard) {
              try {
                const content = JSON.parse(curDashboard.content);
                return createDashboard(busiId, {
                  ...content,
                  configs: JSON.stringify(content.configs),
                });
              } catch (e) {
                console.error(e);
                return null;
              }
            }
          });
          Promise.all(requests).then((res) => {
            // TODO 目前这个失败处理是不成立的，接口请求失败直接走的 catch，内置仪表盘页面也存在这个问题
            const failed = _.filter(res, (item) => {
              return item.err;
            });
            if (!_.isEmpty(failed)) {
              Modal.error({
                title: t('common:error.clone'),
                content: (
                  <div>
                    {_.map(failed, (item) => {
                      return <div key={item.err}>{item.err}</div>;
                    })}
                  </div>
                ),
              });
              return;
            } else {
              onOk();
            }
          });
        }}
      >
        <Form.Item
          label={t('builtInComponents:component')}
          name='component_id'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            showSearch
            filterOption
            optionFilterProp='label'
            options={_.map(components, (item) => {
              return {
                label: item.ident,
                value: item.id,
              };
            })}
            onChange={() => {
              form.setFieldsValue({
                selectedBoards: undefined,
              });
            }}
          />
        </Form.Item>
        <Form.Item name='selectedBoards' label={t('builtInComponents:payloads')} hidden={!component_id}>
          <>
            <Input
              prefix={<SearchOutlined />}
              value={filter.query}
              onChange={(e) => {
                setFilter({ ...filter, query: e.target.value });
              }}
              style={{ marginBottom: 8 }}
              allowClear
            />
            <Table
              size='small'
              rowKey='name'
              columns={[
                {
                  title: t('builtInComponents:name'),
                  dataIndex: 'name',
                  render: (value, record) => {
                    return (
                      <Link
                        to={{
                          pathname: '/built-in-components/dashboard/detail',
                          search: `?__uuid__=${record.uuid}`,
                        }}
                        target='_blank'
                      >
                        {value}
                      </Link>
                    );
                  },
                },
                {
                  title: t('builtInComponents:tags'),
                  dataIndex: 'tags',
                  render: (val) => {
                    const tags = _.compact(_.split(val, ' '));
                    return (
                      <Space size='middle'>
                        {_.map(tags, (tag, idx) => {
                          return (
                            <Tag
                              key={idx}
                              color='purple'
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                const queryItem = _.compact(_.split(filter.query, ' '));
                                if (_.includes(queryItem, tag)) return;
                                setFilter((filter) => {
                                  return {
                                    ...filter,
                                    query: filter.query ? filter.query + ' ' + tag : tag,
                                  };
                                });
                              }}
                            >
                              {tag}
                            </Tag>
                          );
                        })}
                      </Space>
                    );
                  },
                },
                {
                  title: t('builtInComponents:variable'),
                  render: (record) => {
                    return (
                      <a
                        onClick={() => {
                          try {
                            const content = JSON.parse(record.content);
                            const configs = content.configs;
                            setVarsEditData({
                              editing: true,
                              value: configs.var,
                              id: record.uuid,
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        {t('common:btn.edit')}
                      </a>
                    );
                  },
                },
              ]}
              dataSource={dashboards}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: _.map(selectedBoards, 'name'),
                onChange(_selectedRowKeys, selectedRows) {
                  form.setFieldsValue({
                    selectedBoards: selectedRows,
                  });
                },
              }}
              scroll={{ y: 300 }}
              pagination={false}
            />
          </>
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            {t('common:btn.import')}
          </Button>
        </Form.Item>
      </Form>
      {varsEditData.value && varsEditData.id !== undefined && (
        <EditItems
          visible={varsEditData.editing}
          setVisible={(v) => {
            setVarsEditData({ ...varsEditData, editing: v });
          }}
          value={_.cloneDeep(varsEditData.value)}
          onChange={(v: IVariable[]) => {
            const newDashboards = _.map(dashboards, (item) => {
              if (item.uuid === varsEditData.id) {
                try {
                  const content = JSON.parse(item.content);
                  content.configs.var = v;
                  item.content = JSON.stringify(content);
                } catch (e) {
                  console.error(e);
                }
              }
              return item;
            });
            setDashboards(newDashboards);
          }}
          range={{
            start: 'now-1h',
            end: 'now',
          }}
          id={_.toString(varsEditData.id)} // 适配 EditItem 组件的 id 类型
          dashboard={
            {
              id: varsEditData.id,
            } as any
          }
          editMode={0}
        />
      )}
    </>
  );
}
