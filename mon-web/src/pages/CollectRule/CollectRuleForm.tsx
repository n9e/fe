import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, TreeSelect, Select, Collapse, Popover, InputNumber, Modal } from 'antd';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import request from '@pkgs/request';
import api from '@common/api';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import { TreeNode } from '@pkgs/interface';
import { nameRule, interval } from './config';
import Fields from './Fields';

const FormItem = Form.Item;
const { Option } = Select;
const { Panel } = Collapse;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 10,
    },
  },
};

const clearDirtyReqData = (data: any) => {
  function make(dat: any) {
    _.forEach(dat, (val, key) => {
      if (_.isArray(val)) {
        const newVal = _.compact(val);
        if (newVal.length) {
          dat[key] = _.map(newVal, (item) => {
            make(item);
            return item;
          });
        } else {
          delete dat[key];
        }
      }
    });
  }
  make(data);
};

const CreateForm = (props: any) => {
  const { getFieldDecorator, validateFields, getFieldProps } = props.form;
  const nType = _.get(props.match, 'params.type');
  const query = queryString.parse(props.location.search);
  const [fields, setFields] = useState<any>([]);
  const [value, setValue] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [regionData, setRegionData] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const dat = await request(
        `${api.createRules}?id=${query.id}&type=${query.type}`,
      );
      setValue(dat);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  const fetchRegionData = () => {
    return request(`${api.regions}`);
  };

  const handlerPOST = (data: any, dryrun: boolean) => {
    request(api.createRules, {
      method: 'POST',
      body: JSON.stringify([
        {
          type: query.type,
          data,
        },
      ]),
    })
      .then((res) => {
        if (dryrun) {
          Modal.info({
            title: '????????????',
            width: '50%',
            content: (
              <pre
                style={{ height: 500 }}
              >
                {res}
              </pre>
            ),
          });
        } else {
          message.success('???????????????');
          props.history.push({
            pathname: '/collect-rules',
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handlerPUT = (data: any, dryrun: boolean) => {
    request(api.createRules, {
      method: 'PUT',
      body: JSON.stringify({
        type: query.type,
        data,
      }),
    })
      .then((res) => {
        if (dryrun) {
          Modal.info({
            title: '????????????',
            width: '50%',
            content: (
              <pre
                style={{ height: 500 }}
              >
                {res}
              </pre>
            ),
          });
        } else {
          message.success('???????????????');
          props.history.push({
            pathname: '/collect-rules',
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handleSubmit = (e: any, dryrun = false) => {
    e.preventDefault();
    validateFields((err: any, values: any) => {
      console.log(values);
      // TODO: ???????????????????????????????????????
      clearDirtyReqData(values);
      const baseData: any = {
        nid: Number(values.nid),
        name: values.name,
        region: values.region,
        timeout: values.timeout,
        comment: values.comment,
        tags: values.tags,
        step: values.step,
        collect_type: query.type,
      };
      _.forEach(baseData, (_val, key) => {
        delete values[key];
      });
      const data = {
        ...baseData,
        data: values,
        dryrun,
      };
      if (!err) {
        if (nType === 'add') {
          handlerPOST(data, dryrun);
        } else {
          handlerPUT({
            ...data,
            id: value.id,
          }, dryrun);
        }
      }
    });
  };
  const getTemplate = () => {
    return request(`${api.collectRules}/${query.type}/template`).then((res) => {
      setFields(res);
    });
  };
  const fetchTreeData = () => {
    return request(api.tree).then((res) => {
      return normalizeTreeData(res);
    });
  };

  useEffect(() => {
    getTemplate();
    fetchTreeData().then((res) => {
      setTreeData(res);
    });
    fetchRegionData().then((res) => {
      setRegionData(res);
    });
    if (nType === 'add') {
      setLoading(false);
    } else {
      fetchData();
    }
  }, []);
  return (
    <>
      <p style={{ fontSize: 14 }}>
        <b>
          {
            nType === 'add' ? `?????? ${query.type} ????????????` : `?????? ${value.collect_type} ????????????`
          }
        </b>
      </p>
      <Form onSubmit={handleSubmit}>
        <Collapse
          defaultActiveKey={['1', '2']}
        >
          <Panel header="????????????" key="1">
            <FormItem
              label={<Popover content="nid">????????????</Popover>}
              required
              {...formItemLayout}
            >
              {getFieldDecorator('nid', {
                initialValue: query.nid,
                rules: [{ required: true, message: '??????????????????' }],
              })(
                <TreeSelect
                  showSearch
                  allowClear
                  treeDefaultExpandAll
                  treeNodeFilterProp="path"
                  treeNodeLabelProp="path"
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                >
                  {renderTreeNodes(treeData, 'treeSelect')}
                </TreeSelect>,
              )}
            </FormItem>
            <FormItem
              label={<Popover content="name">????????????</Popover>}
              {...formItemLayout}
            >
              <Input
                {...getFieldProps('name', {
                  initialValue: nType === 'modify' ? value?.name : '',
                  rules: [{ required: true, message: '????????????' }, nameRule],
                })}
                size="default"
                placeholder="?????????????????????????????????????????? '?????????????????????'"
              />
            </FormItem>
            <FormItem
              label={<Popover content="region">????????????</Popover>}
              {...formItemLayout}
            >
              <Select
                size="default"
                {...getFieldProps('region', {
                  initialValue: value?.region || regionData[0],
                  rules: [{ required: true, message: '????????????' }],
                })}
              >
                {_.map(regionData, item => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={<Popover content="timeout">??????????????????</Popover>}
            >
              <InputNumber
                min={1}
                size="default"
                style={{ width: 100 }}
                {...getFieldProps('timeout', {
                  initialValue: nType === 'modify' ? value?.timeout : 10,
                  rules: [{ required: true, message: '????????????' }],
                })}
              />{' '}
              ???
            </FormItem>
            <FormItem
              label={<Popover content="step">????????????</Popover>}
              {...formItemLayout}
            >
              <Select
                size="default"
                style={{ width: 100 }}
                {...getFieldProps('step', {
                  initialValue: value?.step || 60,
                  rules: [{ required: true, message: '????????????' }],
                })}
              >
                {_.map(interval, item => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>{' '}
              ???
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={<Popover content="tags">????????????</Popover>}
            >
              <Input
                type="textarea"
                placeholder="??????????????????????????????tag?????????region=bj,dept=cloud"
                {...getFieldProps('tags', {
                  initialValue: nType === 'modify' ? value?.tags : '',
                })}
              />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={<Popover content="comment">??????</Popover>}
            >
              <Input
                type="textarea"
                placeholder=""
                {...getFieldProps('comment', {
                  initialValue: nType === 'modify' ? value?.comment : '',
                })}
              />
            </FormItem>
            {nType !== 'modify' ? null : (
              <div>
                <FormItem
                  {...formItemLayout}
                  label={<Popover content="updater">?????????</Popover>}
                >
                  <div>{value.updater}</div>
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={<Popover content="updated_at">????????????</Popover>}
                >
                  <div>{moment.unix(value.updated_at).format('YYYY-MM-DD HH:mm:ss')}</div>
                </FormItem>
              </div>
            )}
          </Panel>
          <Panel header="????????????" key="2">
            {fields?.fields?.map((item: any) => {
              return (
                <Fields
                  {...formItemLayout}
                  key={item.name}
                  loading={loading}
                  nType={nType}
                  field={item}
                  definitions={fields.definitions || {}}
                  initialValues={value.data || {}}
                  getFieldDecorator={getFieldDecorator}
                />
              );
            })}
          </Panel>
        </Collapse>
        <FormItem {...tailFormItemLayout} style={{ marginTop: 10 }}>
          <Button
            type="primary"
            onClick={(e) => {
              handleSubmit(e, true);
            }}
          >
            ??????
          </Button>
          <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
            ??????
          </Button>
          <Button style={{ marginLeft: 8 }}>
            <Link to={{ pathname: '/collect-rules' }}>??????</Link>
          </Button>
        </FormItem>
      </Form>
    </>
  );
};

export default CreateIncludeNsTree(Form.create()(CreateForm));
