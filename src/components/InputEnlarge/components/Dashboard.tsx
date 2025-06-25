import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Row, Col, Select, AutoComplete } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import { rangeOptions } from '@/components/TimeRangePicker/config';
import { getDashboards, getDashboard } from '@/services/dashboardV2';
import { getBusiGroups } from '@/services/common';
import { IVariable } from '@/pages/dashboard/VariableConfig/definition';
import { CommonStateContext } from '@/App';
import { stringToRegex } from '@/pages/dashboard/VariableConfig/constant';

interface IItem {
  id: number | string;
  name: string;
}

export default function Dashboard({ vars }: { vars: string[] }) {
  const { t } = useTranslation('inputEnlarge');
  const { groupedDatasourceList, datasourceList } = useContext(CommonStateContext);
  const [businessList, setBusinessList] = useState<IItem[]>([]);
  const [boardList, setBoardList] = useState<IItem[]>([]);
  const [variables, setVariables] = useState<IVariable[]>([]);
  const formVariable = Form.useWatch(['dashboard', 'variables']);

  useEffect(() => {
    if (formVariable) {
      const variableValues = Object.values(formVariable).filter((item) => item !== undefined && item !== '');
      form.setFields([
        {
          name: ['dashboard', 'variable_value_fixed'],
          value: variableValues.length === variables.length,
        },
      ]);
    }
  }, [formVariable]);
  const form = Form.useFormInstance();
  useEffect(() => {
    getBusiGroups().then((res) => {
      setBusinessList(res.dat || []);
    });
  }, []);
  const getBoardList = async (id: number | string) => {
    if (id) {
      getDashboards(id).then((res) => {
        setBoardList(res);
      });
    }
  };
  return (
    <div>
      <Form.Item name={['dashboard', 'range']} label={t('时间范围')} initialValue={'from-to'}>
        <Select>
          <Select.Option value='from-to'>{t('继承当前查询时间')}</Select.Option>
          {rangeOptions.map((item) => (
            <Select.Option key={item.start} value={item.start}>
              {t(`timeRangePicker:rangeOptions.${item.display}`)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={['dashboard', 'businessId']} label={t('业务组')}>
        <Select
          dropdownMatchSelectWidth={false}
          placeholder={t('请选择业务组')}
          onChange={(val) => {
            val && getBoardList(val as number);
            form.setFields([
              {
                name: ['dashboard', 'boardId'],
                value: undefined,
              },
            ]);
          }}
          showSearch
          filterOption={(inputValue, option) => {
            if (option && option.children && typeof option.children === 'string') {
              return (option.children as string).indexOf(inputValue) !== -1;
            }
            return true;
          }}
        >
          {businessList.length > 0 &&
            businessList.map((el) => {
              return (
                <Select.Option key={el.id} value={el.id}>
                  {el.name}
                </Select.Option>
              );
            })}
        </Select>
      </Form.Item>
      <Form.Item name={['dashboard', 'boardId']} label={t('仪表盘')}>
        <Select
          dropdownMatchSelectWidth={false}
          placeholder={t('请选择仪表盘')}
          showSearch
          filterOption={(inputValue, option) => {
            if (option && option.children && typeof option.children === 'string') {
              return (option.children as string).indexOf(inputValue) !== -1;
            }
            return true;
          }}
          onChange={(val) => {
            getDashboard(val as number).then((res) => {
              let config;
              try {
                config = JSON.parse(res.configs);
              } catch (e) {
                console.log(e);
              }
              if (config && config.var) {
                const variables = config.var;
                setVariables(variables);
              }
            });
          }}
        >
          {boardList.length > 0 &&
            boardList.map((el) => {
              return (
                <Select.Option key={el.id} value={el.id}>
                  {el.name}
                </Select.Option>
              );
            })}
        </Select>
      </Form.Item>
      {variables.length > 0 && (
        <div>
          <div className='input-enlarge-vars-title'>{t('设置仪表盘变量')}</div>
          <Form.Item name={['dashboard', 'variables']} hidden>
            <Input />
          </Form.Item>
          <Form.Item name={['dashboard', 'variable_value_fixed']} hidden>
            <Input />
          </Form.Item>
          <Row gutter={[16, 8]}>
            {variables.map((item) => {
              let options: { label: string; value: string }[] = [];
              const Component = item.type === 'datasource' ? Select : AutoComplete;
              if (item.type === 'datasource') {
                const list = item.definition ? (groupedDatasourceList[item.definition] as any) : [];
                const regex = item.regex ? stringToRegex(item.regex) : null;
                if (regex) {
                  options = list
                    .filter((option) => {
                      return regex.test(option.name);
                    })
                    .map((option) => ({ label: option.name, value: option.id }));
                } else {
                  options = list.map((option) => ({ label: option.name, value: option.id }));
                }
              } else if (item.type === 'datasourceIdentifier') {
                const list = item.definition
                  ? groupedDatasourceList[item.definition].filter((item) => {
                      return item.identifier;
                    })
                  : [];
                const regex = item.regex ? stringToRegex(item.regex) : null;
                if (regex) {
                  options = list
                    .filter((option) => {
                      return option.identifier && regex.test(option.identifier || '');
                    })
                    .map((option) => ({ label: option.name, value: option.identifier as string }));
                } else {
                  options = list.map((option) => ({ label: option.identifier as string, value: option.identifier as string }));
                }
              } else {
                options = vars.map((v) => ({ label: '$' + v, value: '$' + v }));
              }
              return (
                <Col span={12} key={item.name}>
                  <Input.Group>
                    <span className='ant-input-group-addon'>{item.name}</span>
                    <Component
                      options={options}
                      style={{ width: '100%' }}
                      onChange={(val) => {
                        form.setFields([
                          {
                            name: ['dashboard', 'variables', item.name],
                            value: val,
                          },
                        ]);
                      }}
                    />
                  </Input.Group>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </div>
  );
}
