/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState } from 'react';
import { Form, Select, Space, Row, Col, Button, Tooltip, Modal, Table } from 'antd';
import { WarningOutlined, PlusCircleOutlined, MinusCircleOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Trans, useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { getDatasourceBriefList } from '@/services/common';
import DatasourceSelectExtra from '@/pages/alertRules/Form/components/DatasourceSelectExtra';
import { getDatasourcesByQueries } from './services';
import './style.less';

interface IProps {
  datasourceList: { id: number; name: string }[];
  reloadGroupedDatasourceList: () => void;
  datasourceCate?: string;
  names?: string[];
  required?: boolean;
  disabled?: boolean;
  showExtra?: boolean;
}

const getInvalidDatasourceIds = (ids: number[], fullDatasourceList: any[]) => {
  const invalid = _.filter(ids, (item) => {
    const result = _.find(fullDatasourceList, { id: item });
    if (result) {
      return !result.cluster_name;
    }
  }) as number[];

  return invalid;
};

function Query({ idx, names, field, remove, invalidDatasourceIds, datasourceList, disabled }) {
  const { t } = useTranslation('alertRules');
  const form = Form.useFormInstance();
  const match_type = Form.useWatch([...names, field.name, 'match_type']);

  return (
    <Row gutter={8}>
      {idx > 0 && (
        <Col flex='none'>
          <div className='alert-rule-datasource-and'>{t('common:and')}</div>
        </Col>
      )}

      <Col flex='200px'>
        <Form.Item {...field} name={[field.name, 'match_type']} initialValue={0}>
          <Select
            disabled={disabled}
            options={[
              {
                label: t('common:datasource.queries.match_type_2'),
                value: 2,
              },
              {
                label: t('common:datasource.queries.match_type_0'),
                value: 0,
              },
              {
                label: (
                  <Space>
                    {t('common:datasource.queries.match_type_1')}
                    <Tooltip
                      title={
                        <Trans
                          i18nKey='common:datasource.queries.match_type_1_tip'
                          components={{
                            br: <br />,
                          }}
                        />
                      }
                    >
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                ),
                value: 1,
              },
            ]}
            onChange={() => {
              const values = _.cloneDeep(form.getFieldsValue());
              _.set(values, [...names, field.name, 'values'], []);
              form.setFieldsValue(values);
            }}
          />
        </Form.Item>
      </Col>
      {match_type !== 2 && (
        <>
          <Col flex='80px'>
            <Form.Item {...field} name={[field.name, 'op']} initialValue='in'>
              <Select
                disabled={disabled}
                options={[
                  {
                    label: t('common:datasource.queries.op_in'),
                    value: 'in',
                  },
                  {
                    label: t('common:datasource.queries.op_not_in'),
                    value: 'not in',
                  },
                ]}
              />
            </Form.Item>
          </Col>
          <Col flex='auto'>
            <Form.Item
              {...field}
              name={[field.name, 'values']}
              rules={[
                {
                  required: true,
                  message: t('common:datasource.id_required'),
                },
                {
                  validator(rule, value, callback) {
                    if (_.isEmpty(invalidDatasourceIds)) {
                      callback();
                    } else {
                      callback('invalidDatasourceIds');
                    }
                  },
                  message: '', // label 右侧已经显示，这里就不显示 error msg
                },
              ]}
            >
              <Select
                disabled={disabled}
                mode={match_type === 0 ? 'multiple' : 'tags'}
                tokenSeparators={[' ']}
                open={match_type === 1 ? false : undefined}
                options={_.map(datasourceList, (item) => {
                  return {
                    value: item.id,
                    label: item.name,
                  };
                })}
                optionFilterProp='label'
              />
            </Form.Item>
          </Col>
        </>
      )}
      <Col flex='none'>
        <MinusCircleOutlined
          className='mt1'
          onClick={() => {
            remove(field.name);
          }}
        />
      </Col>
    </Row>
  );
}

export default function index(props: IProps) {
  const { datasourceList, reloadGroupedDatasourceList, datasourceCate, names = ['datasource_queries'], disabled, showExtra } = props;
  const { t } = useTranslation('alertRules');
  const [fullDatasourceList, setFullDatasourceList] = useState<any[]>([]);
  const [datasources, setDatasources] = useState<any[]>([]);
  const [invalidDatasourceIds, setInvalidDatasourceIds] = useState<number[]>([]);
  const form = Form.useFormInstance();
  const datasource_cate = datasourceCate || Form.useWatch(['cate']);
  const datasource_queries = Form.useWatch(names);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const fetchDatasourceList = () => {
    getDatasourceBriefList().then((res) => {
      setFullDatasourceList(res);
    });
  };

  useEffect(() => {
    if (!_.isEmpty(datasource_queries)) {
      getDatasourcesByQueries({
        datasource_cate,
        datasource_queries,
      }).then((res) => {
        setDatasources(res);
        const datasourceIds = _.map(res, 'id');
        const invalidDatasourceIds = getInvalidDatasourceIds(datasourceIds, fullDatasourceList);
        setInvalidDatasourceIds(invalidDatasourceIds);
        form.setFieldsValue({
          datasource_value: _.head(datasourceIds), // 取第一个数据用于数据预览等地方
          datasource_values: datasourceIds, // 保存所有查询的数据源 id
        });
      });
    }
  }, [JSON.stringify(datasource_queries)]);

  useEffect(() => {
    fetchDatasourceList();
  }, []);

  return (
    <>
      <Form.List
        name={names}
        initialValue={[
          {
            match_type: 0,
            op: 'in',
            values: [],
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <div>
            <div
              className='mb1'
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Space>
                {t('common:datasource.queries.label')}
                <PlusCircleOutlined
                  onClick={() =>
                    add({
                      match_type: 0,
                      op: 'in',
                      values: [],
                    })
                  }
                />
              </Space>
              <Space>
                <Link to='/help/source' target='_blank'>
                  {t('common:datasource.managePageLink')}
                </Link>
                <ReloadOutlined
                  onClick={() => {
                    reloadGroupedDatasourceList();
                  }}
                />
              </Space>
            </div>
            {fields.map((field, index) => {
              return (
                <Query
                  key={field.name}
                  idx={index}
                  names={names}
                  field={field}
                  remove={remove}
                  invalidDatasourceIds={invalidDatasourceIds}
                  datasourceList={datasourceList}
                  disabled={disabled}
                />
              );
            })}
            <div className='mb2'>
              <Space>
                <Button
                  type='primary'
                  ghost
                  onClick={() => {
                    setPreviewModalVisible(true);
                  }}
                >
                  {t('common:datasource.queries.preview')}
                </Button>
                {showExtra && <DatasourceSelectExtra />}
                {!_.isEmpty(invalidDatasourceIds) && (
                  <span style={{ color: '#ff4d4f' }}>
                    <Tooltip
                      title={
                        <div>
                          {_.map(invalidDatasourceIds, (item) => {
                            const result = _.find(fullDatasourceList, { id: item });
                            if (result) {
                              let url = `/help/source/edit/${result.plugin_type}/${result.id}`;
                              if (import.meta.env.VITE_IS_ENT === 'true') {
                                const cateMap = {
                                  timeseries: 'datasource',
                                  logging: 'logsource',
                                };
                                url = `/settings/${cateMap[result.category]}/edit/${result.id}`;
                                if (result.category === 'logging') {
                                  url = `/settings/${cateMap[result.category]}/edit/${result.plugin_type}/${result.id}`;
                                }
                              }
                              return (
                                <Link style={{ paddingLeft: 8 }} target='_blank' to={url}>
                                  {result.name}
                                </Link>
                              );
                            }
                          })}
                        </div>
                      }
                    >
                      <span>
                        <WarningOutlined /> {t('invalid_datasource_tip_1')}
                      </span>
                    </Tooltip>

                    <span style={{ paddingLeft: 8 }}>{t('invalid_datasource_tip_2')}</span>
                    <a
                      style={{ paddingLeft: 8 }}
                      onClick={(e) => {
                        e.preventDefault();
                        fetchDatasourceList();
                      }}
                    >
                      {t('invalid_datasource_reload')}
                    </a>
                  </span>
                )}
              </Space>
            </div>
          </div>
        )}
      </Form.List>
      <Modal
        visible={previewModalVisible}
        title={t('common:datasource.queries.preview')}
        footer={null}
        onCancel={() => {
          setPreviewModalVisible(false);
        }}
      >
        <Table
          size='small'
          pagination={false}
          rowKey='id'
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
            },
            {
              title: t('common:datasource.name'),
              dataIndex: 'name',
            },
          ]}
          dataSource={datasources}
        />
      </Modal>
    </>
  );
}
