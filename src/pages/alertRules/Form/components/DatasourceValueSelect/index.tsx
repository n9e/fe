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
import { Form, Select, Button } from 'antd';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { getDatasourceBriefList } from '@/services/common';

export const DATASOURCE_ALL = 0;

interface IProps {
  setFieldsValue: any;
  cate: string;
  datasourceList: { id: number; name: string }[];
  mode?: 'multiple';
  required?: boolean;
  disabled?: boolean;
}

const getInvalidDatasourceIds = (ids: number | number[], datasourceList: { id: number; name: string }[], fullDatasourceList: any[]) => {
  let val = _.isArray(ids) ? ids : [ids];
  if (_.last(val) === DATASOURCE_ALL) {
    val = _.map(datasourceList, 'id');
  }
  const invalid = _.filter(val, (item) => {
    const result = _.find(fullDatasourceList, { id: item });
    if (result) {
      return !result.cluster_name;
    }
  }) as number[];

  return invalid;
};

export default function index({ setFieldsValue, cate, datasourceList, mode, required = true, disabled }: IProps) {
  const { t } = useTranslation('alertRules');
  const [fullDatasourceList, setFullDatasourceList] = useState<any[]>([]);
  const datasourceIds = Form.useWatch('datasource_ids');
  const invalidDatasourceIds = getInvalidDatasourceIds(datasourceIds, datasourceList, fullDatasourceList);
  const fetchDatasourceList = () => {
    getDatasourceBriefList().then((res) => {
      setFullDatasourceList(res);
    });
  };
  let curDatasourceList = datasourceList;

  if (cate === 'prometheus' || cate === 'loki') {
    curDatasourceList = [
      {
        id: DATASOURCE_ALL,
        name: '$all',
      },
      ...datasourceList,
    ];
  }

  useEffect(() => {
    fetchDatasourceList();
  }, []);

  return (
    <Form.Item
      label={
        <div>
          {t('common:datasource.id')}
          <span style={{ paddingLeft: 16 }}>
            {_.isEmpty(invalidDatasourceIds) ? null : (
              <span style={{ color: '#ff4d4f' }}>
                <span>
                  <WarningOutlined /> {t('invalid_datasource_tip_1')}
                </span>
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
          </span>
        </div>
      }
      name='datasource_ids'
      rules={[
        {
          required,
          message: t('common:datasource.id_required'),
        },
        {
          validator(rule, value, callback) {
            const invalidDatasourceIds = getInvalidDatasourceIds(datasourceIds, datasourceList, fullDatasourceList);
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
        mode={mode}
        onChange={(v: number[] | number) => {
          if (_.isArray(v)) {
            const curVal = _.last(v);
            if (curVal === DATASOURCE_ALL) {
              setFieldsValue({ datasource_ids: [DATASOURCE_ALL] });
            } else if (typeof v !== 'number' && v.includes(DATASOURCE_ALL)) {
              setFieldsValue({ datasource_ids: _.without(v, DATASOURCE_ALL) });
            }
          }
        }}
        maxTagCount='responsive'
        disabled={disabled}
        showSearch
        optionFilterProp='children'
      >
        {_.map(curDatasourceList, (item) => (
          <Select.Option value={item.id} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
