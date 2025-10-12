import React, { useEffect, useContext, useRef } from 'react';
import { Form, Input, Row, Col, Select, Switch, Button, Space } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { IVariable } from '../../types';
import { typeOptions } from '../../constant';
import adjustData from '../../utils/ajustData';
import { formatString } from '../../utils/formatString';

import Query from './Query';
import Textbox from './Textbox';
import Custom from './Custom';
import Constant from './Constant';
import Datasource from './Datasource';
import DatasourceIdentifier from './DatasourceIdentifier';
import HostIdent from './HostIdent';

interface IProps {
  index: number;
  data: IVariable;
  variablesWithOptions: IVariable[];
  datasourceVars: IVariable[];
  editMode?: number; // 0: 变量名、类型、数据源类型、数据源值无法修改
  onOk: (val: IVariable) => void;
  onCancel: () => void;
}

function EditItem(props: IProps) {
  const { t } = useTranslation('dashboard');
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { datasourceList } = useContext(CommonStateContext);
  const { data, variablesWithOptions, datasourceVars, onOk, onCancel, editMode } = props;
  const anonymousAccess = dashboardMeta.public === 1 && dashboardMeta.public_cate === 0;
  const [form] = Form.useForm();
  const otherVars = _.filter(variablesWithOptions, (item) => item.name !== data.name);
  const varType = Form.useWatch('type', form);
  const regStr = Form.useWatch('reg', form);
  const regexStr = Form.useWatch('regex', form); // datasource, datasourceIdentifier 特有
  const formatedReg = regStr
    ? formatString(
        regStr,
        adjustData(variablesWithOptions, {
          datasourceList: datasourceList,
        }),
      )
    : '';
  const formatedRegex = regexStr
    ? formatString(
        regexStr,
        adjustData(variablesWithOptions, {
          datasourceList: datasourceList,
        }),
      )
    : '';
  const footerExtraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    form.setFieldsValue(data);
  }, [JSON.stringify(data)]);

  return (
    <Form layout='vertical' autoComplete='off' preserve={false} form={form}>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label={t('var.name')}
            name='name'
            rules={[
              { required: true },
              { pattern: /^[0-9a-zA-Z_]+$/, message: t('var.name_msg') },
              () => ({
                validator(_rule, value) {
                  // 如果 name 重复，提示错误
                  if (_.find(otherVars, { name: value })) {
                    return Promise.reject(t('var.name_repeat_msg'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input disabled={editMode === 0} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('var.label')} name='label'>
            <Input disabled={editMode === 0} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('var.type')} name='type' rules={[{ required: true }]}>
            <Select
              style={{ width: '100%' }}
              onChange={(val) => {
                form.setFieldsValue({
                  definition: '',
                  defaultValue: '',
                  hide: _.includes(['constant'], val),
                });
              }}
              disabled={editMode === 0}
            >
              {_.map(typeOptions, (item) => {
                return (
                  <Select.Option value={item.value} key={item.value}>
                    {t(`var.type_map.${item.value}`)}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
        {/* initialValue 值为了兼容旧的 constant 默认值为 true */}
        <Col span={6}>
          <Form.Item label={t('var.hide')} name='hide' valuePropName='checked' initialValue={_.includes(['constant'], varType)}>
            <Switch disabled={editMode === 0} />
          </Form.Item>
        </Col>
      </Row>
      {varType === 'query' && <Query datasourceVars={datasourceVars} variablesWithOptions={variablesWithOptions} formatedReg={formatedReg} footerExtraRef={footerExtraRef} />}
      {varType === 'textbox' && <Textbox />}
      {varType === 'custom' && <Custom footerExtraRef={footerExtraRef} />}
      {varType === 'constant' && <Constant />}
      {varType === 'datasource' && <Datasource editMode={editMode} formatedReg={formatedRegex} footerExtraRef={footerExtraRef} />}
      {varType === 'datasourceIdentifier' && <DatasourceIdentifier editMode={editMode} formatedReg={formatedRegex} footerExtraRef={footerExtraRef} />}
      {varType === 'hostIdent' && <HostIdent formatedReg={formatedReg} footerExtraRef={footerExtraRef} />}
      <Form.Item>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((res) => {
                onOk(res);
              });
            }}
            disabled={varType === 'hostIdent' && anonymousAccess}
          >
            {t('common:btn.save')}
          </Button>
          <Button onClick={onCancel}>{t('common:btn.cancel')}</Button>
          <div ref={footerExtraRef} />
        </Space>
      </Form.Item>
    </Form>
  );
}

export default EditItem;
