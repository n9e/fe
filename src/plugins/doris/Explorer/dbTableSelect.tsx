import React, { useState, useEffect, Key } from 'react';
import { Tree, Dropdown, Menu, Spin, Form } from 'antd';
import { getDorisDatabases, getDorisTables, getDorisTableDesc } from '../services';
import { DatasourceCateEnum } from '@/utils/constant';
import type { TreeProps } from 'antd/es/tree';
import { ITreeSelect, IStatCalcMethod } from '../types';
import type { MenuProps, FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import { statisticsGraphSQl } from '../services';

interface DataNode {
  title: string;
  key: string;
  level: string;
  type2?: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });

const getParentNodeList = (list: DataNode[], keyPath: React.Key[]): DataNode[] => {
  const [key, ...rest] = keyPath;
  if (rest.length === 0) return list;
  const node = list.find((i) => i.key === key);
  if (node?.children) {
    return getParentNodeList(node.children, rest);
  }
  return list;
};

const getNodeChildList = (list: DataNode[], db: string, table: string): DataNode[] => {
  const dbNode = list.find((i) => i.key === db);
  if (!dbNode) return [];
  const tableNode = dbNode.children?.find((i) => i.key === table);
  return tableNode?.children || [];
};
interface Props {
  datasourceCate: DatasourceCateEnum;
  datasourceValue: number;
  onTreeClick: (v: ITreeSelect) => void;
  form: FormInstance;
  mode: string;
}
export default function ExploreSelect(props: Props) {
  const { t } = useTranslation('db_doris');
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const { datasourceCate, datasourceValue, form, mode } = props;
  const [dropDownVisibleKey, setDropDownVisibleKey] = useState<Key>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    getDorisDatabases({ cate: datasourceCate, datasource_id: datasourceValue }).then((res) => {
      setTreeData(res.map((i) => ({ title: i, key: i, level: 'db' })));
      setLoading(false);
    });
  }, [datasourceValue]);

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    // tree上必须选一个，不能取消，所以selected为false直接忽略
    if (info.selected) {
      if (selectedKeys.length === 0) return;
      const [db, table, field] = (selectedKeys[0] as string).split('*%*');
      if (db && table) {
        props.onTreeClick({ db, table, field });
        form.setFields([
          { name: ['query', 'database'], value: db },
          { name: ['query', 'table'], value: table },
        ]);
        const fieldList = getNodeChildList(treeData, db, db + '*%*' + table);
        const firstDateField = fieldList.find((i) => i.type2 === 'date');
        if (firstDateField) {
          const [, , dateField] = firstDateField.key.split('*%*');
          form.setFields([{ name: ['query', 'time_field'], value: dateField }]);
        }
      }
    }
  };

  const onLoadData = async ({ key, children, level }: any) => {
    if (level === 'db') {
      const tables = await getDorisTables({ cate: datasourceCate, datasource_id: datasourceValue, query: [key] });
      tables &&
        setTreeData((origin) =>
          updateTreeData(
            origin,
            key,
            tables.map((i) => ({ title: i, key: key + '*%*' + i, level: 'table' })),
          ),
        );
    } else if (level === 'table') {
      const [database, table] = key.split('*%*');
      const tableDesc = await getDorisTableDesc({ cate: datasourceCate, datasource_id: datasourceValue, query: [{ database, table }] });
      tableDesc &&
        setTreeData((origin) =>
          updateTreeData(
            origin,
            key,
            tableDesc.map((i) => ({ title: `${i.field} (${i.type})`, key: key + '*%*' + i.field, level: 'tableDesc', type2: i.type2, isLeaf: true })),
          ),
        );
    }
  };

  const items: MenuProps['items'] = [
    {
      key: IStatCalcMethod.count,
      label: t('日志行数'),
    },
    {
      key: IStatCalcMethod.max,
      label: t('最大值'),
    },
    {
      key: IStatCalcMethod.min,
      label: t('最小值'),
    },
    {
      key: IStatCalcMethod.avg,
      label: t('平均值'),
    },
    {
      key: IStatCalcMethod.sum,
      label: t('和值'),
    },
    {
      key: IStatCalcMethod.p75,
      label: t('75分位值'),
    },
  ];

  const menuClick = async ({ key, domEvent }) => {
    if (!dropDownVisibleKey) return;
    const [db, table, field] = (dropDownVisibleKey as string).split('*%*');
    props.onTreeClick({ db, table, field });
    domEvent.stopPropagation();
    const fieldList = getParentNodeList(treeData, [db, db + '*%*' + table, db + '*%*' + table + '*%*' + field]);
    const firstDateField = fieldList.find((i) => i.type2 === 'date');
    if (firstDateField) {
      const [, , dateField] = firstDateField.key.split('*%*');
      form.setFields([{ name: ['query', 'time_field'], value: dateField }]);
      const sql = statisticsGraphSQl({ calcMethod: key, table, field, time_field: dateField });
      form.setFields([
        { name: ['query', 'sql'], value: sql },
        { name: ['query', 'keys', 'timeKey'], value: '__ts__' },
        { name: ['query', 'keys', 'valueKey'], value: 'value' },
      ]);
    }
    setDropDownVisibleKey(undefined);
  };

  return (
    <Spin spinning={loading}>
      <Tree
        loadData={onLoadData}
        treeData={treeData}
        onSelect={onSelect}
        onRightClick={(e) => {
          if (mode === 'raw' || e.node['level'] !== 'tableDesc') return;
          setDropDownVisibleKey(e.node.key);
        }}
        titleRender={(nodeData) => {
          if (mode === 'raw' || (nodeData as DataNode).level !== 'tableDesc') return <div>{nodeData.title as React.ReactNode}</div>;
          return (
            <Dropdown
              overlay={<Menu items={items} onClick={menuClick} />}
              visible={nodeData.key === dropDownVisibleKey}
              onVisibleChange={() => {
                setDropDownVisibleKey(undefined);
              }}
            >
              <div>{nodeData.title as React.ReactNode}</div>
            </Dropdown>
          );
        }}
      />
      <Form.Item name={['query', 'database']} hidden></Form.Item>
      <Form.Item name={['query', 'table']} hidden></Form.Item>
    </Spin>
  );
}
