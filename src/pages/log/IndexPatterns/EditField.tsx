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
import { PlusCircleOutlined, MinusCircleOutlined, InfoCircleOutlined, DownOutlined, UpOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Drawer, Row, Col, Space, Form, Input, Select, Button, FormInstance, Tag, Tabs, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getESIndexPattern, putESIndexPattern } from './services';
import { getFullFields } from '@/pages/explorer/Elasticsearch/services';
import { FieldConfigVersion2, convertToVersion2, FieldConfig } from './types';
import _ from 'lodash';
import { copy2ClipBoard } from '@/utils';
import InputEnlarge from '@/components/InputEnlarge';
import { IS_ENT } from '@/utils/constant';

interface IField {
  name: string;
  type: string;
}

interface Props {
  id: number;
  datasourceList: { id: number; name: string }[];
  onOk: (values: any, name: string) => void;
}

export const LinkTip = (t, replace: 'frontend' | 'backend', collapse: boolean) => {
  const leftBrace = replace === 'backend' ? '' : '{';
  const rightBrace = replace === 'backend' ? '' : '}';
  if (collapse) {
    return (
      <div>
        {t('日志中的字段均可被作为变量引用，如')}${'{'}key1{'}'}，${'{'}key2{'}'}，${'{'}a.b{'}'} ...
      </div>
    );
  }
  return (
    <>
      <div>
        {t('日志中的字段均可被作为变量引用，如')}${'{'}key1{'}'}，${'{'}key2{'}'}，${'{'}a.b{'}'}
      </div>
      <div>{t('内置变量')}：</div>
      <ul style={{ paddingInlineStart: 24 }}>
        <li>
          {t('起止时间')}：${'{'}__start_time__{'} '}
          {t('和')}${' {'}__end_time__{'}'}
        </li>
        {replace === 'frontend' && (
          <li>
            {t('时间偏移(单位毫秒，可为负数)')}：${'{'}__start_time_margin__{'} '}
            {t('和')}${' {'}__end_time_margin__{'}'}
          </li>
        )}
        <li>
          {t('本系统地址')}：${'{'}local_url{'}'}
          {t('，包含了协议和域名')}
        </li>
        <li>
          {t('本系统协议')}：${'{'}local_protocol{'}'}
          {t('，如')}: {t('“http')}:{t('” 或 “https')}:{t('”')}
        </li>
        <li>
          {t('本系统的域名')}：{'${'}local_domain{'}'}
          {t('，如 flashcat.cloud')}
        </li>
      </ul>
      <div>{t('样例')}：</div>
      <ul style={{ paddingInlineStart: 24 }}>
        <li style={{ marginTop: 8 }}>
          {t('跳转到仪表盘')}: ${'{'}local_url{'}'}/dashboards/132?p1=${leftBrace}key1{rightBrace}&p2=${leftBrace}key2{rightBrace}&__from=${'{'}__start_time__{'}'}
          &__to=${'{'}__end_time__{'}'}{' '}
          <a
            style={{
              fontWeight: 'bold',
              marginLeft: 5,
              marginRight: 5,
            }}
            onClick={() => {
              const address =
                '${local_url}/dashboards/132?p1=$' + leftBrace + 'key1' + rightBrace + '&p2=$' + leftBrace + 'key2' + rightBrace + '&__from=${__start_time__}&__to=${__end_time__}';
              copy2ClipBoard(address);
            }}
          >
            {t('复制')}
          </a>
        </li>
        {replace === 'frontend' && (
          <li style={{ marginTop: 8 }}>
            {t('时间偏移')}: ${'{'}local_url{'}'}/dashboards/132?__from=${'{'}__start_time__{'}'}
            &__to=${'{'}__end_time__{'}'}&${'{'}__start_time_margin__{'}'}=100&${'{'}__end_time_margin__{'}'}=100
            <a
              style={{
                fontWeight: 'bold',
                marginLeft: 5,
                marginRight: 5,
              }}
              onClick={() => {
                const address = '${local_url}/dashboards/132?__from=${__start_time__}&__to=${__end_time__}&${__start_time_margin__}=100&${__end_time_margin__}=200';
                copy2ClipBoard(address);
              }}
            >
              {t('复制')}
            </a>
          </li>
        )}
        {IS_ENT && (
          <li style={{ marginTop: 8 }}>
            {t('跳转到灭火图')}: ${'{'}local_url{'}'}/firemap?spaceId=2517270059626?label_1=${leftBrace}key1{rightBrace}&label_2=${leftBrace}key2{rightBrace}
            <a
              style={{
                fontWeight: 'bold',
                marginLeft: 5,
                marginRight: 5,
              }}
              onClick={() => {
                const address = '${local_url}/firemap?spaceId=2517270059626&label_1=$' + leftBrace + 'key1' + rightBrace + '&label_2=$' + leftBrace + 'key2' + rightBrace + '';
                copy2ClipBoard(address);
              }}
            >
              {t('复制')}
            </a>
          </li>
        )}
        <li style={{ marginTop: 8 }}>
          {t('跳转到日志查询')}: ${'{'}local_url{'}'}/log/explorer?data_source_name=elasticsearch&data_source_id=16&mode=Pattern&index_pattern=ds*&query_string=appname:${leftBrace}
          key1
          {rightBrace} AND logLevel:${leftBrace}key2{rightBrace}&start=${'{'}__start_time__{'}'}&end=${'{'}__end_time__{'}'}{' '}
          <a
            style={{
              fontWeight: 'bold',
              marginLeft: 5,
              marginRight: 5,
            }}
            onClick={() => {
              const address =
                '${local_url}/log/explorer?data_source_name=elasticsearch&data_source_id=16&mode=Pattern&index_pattern=ds*&query_string=appname:$' +
                leftBrace +
                'key1' +
                rightBrace +
                ' AND logLevel:$' +
                leftBrace +
                'key2' +
                rightBrace +
                '&start=${__start_time__}&end=${__end_time__}';
              copy2ClipBoard(address);
            }}
          >
            {t('复制')}
          </a>
        </li>
      </ul>
    </>
  );
};

function EditField(props: Props & ModalWrapProps) {
  const { t } = useTranslation('es-index-patterns');
  const { visible, destroy, id, onOk, datasourceList } = props;
  const [fieldsAll, setFields] = useState<IField[]>([]);
  const [name, setName] = useState('');
  const [editting, setEditting] = useState(false);
  const [datasourceId, setDatasourceId] = useState(0);
  const [timeField, setTimeField] = useState('');
  const [tabVal, setTabVal] = useState<string>('link');
  const [collapse, setCollapse] = useState(true);
  useEffect(() => {
    if (id) {
      getESIndexPattern(id).then((res) => {
        setName(res.name);
        setDatasourceId(res.datasource_id);
        setTimeField(res.time_field);
        let fieldConfig: FieldConfigVersion2 | FieldConfig;
        try {
          fieldConfig = JSON.parse(res.fields_format);
          if (fieldConfig.version === 1) {
            const fieldConfig2 = convertToVersion2(fieldConfig as FieldConfig);
            styleConfigForm.setFieldsValue(fieldConfig2);
            linkForm.setFieldsValue(fieldConfig2);
          } else if (fieldConfig.version === 2) {
            styleConfigForm.setFieldsValue(fieldConfig);
            linkForm.setFieldsValue(fieldConfig);
          }
        } catch (error) {
          console.error(error);
        }
        getFullFields(res.datasource_id, res.name).then((res) => {
          setFields(res.allFields);
        });
      });
    }
  }, [id]);
  const [linkForm] = Form.useForm();
  const [styleConfigForm] = Form.useForm();
  const finded = _.find(datasourceList, { id: datasourceId });

  return (
    <Drawer
      width={1000}
      destroyOnClose
      title={
        <Space>
          {t('common:btn.config')}
          {/* {editting ? <Input size='small' style={{ width: 200 }} value={name} onChange={(e) => setName(e.target.value)} /> : <strong>{name}</strong>}
          {editting ? <CheckOutlined onClick={() => setEditting(false)} /> : <EditOutlined onClick={() => setEditting(true)} />} */}
        </Space>
      }
      visible={visible}
      onClose={destroy}
      footer={
        <Space>
          <Button
            type='primary'
            onClick={async () => {
              if (tabVal === 'link') {
                await linkForm.validateFields();
              } else {
                await styleConfigForm.validateFields();
              }
              const linkArr = await linkForm.getFieldValue('linkArr');
              const arr = await styleConfigForm.getFieldValue('arr');
              onOk({ linkArr, arr }, name);
              destroy();
            }}
          >
            {t('common:btn.save')}
          </Button>
          <Button onClick={() => destroy()}>{t('common:btn.cancel')}</Button>
        </Space>
      }
    >
      <div style={{ padding: '8px 12px', border: '1px solid #DDD', borderRadius: 4 }}>
        <div>
          <strong>{name}</strong>
        </div>
        <div style={{ marginTop: 8, color: 'var(--fc-text-4)' }}>
          {t('common:datasource.name')}：{finded?.name}
          <span style={{ marginLeft: 36 }}>{t('time_field')}：</span>
          <span>{timeField || '-'}</span>
        </div>
      </div>
      <Tabs
        activeKey={tabVal}
        onChange={(val) => {
          setTabVal(val);
        }}
        destroyInactiveTabPane={false}
      >
        <Tabs.TabPane tab={t('link')} key='link'>
          <div style={{ marginBottom: 20, background: 'var(--fc-fill-3)', padding: '8px 12px', borderRadius: 6 }}>
            <div style={{ display: 'flex' }} className='tip-collapse'>
              <InfoCircleOutlined style={{ margin: '2px 4px' }} className='text-primary' />
              <div>
                {t('可为指定字段设置链接')}
                {LinkTip(t, 'frontend', collapse)}
                {collapse ? (
                  <Button type='link' onClick={() => setCollapse(!collapse)} style={{ padding: 0 }} size='small'>
                    {t('tipDisplay')} <DownOutlined />
                  </Button>
                ) : (
                  <Button type='link' onClick={() => setCollapse(!collapse)} style={{ padding: 0 }} size='small'>
                    {t('tipCollapse')} <UpOutlined />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Link {...{ form: linkForm, fieldsAll, t }} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('displayStyle')} key='displayStyle'>
          <div style={{ display: 'flex', marginBottom: 20, background: 'var(--fc-fill-3)', padding: '8px 12px', borderRadius: 6 }} className='tip-collapse'>
            <InfoCircleOutlined style={{ margin: '2px 4px' }} className='text-primary' />
            <div>
              <div>{t('可为指定字段设置展示样式，如，格式、别名等。')}</div>
              <div>{t(`tip1`, { skipInterpolation: true })}</div>
            </div>
          </div>
          <StyleConfig {...{ form: styleConfigForm, fieldsAll, t }} />
        </Tabs.TabPane>
      </Tabs>
    </Drawer>
  );
}

// 跳转链接和展示样式分布封装成一个form组件 ✅
// 提交的时候可以一起提交，分开保存 ✅
// 怎么使用，把version2 transfrom 为 version1的结构，然后跳转链接的展示样式参考日志分析中的样式 ✅
// 还要处理历史字段，给disable状态 ✅

export default ModalHOC<Props>(EditField);

function Link({ form, fieldsAll, t }) {
  const handleAppend = () => {
    const list = form.getFieldValue(['linkArr']);
    if (list) {
      form.setFieldsValue({
        linkArr: [...list, {}],
      });
    } else {
      form.setFieldsValue({
        linkArr: [{}],
      });
    }
  };
  return (
    <Form layout='vertical' form={form}>
      <Form.List
        name='linkArr'
        initialValue={[]}
        rules={
          [
            // {
            //   validator: async (_, names) => {
            //     if (!names || names.length === 0) {
            //       return Promise.reject(new Error(t('should_not_empty')));
            //     }
            //     // 判断names中的field字段不可重复
            //     const fieldValues: string[] = [];
            //     for (const item of names) {
            //       if (item?.field) {
            //         if (fieldValues.includes(item.field)) {
            //           return Promise.reject(new Error(t('should_not_dup')));
            //         }
            //         fieldValues.push(item.field);
            //       }
            //     }
            //     return Promise.resolve();
            //   },
            // },
          ]
        }
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.length > 0 && (
              <Row gutter={16} style={{ marginBottom: 8 }}>
                <Col span={4}>{t('keyword')}</Col>
                <Col span={16}>
                  {t('链接地址')}
                  <Tooltip
                    title={LinkTip(t, 'frontend', false)}
                    overlayInnerStyle={{
                      width: 500,
                    }}
                  >
                    <span className='ant-form-item-label' style={{ padding: 0 }}>
                      <label>
                        <QuestionCircleOutlined className='ant-form-item-tooltip' />
                      </label>
                    </span>
                  </Tooltip>
                </Col>
                <Col span={3}>{t('field.alias1')}</Col>
                <Col span={1}></Col>
              </Row>
            )}
            {fields.map(({ key, name }) => (
              <LinkFieldRow key={key} name={name} remove={remove} form={form} add={add} fields={fieldsAll} />
            ))}
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>
      <Button icon={<PlusOutlined />} onClick={handleAppend}>
        {t('跳转链接')}
      </Button>
    </Form>
  );
}

function StyleConfig({ form, fieldsAll, t }) {
  const handleAppend = () => {
    const list = form.getFieldValue(['arr']);
    if (list) {
      form.setFieldsValue({
        arr: [...list, {}],
      });
    } else {
      form.setFieldsValue({
        arr: [{}],
      });
    }
  };
  return (
    <Form layout='vertical' form={form}>
      <Form.List
        name='arr'
        initialValue={[]}
        rules={[
          {
            validator: async (_, names) => {
              // if (!names || names.length === 0) {
              //   return Promise.reject(new Error(t('should_not_empty')));
              // }
              // 判断names中的field字段不可重复
              const fieldValues: string[] = [];
              for (const item of names) {
                if (item?.field) {
                  if (fieldValues.includes(item.field)) {
                    return Promise.reject(new Error(t('should_not_dup')));
                  }
                  fieldValues.push(item.field);
                }
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map(({ key, name }) => (
              <FieldRow key={key} name={name} remove={remove} form={form} add={add} fields={fieldsAll} />
            ))}
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>
      <Button icon={<PlusOutlined />} onClick={handleAppend}>
        {t('展示样式')}
      </Button>
    </Form>
  );
}

function LinkFieldRow({ key, name, form, remove, add, fields }: { key: number; name: number; form: FormInstance; remove: (v) => void; add: () => void; fields: IField[] }) {
  const { t } = useTranslation('es-index-patterns');
  const formatType = Form.useWatch(['arr', name, 'formatMap', 'type'], form);

  return (
    <Row gutter={16} key={key}>
      <Col span={4}>
        <Form.Item name={[name, 'field']} style={{ width: '100%' }}>
          <Select
            placeholder={t('field.fieldPlaceholder', { skipInterpolation: true })}
            dropdownMatchSelectWidth={false}
            showSearch
            filterOption={(input, option: any) => {
              return option.value.indexOf(input) >= 0;
            }}
          >
            {fields.map((item) => (
              <Select.Option value={item.name}>{item.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={16}>
        <Form.Item name={[name, 'urlTemplate']} rules={[{ required: true, message: t('should_not_empty') }]}>
          <InputEnlarge placeholder={t('field.format.params.url.urlTemplatePlaceholder1', { skipInterpolation: true })} />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item name={[name, 'name']} rules={[{ required: true, message: t('should_not_empty') }]}>
          <Input placeholder={t('field.namePlaceholder')} />
        </Form.Item>
      </Col>

      <Col span={1} style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 6 }}>
        <Space>
          <MinusCircleOutlined className='datasource-form-icons' onClick={() => remove(name)} />
        </Space>
      </Col>
    </Row>
  );
}

function FieldRow({ key, name, form, remove, add, fields }: { key: number; name: number; form: FormInstance; remove: (v) => void; add: () => void; fields: IField[] }) {
  const { t } = useTranslation('es-index-patterns');
  const formatType = Form.useWatch(['arr', name, 'formatMap', 'type'], form);
  return (
    <Row gutter={16} key={key}>
      <Col flex='200px'>
        <Form.Item label={t('keyword')} name={[name, 'field']}>
          <Select
            placeholder={t('field.fieldPlaceholder')}
            dropdownMatchSelectWidth={false}
            showSearch
            filterOption={(input, option: any) => {
              return option.value.indexOf(input) >= 0;
            }}
            onChange={(v) => {
              const type = fields.find((i) => i.name === v)?.type || '';
              form.setFields([
                { name: ['arr', name, 'type'], value: type },
                // { name: ['arr', name, 'formatMap', 'type'], value: 'url' }, // 这里不允许新增了，也不用设置默认值了
              ]);
            }}
          >
            {fields.map((item) => (
              <Select.Option value={item.name}>{item.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col flex='84px'>
        <Form.Item label={t('field.type')} name={[name, 'type']}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col flex='184px'>
        <Form.Item label={t('field.alias')} name={[name, 'attrs', 'alias']} tooltip={t('field.alias_tip')}>
          <Input />
        </Form.Item>
      </Col>

      <Form.Item shouldUpdate={(prev, cur) => _.get(prev, ['arr', name, 'type']) !== _.get(cur, ['arr', name, 'type'])} noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue(['arr', name, 'type']);
          const urlTemplate = getFieldValue(['arr', name, 'formatMap', 'params', 'urlTemplate']);

          const formatTypeOptions: { label: string; value: string }[] = [];
          if (urlTemplate) {
            formatTypeOptions.push({
              label: 'URL',
              value: 'url',
            });
          }

          if (type === 'date') {
            formatTypeOptions.unshift({
              label: 'Date',
              value: 'date',
            });
          }
          return (
            <>
              {formatTypeOptions.length > 0 && (
                <Col flex='105px'>
                  <Form.Item label={t('field.format.type')} name={[name, 'formatMap', 'type']}>
                    <Select allowClear options={formatTypeOptions} />
                  </Form.Item>
                </Col>
              )}
              <>
                {formatType === 'date' && (
                  <Col flex='184px'>
                    <Form.Item
                      label={t('field.format.params.date.pattern')}
                      name={[name, 'formatMap', 'params', 'pattern']}
                      tooltip={t('field.format.params.date.pattern_tip')}
                      initialValue='YYYY-MM-DD HH:mm:ss.SSS'
                    >
                      <Input placeholder={t('field.format.params.date.pattern_placeholder')} />
                    </Form.Item>
                  </Col>
                )}
                {formatType === 'url' && (
                  <>
                    <Col flex='184px'>
                      <Form.Item
                        label={t('field.format.params.url.urlTemplate')}
                        name={[name, 'formatMap', 'params', 'urlTemplate']}
                        tooltip={{
                          title: (
                            <div>
                              <div>{t('field.format.params.url.urlTemplateTip2', { skipInterpolation: true })}</div>
                            </div>
                          ),
                          placement: 'topRight',
                          overlayInnerStyle: { width: 550 },
                        }}
                      >
                        <Input placeholder={t('field.format.params.url.urlTemplatePlaceholder', { skipInterpolation: true })} />
                      </Form.Item>
                    </Col>
                    <Col flex={'184px'}>
                      <Form.Item label={t('field.format.params.url.labelTemplate')} name={[name, 'formatMap', 'params', 'labelTemplate']} initialValue='{{value}}'>
                        <Input placeholder={t('field.format.params.url.labelTemplatePlaceholder', { skipInterpolation: true })} />
                      </Form.Item>
                    </Col>
                  </>
                )}
              </>
            </>
          );
        }}
      </Form.Item>

      <Col flex='33px' style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 33 }}>
        <Space>
          <MinusCircleOutlined className='datasource-form-icons' onClick={() => remove(name)} />
        </Space>
      </Col>
    </Row>
  );
}
