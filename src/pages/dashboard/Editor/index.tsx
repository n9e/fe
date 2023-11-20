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
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Select, Space, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { IRawTimeRange } from '@/components/TimeRangePicker';
import { visualizations, defaultValues, defaultCustomValuesMap, defaultOptionsValuesMap } from './config';
import { IVariable } from '../VariableConfig';
import FormCpt from './Form';
import { IPanel } from '../types';
import { normalizeInitialValues } from './util';

interface IProps {
  mode: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialValues: IPanel;
  variableConfigWithOptions?: IVariable[];
  id: string; // panel id
  dashboardId: string;
  time: IRawTimeRange;
  onOK: (formData: any, mode: string) => void;
}

function index(props: IProps) {
  const { t, i18n } = useTranslation('dashboard');
  const formRef = useRef<any>();
  const { mode, visible, setVisible, variableConfigWithOptions, id, dashboardId, time } = props;
  const [initialValues, setInitialValues] = useState<IPanel>(_.cloneDeep(props.initialValues));
  const [range, setRange] = useState<IRawTimeRange>(time);
  const handleAddChart = async () => {
    if (formRef.current && formRef.current.getFormInstance) {
      const formInstance = formRef.current.getFormInstance();
      formInstance.validateFields().then(async (values) => {
        // TODO: 渲染 hexbin 图时，colorRange 需要从 string 转换为 array
        if (values.type === 'hexbin') {
          _.set(values, 'custom.colorRange', _.split(values.custom.colorRange, ','));
        }
        let formData = Object.assign(values, {
          version: '3.0.0',
        });
        if (values && values.id) {
          formData.id = values.id;
        } else {
          formData.id = uuidv4();
        }
        props.onOK(formData, mode);
        setVisible(false);
      });
    }
  };

  useEffect(() => {
    const initialValuesCopy = _.cloneDeep(props.initialValues);
    initialValuesCopy.type = initialValuesCopy.type || defaultValues.type;
    // TODO: 渲染 hexbin 配置时，colorRange 需要从 array 转换为 string
    if (initialValuesCopy.type === 'hexbin' && initialValuesCopy?.custom?.colorRange) {
      if (_.isArray(initialValuesCopy.custom.colorRange)) {
        _.set(initialValuesCopy, 'custom.colorRange', _.join(initialValuesCopy.custom.colorRange, ','));
        setInitialValues(initialValuesCopy);
      } else {
        setInitialValues(initialValuesCopy);
      }
    } else {
      setInitialValues(initialValuesCopy);
    }
  }, [JSON.stringify(props.initialValues)]);

  return (
    <Modal
      width='100%'
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{initialValues ? t('panel.title.add') : t('panel.title.edit')}</div>
          <Space style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 12, lineHeight: '20px' }}>
            <Select
              dropdownMatchSelectWidth={false}
              value={initialValues.type}
              onChange={(val) => {
                if (formRef.current && formRef.current.getFormInstance) {
                  const formInstance = formRef.current.getFormInstance();
                  const values = formInstance.getFieldsValue();
                  const valuesCopy = _.cloneDeep(values);
                  _.set(valuesCopy, 'type', val);
                  _.set(valuesCopy, 'custom', defaultCustomValuesMap[val]);
                  _.set(valuesCopy, 'options', defaultOptionsValuesMap[val]);
                  setInitialValues(valuesCopy);
                }
              }}
            >
              {_.map(visualizations, (item) => {
                return (
                  <Select.Option value={item.type} key={item.type}>
                    {t(`visualizations.${item.type}`)}
                  </Select.Option>
                );
              })}
            </Select>
            <TimeRangePicker
              dateFormat='YYYY-MM-DD HH:mm:ss'
              value={range}
              onChange={(val: IRawTimeRange) => {
                setRange(val);
              }}
            />
            <CloseOutlined
              style={{ fontSize: 18 }}
              onClick={() => {
                setVisible(false);
              }}
            />
          </Space>
        </div>
      }
      style={{ top: 10, padding: 0 }}
      visible={visible}
      closable={false}
      destroyOnClose
      footer={[
        <Button
          key='cancel'
          onClick={() => {
            setVisible(false);
          }}
        >
          {t('common:btn.cancel')}
        </Button>,
        <Button
          key='ok'
          type='primary'
          onClick={() => {
            handleAddChart();
          }}
        >
          {t('common:btn.save')}
        </Button>,
      ]}
      onCancel={() => {
        setVisible(false);
      }}
      bodyStyle={{
        padding: '10px 24px 24px 24px',
      }}
    >
      {!_.isEmpty(initialValues) && (
        <FormCpt
          ref={formRef}
          initialValues={normalizeInitialValues(initialValues)}
          variableConfigWithOptions={variableConfigWithOptions}
          range={range}
          id={id}
          dashboardId={dashboardId}
          key={initialValues.type} // 每次切换图表类型，都重新渲染
        />
      )}
    </Modal>
  );
}

export default index;
