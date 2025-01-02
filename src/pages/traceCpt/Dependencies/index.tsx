import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import { Select, Space, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { RadialGraph } from '@ant-design/graphs';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { getTraceDependencies } from '../services';
import { getRadialData } from './utils';

export default function index() {
  const { t } = useTranslation('trace');
  const { groupedDatasourceList, darkMode } = useContext(CommonStateContext);
  const [datasourceValue, setDatasourceValue] = useState<number | undefined>(_.get(groupedDatasourceList, 'jaeger[0].id') as any);
  const [data, setData] = useState<any>([]);
  const [redrawKey, setRedrawKey] = useState<string>(_.uniqueId('redrawKey_'));
  const chartRef = useRef();
  const config = {
    data: data,
    autoFit: true,
    theme: {
      styleSheet: {
        backgroundColor: '#000',
      },
    },
    layout: {
      unitRadius: 80,
      nodeSize: 20,
      nodeSpacing: 10,
    },
    style: {
      backgroundColor: darkMode ? 'rgb(24,27,31)' : '#fff',
    },
    nodeCfg: {
      size: 20,
      asyncData: () => {
        // TODO: 非得有个 asyncData，不然就会报错，这个 antd graphs 真是一堆问题
        return Promise.resolve({
          nodes: [],
          edges: [],
        });
      },
      style: {
        fill: darkMode ? '#a192c8' : '#d9cbff',
        stroke: darkMode ? '#a192c8' : '#d9cbff',
      },
      labelCfg: {
        style: {
          fontSize: 6,
          fill: darkMode ? '#fff' : '#000',
        },
      },
      nodeStateStyles: {
        hover: {
          stroke: '#6C53B1',
          lineWidth: 2,
        },
      },
    },
    edgeCfg: {
      style: {
        lineWidth: 1,
        fontSize: 6,
      },
      label: {
        style: {
          fontSize: 6,
          fill: darkMode ? '#ccc' : '#666',
        },
      },
      endArrow: {
        d: 10,
        size: 2,
      },
      edgeStateStyles: {
        hover: {
          stroke: '#6C53B1',
          lineWidth: 1,
        },
      },
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    onReady: (graph) => {
      chartRef.current = graph;
    },
  };

  useEffect(() => {
    if (datasourceValue) {
      getTraceDependencies(datasourceValue).then((res) => {
        setData(getRadialData(res));
      });
    }
  }, [datasourceValue]);

  useEffect(() => {
    setRedrawKey(_.uniqueId('redrawKey_'));
  }, [darkMode]);

  return (
    <PageLayout title={t('dependencies')}>
      <div>
        <div className='n9e-border-base p2'>
          <Space>
            <InputGroupWithFormItem label={t('common:datasource.type')}>
              <Select dropdownMatchSelectWidth={false} style={{ width: 90 }} value='jaeger'>
                {_.map(
                  [
                    {
                      label: 'Jaeger',
                      value: 'jaeger',
                    },
                  ],
                  (item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ),
                )}
              </Select>
            </InputGroupWithFormItem>
            <InputGroupWithFormItem label={t('common:datasource.id')}>
              <Select
                style={{ width: 100 }}
                value={datasourceValue}
                onChange={(val) => {
                  setDatasourceValue(val);
                }}
              >
                {_.map(groupedDatasourceList.jaeger, (item) => {
                  return <Select.Option value={item.id}>{item.name}</Select.Option>;
                })}
              </Select>
            </InputGroupWithFormItem>
          </Space>
          {!_.isEmpty(data) ? <RadialGraph key={redrawKey} {...config} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        </div>
      </div>
    </PageLayout>
  );
}
