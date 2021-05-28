import React, { useState, useEffect } from 'react'
import { normalizeTreeData } from '@pkgs/Layout/utils';
import { TreeNodes } from './interface'
import request from '@pkgs/request';
import api from '@pkgs/api';
import _ from 'lodash';
import { Tree, Button, Modal, Form, message } from 'antd';
import ContextMenu from '@pkgs/ContextMenu';
import { nodeEditorModal } from './BaseAddForm';
import BaseFormGroupForm from './BaseAddGroupForm';
import { nodeImportModal } from './BatchImportExportModal';

export interface IState {
  tree: any[],
  treeData: TreeNodes[],
  treeNodes: TreeNodes[],
  expandedKeys?: string[],
  autoExpandParent: boolean,
  checkedKeys: any,
}

interface IType {
  type: string,
}

const { TreeNode } = Tree;

const Global = (props: IType | any) => {
  const [state, setState] = useState<IState>({
    treeData: [],
    treeNodes: [] as any,
    expandedKeys: [],
    autoExpandParent: true,
    checkedKeys: [],
    tree: []
  })
  const [rightOnclick, setRightClick] = useState({
    contextMenuVisiable: false,
    contextMenuTop: 0,
    contextMenuLeft: 0,
    contextMenuType: 'createPdl',
    contextMenuSelectedNode: {},
  });
  const [groupVisable, setGroupVisable] = useState(false)
  const [selectNode, setSelectNode] = useState([]) as any;
  const [checkedNodes, setCheckedNodes] = useState([]) as any;
  const { type } = props
  const fetchData = async () => {
    const tree = await request(`${api.privileges}?typ=${type}`);
    let treeNodes = [] as any;
    const treeNodesUnWeight = normalizeTreeData(_.cloneDeep(tree));
    treeNodes = _.map(treeNodesUnWeight, ((item: any) => sortBy(item)))
    setState({
      ...state,
      tree: tree,
      treeData: _.sortBy(treeNodes, 'weight')
    })
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

  const renderTreeNodes = (data: any) =>
    data.map((item: any) => {
      if (item.children) {
        return (
          <TreeNode title={item.cn} key={item.id} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} {...item} title={item.cn} />;
    });


  const onExpand = (expandedKeys: any) => {
    setState({
      ...state,
      expandedKeys,
      autoExpandParent: false,
    });
  };

  const handleCreatePrivileges = (value: string) => {
    setRightClick({ ...rightOnclick, contextMenuVisiable: false });
    const selectNode = rightOnclick.contextMenuSelectedNode as any;
    let weight = 0;
    if (selectNode.children) {
      weight = selectNode.children.length + 1;
    } else {
      weight = 1;
    }
    nodeEditorModal({
      type: 'create',
      onOk: (values: any, destroy: any) => {
        const { id, typ, path } = selectNode.dataRef ? selectNode.dataRef : selectNode;
        request(api.privileges, {
          method: 'POST',
          body: JSON.stringify([{
            ...values,
            typ: value === 'first' ? type : typ,
            pid: value === 'first' ? 0 : id,
            weight: value === 'first' ? state.treeData.length + 1 : weight,
            path: value === 'first' ? values.en : `${path}.${values.en}`,
          }]),
        }).then(() => {
          message.success('sucess');
          fetchData();
          if (destroy) destroy();
        });
      },
    })
  }

  const handleCreateGroupPrivileges = () => {
    setRightClick({ ...rightOnclick, contextMenuVisiable: false });
    setGroupVisable(true)
    let selectedNode = rightOnclick.contextMenuSelectedNode as any;
    const data = selectedNode.dataRef || selectedNode
    setSelectNode(data);
  }

  const handleModifyPrivileges = () => {
    setRightClick({ ...rightOnclick, contextMenuVisiable: false });
    let selectNode = [] as any
    selectNode = rightOnclick.contextMenuSelectedNode as any;
    nodeEditorModal({
      type: 'modify',
      initialValues: selectNode.dataRef || selectNode,
      onOk: (values: any, destroy: any) => {
        const { id, typ, path, pid, weight } = selectNode.dataRef || selectNode;
        request(api.privileges, {
          method: 'PUT',
          body: JSON.stringify([{
            ...values,
            typ: typ,
            id: id,
            pid: pid,
            weight: weight,
            path: path,
          }]),
        }).then(() => {
          message.success('sucess');
          fetchData();
          selectNode = [];
          if (destroy) destroy();
        });
      },
      onCancel: () => {
        selectNode = []
      }
    })
  }

  const onCheck = (checkedKey: any, e: any) => {
    setCheckedNodes(e.checkedNodes);
    const checkedKeys = checkedKey.map((item: string) => Number(item));
    setState({ ...state, checkedKeys })
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确定删除选中权限点？',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        request(api.privileges, {
          method: 'DELETE',
          body: JSON.stringify(state.checkedKeys)
        }).then(() => fetchData())
      },
    });
  }

  const handleDeletePrivileges = () => {
    setRightClick({ ...rightOnclick, contextMenuVisiable: false });
    Modal.confirm({
      title: '删除权限点',
      onOk: () => {
        const selectedNode = rightOnclick.contextMenuSelectedNode as any;
        const { id } = selectedNode;
        request(api.privileges, {
          method: 'DELETE',
          body: JSON.stringify([id])
        }).then(() => {
          message.success('success');
          fetchData();
          Modal.destroyAll();
        });
      },
    });
  }

  const nodeImport = () => {
    nodeImportModal({
      type: 'import',
      onOk: (destroy: any) => {
        fetchData();
        if (destroy) destroy();
      }
    })
  }

  const nodeExport = (checkedNodes: any[]) => {
    const newCheckedNodes = _.map(checkedNodes, (row) => {
      let record = row.props;
      if (record.children) {
        record = {
          cn: record.dataRef.cn,
          en: record.dataRef.en,
          weight: record.dataRef.weight,
          path: record.dataRef.path,
          leaf: record.dataRef.leaf,
          typ: record.dataRef.typ,
        };
      } else {
        record = {
          cn: row.props.cn,
          en: row.props.en,
          weight: row.props.weight,
          path: row.props.path,
          leaf: row.props.leaf,
          typ: row.props.typ,
        };
      }
      return record;
    });
    nodeImportModal({
      data: newCheckedNodes,
      type: 'export',
      onOk: (destroy: any) => {
        fetchData();
        if (destroy) destroy();
      }
    })
  }

  const onCancel = () => setGroupVisable(false)

  const onDrop = (info: any) => {
    const { node, dragNode } = info;
    const dropPid = node.props.dataRef ? node.props.dataRef.pid : node.props.pid;
    const dragPid = dragNode.props.dataRef ? dragNode.props.dataRef.pid : dragNode.props.pid;
    if (dropPid === dragPid) {
      const dropKey = !!node.props.weight ? node.props.weight : node.props.dataRef.weight;
      const dragKey = dragNode.props.weight ? dragNode.props.weight : dragNode.props.dataRef.weight;
      const dropId = !!node.props.id ? node.props.id : node.props.dataRef.id;
      const dragId = !!dragNode.props.id ? dragNode.props.id : dragNode.props.dataRef.id;
      const treeWeight = state.tree.filter((item: any) => {
        if (item.pid === dropPid) {
          if (item.id === dropId) item.weight = dragKey;
          if (item.id === dragId) item.weight = dropKey
          return item
        }
      }).map((item: any) => ({ id: item.id, weight: item.weight }))
      request(api.privilegesWeights, {
        method: 'PUT',
        body: JSON.stringify(treeWeight)
      }).then(() => fetchData())
    }
  }

  useEffect(() => { fetchData() }, [])

  return <>
    <Button onClick={() => handleCreatePrivileges('first')}>添加一级权限</Button>
    <Button style={{ marginLeft: 8 }} onClick={handleDelete}>批量删除</Button>
    <Button style={{ marginLeft: 8 }} onClick={nodeImport}>导入</Button>
    <Button style={{ marginLeft: 8 }} onClick={() => nodeExport(checkedNodes)}>导出</Button>
    <Tree
      checkable
      onExpand={onExpand}
      expandedKeys={state.expandedKeys}
      autoExpandParent={state.autoExpandParent}
      onCheck={onCheck}
      checkedKeys={state.checkedKeys}
      draggable
      onDrop={onDrop}
      onRightClick={(e) => {
        e.event.stopPropagation();
        setRightClick({
          contextMenuVisiable: true,
          contextMenuLeft: e.event.clientX,
          contextMenuTop: e.event.clientY,
          contextMenuType: 'operate',
          contextMenuSelectedNode: e.node.props,
        });
      }}
    >
      {renderTreeNodes(state.treeData)}
    </Tree>
    <ContextMenu
      visible={rightOnclick.contextMenuVisiable}
      left={rightOnclick.contextMenuLeft}
      top={rightOnclick.contextMenuTop}>
      <ul
        className="ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root"
      >
        <li className="ant-dropdown-menu-item">
          <a onClick={() => handleCreatePrivileges('hasChildren')}>创建权限</a>
        </li>
        <li className="ant-dropdown-menu-item">
          <a onClick={handleModifyPrivileges}>修改权限</a>
        </li>
        <li className="ant-dropdown-menu-item" >
          <a onClick={handleDeletePrivileges}>删除权限</a>
        </li>
        <li className="ant-dropdown-menu-item">
          <a onClick={handleCreateGroupPrivileges}>批量添加权限</a>
        </li>
      </ul>
    </ContextMenu>
    <Modal
      visible={groupVisable}
      footer={null}
      onCancel={onCancel}
      width={700}
    >
      <BaseFormGroupForm
        selectNode={selectNode}
        onCanel={onCancel}
        fetchData={fetchData}
      />
    </Modal>
  </>
}

export default Form.create()(Global);
