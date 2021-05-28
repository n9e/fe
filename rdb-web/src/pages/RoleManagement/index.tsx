import React, { useState, useEffect } from 'react';
import { Icon, Row, Col, Tabs, Tree, Button, message } from 'antd';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { RouteComponentProps } from 'react-router-dom';
import { normalizeTreeData } from '@pkgs/Layout/utils';
import _ from 'lodash';
import { Tenant } from '@interface';
import Members from '@cpts/Members';
import { appname } from '@common/config';
import request from '@pkgs/request';
import api from '@common/api';
import SiderList from './SiderList';
import CreateRole from './CreateRole';
import ModifyRole from './RoleDetail';
import './assets/style.less';

const { TabPane } = Tabs;
const { TreeNode } = Tree;

const renderTreeNodes = (data: any) =>
  _.map(data, (item: any) => {
    if (item.children) {
      return (
        <TreeNode title={item.cn} key={item.path} dataRef={item}>
          {renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode key={item.path} {...item} title={item.cn} />;
  });

function index(props: WrappedComponentProps & RouteComponentProps<{ type: 'global' | 'locale' }>) {
  const [cate, setCate] = useState(props.match.params.type);
  const [selectedItem, setSelectedItem] = useState<Tenant>();
  const [siderListKey, setSiderListKey] = useState(_.uniqueId('siderListKey'));
  const [state, setState] = useState<any>({
    treeData: [],
    meta: {},
    operations: [],
    opsTree: [],
    checkedKeys: [],
  });

  if (cate !== props.match.params.type) {
    setCate(props.match.params.type);
    setSelectedItem(undefined);
  }

  const sortBy = (node: any) => {
    if (node.children) {
      node.children = _.sortBy(node.children, 'weight')
      _.map(node.children, ((item: any) => {
        sortBy(item);
      }))
      return node
    }
    return node;
  }

  useEffect(() => {
    if (selectedItem) {
      request(`${api.role}/${selectedItem.id}`).then(async (res) => {
        if (res.role) {
          request(`${api.privileges}?typ=${res.role.cate}`).then((ops) => {
            let treeNodes = [] as any;
            const treeNodesUnWeight = normalizeTreeData(_.cloneDeep(ops));
            treeNodes = _.map(treeNodesUnWeight, ((item: any) => sortBy(item)));
            setState({
              ...state,
              meta: res.role,
              operations: res.operations,
              treeData: _.sortBy(treeNodes, 'weight')
            });
          })
        }
      });
    }
  }, [selectedItem]);


  const onExpand = (expandedKeys: any) => {
    setState({
      ...state,
      expandedKeys,
      autoExpandParent: false,
    });
  };

  const onCheck = (checkedKey: any, e: any) => {
    const checkedKeys = checkedKey.map((item: string) => Number(item));
    const checked: any[] = [];
   _.map(e.checkedNodes, (item: any) => (item.props.path ? checked.push(item.props.path) : ''))
    setState({ ...state, operations: checked, checkedKeys })
  };

  return (
    <Row gutter={20}>
      <Col span={6}>
        <SiderList
          key={siderListKey}
          subType={cate}
          title={props.intl.formatMessage({ id: 'menu.rdb.superUser.role-management' })}
          intl={props.intl}
          selectedItem={selectedItem}
          onChange={(item) => {
            setSelectedItem(item);
          }}
          onCreate={() => {
            CreateRole({
              language: props.intl.locale,
              cate,
              onOk: () => {
                setSiderListKey(_.uniqueId('siderListKey'));
              },
            });
          }}
          onDelete={(id) => {
            request(`${api.role}/${id}`, {
              method: 'DELETE',
            }).then(() => {
              setSelectedItem(undefined);
              setSiderListKey(_.uniqueId('siderListKey'));
              message.success(props.intl.formatMessage({ id: 'msg.delete.success' }));
            });
          }}
        />
      </Col>
      <Col span={18}>
        <div className={`${appname}-role-meta`}>
          <h4>
            <span style={{ paddingRight: 10 }}>{_.get(selectedItem, 'name')}</span>
            <a>
              <Icon
                type="edit"
                onClick={() => {
                  ModifyRole({
                    language: props.intl.locale,
                    data: selectedItem,
                    cate,
                    meta: state.meta,
                    operations: state.operations,
                    onOk: () => {
                      setSiderListKey(_.uniqueId('siderListKey'));
                    },
                  });
                }}
              />
            </a>
          </h4>
          <div className={`${appname}-role-meta-detail`}>
            <span>
              {props.intl.formatMessage({ id: 'table.note' })}: {_.get(selectedItem, 'note')}
            </span>
          </div>
        </div>
        <Tabs defaultActiveKey="role">
          <TabPane tab={props.intl.formatMessage({ id: 'role.tab.operations' })} key="role">
            <div style={{ border: '1px solid #efefef' }}>
              <Tree
                checkable
                onExpand={onExpand}
                expandedKeys={state.expandedKeys}
                autoExpandParent={state.autoExpandParent}
                onCheck={onCheck}
                checkedKeys={state.operations}
              >
                {renderTreeNodes(state.treeData)}
              </Tree>
            </div>
            <Button
              type="primary"
              style={{ marginTop: 10 }}
              onClick={() => {
                if (selectedItem) {
                  request(`${api.role}/${selectedItem.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                      ...state.meta,
                      operations: state.operations,
                    }),
                  }).then(() => {
                    setState({
                      ...state,
                      operations: state.operations,
                    });
                    message.success('保存成功！');
                  });
                }
              }}
            >
              <FormattedMessage id="form.save" />
            </Button>
          </TabPane>
          {
            _.get(selectedItem, 'cate') === 'global' ?
              <TabPane tab={props.intl.formatMessage({ id: 'role.tab.members' })} key="member">
                <Members type="role" id={_.get(selectedItem, 'id')} />
              </TabPane> : null
          }
        </Tabs>
      </Col>
    </Row>
  );
}

export default injectIntl(index);
