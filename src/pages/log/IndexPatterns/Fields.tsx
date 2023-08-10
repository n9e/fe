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
import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Space, message, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import { getFullFields } from '@/pages/explorer/Elasticsearch/services';
import { getESIndexPattern, putESIndexPattern } from './services';
import { IndexPattern, FieldConfig } from './types';
import EditField from './EditField';

export default function Fields() {
  const { t } = useTranslation('es-index-patterns');
  const { id } = useParams<{ id: string }>();
  const [data, setData] =
    useState<
      Omit<IndexPattern, 'fields_format'> & {
        fieldConfig: FieldConfig;
      }
    >();
  const [tablePageCurrent, setTablePageCurrent] = useState<number>(1);
  const [fields, setFields] = useState<any[]>([]);
  const [fieldsTypes, setFieldsTypes] = useState<any[]>([]);
  const [query, setQuery] =
    useState<{
      search?: string;
      type?: string;
    }>();

  useEffect(() => {
    if (id) {
      getESIndexPattern(_.toNumber(id)).then((res) => {
        let fieldConfig: FieldConfig = {
          attrs: {},
          formatMap: {},
          version: 1,
        };
        try {
          fieldConfig = JSON.parse(res.fields_format);
        } catch (error) {
          console.error(error);
        }
        res.fieldConfig = fieldConfig;
        setData(res);
        getFullFields(res.datasource_id, res.name).then((res) => {
          setFields(res.allFields);
          setFieldsTypes(_.union(_.map(res.allFields, 'type')));
          setTablePageCurrent(1);
        });
      });
    }
  }, [id]);

  return (
    <PageLayout
      title={
        <Space>
          {t('title')}
          {data?.name}
        </Space>
      }
      showBack
      backPath='/log/index-patterns'
    >
      <div>
        <div style={{ padding: 10 }}>
          <div>
            <Space>
              <Input.Search
                style={{ width: 400 }}
                onSearch={(val) => {
                  setQuery({ ...query, search: val });
                  setTablePageCurrent(1);
                }}
              />
              <Select
                allowClear
                style={{ width: 200 }}
                options={_.map(fieldsTypes, (item) => {
                  return { label: item, value: item };
                })}
                placeholder={t('field.type_placeholder')}
                onChange={(val) => {
                  setQuery({ ...query, type: val });
                  setTablePageCurrent(1);
                }}
              />
            </Space>
          </div>
          <Table
            size='small'
            columns={[
              {
                title: t('field.name'),
                dataIndex: 'name',
              },
              {
                title: t('field.type'),
                dataIndex: 'type',
              },
              {
                title: t('field.alias'),
                render: (record) => {
                  return data?.fieldConfig?.attrs?.[record.name]?.alias;
                },
              },
              {
                title: t('field.format.title'),
                render: (record) => {
                  return data?.fieldConfig?.formatMap?.[record.name]?.type;
                },
              },
              {
                title: t('common:table.operations'),
                width: 80,
                render: (record) => {
                  return (
                    <Button
                      type='link'
                      onClick={() => {
                        if (data) {
                          EditField({
                            field: record,
                            values: data.fieldConfig,
                            onOk(values) {
                              const newFieldConfig = {
                                attrs: _.assign(data.fieldConfig.attrs, values.attrs),
                                formatMap: _.assign(data.fieldConfig.formatMap, values.formatMap),
                                version: data.fieldConfig.version,
                              };
                              putESIndexPattern(data.id, {
                                ..._.omit(data, ['fieldConfig', 'id']),
                                fields_format: JSON.stringify(newFieldConfig),
                              }).then(() => {
                                message.success(t('common:success.save'));
                              });
                            },
                          });
                        }
                      }}
                    >
                      {t('common:btn.edit')}
                    </Button>
                  );
                },
              },
            ]}
            dataSource={_.filter(fields, (item) => {
              let flag = true;
              if (query?.search) {
                flag = _.includes(item.name, query.search);
              }
              if (query?.type) {
                flag = flag && item.type === query.type;
              }
              return flag;
            })}
            pagination={{
              current: tablePageCurrent,
              defaultPageSize: 10,
              showTotal: (total) => {
                return t('common:table.total', { total });
              },
              onChange: (page) => {
                setTablePageCurrent(page);
              },
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
