import React, { useState, useEffect } from 'react';
import { Tree } from 'antd';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import { getDatabases, getTables, getColumns } from '../services';

interface Props {
  datasourceValue: number;
}

interface DataNode {
  title: string;
  key: string;
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

export default function Meta(props: Props) {
  const { datasourceValue } = props;
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const baseParams = {
    cate: DatasourceCateEnum.tdengine,
    datasource_id: datasourceValue,
  };

  const onLoadData = ({ key, children, pos, paranetKey }: any) => {
    return new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }
      if (_.split(pos, '-')?.length === 2) {
        getTables({
          ...baseParams,
          db: key,
        }).then((res) => {
          setTreeData((origin) =>
            updateTreeData(
              origin,
              key,
              _.map(res, (item) => {
                return {
                  title: item,
                  key: `${key}.${item}`,
                  paranetKey: key,
                };
              }),
            ),
          );
          resolve();
          return;
        });
      } else if (_.split(pos, '-')?.length === 3) {
        getColumns({
          ...baseParams,
          db: key.split('.')[0],
          table: key.split('.')[1],
        }).then((res) => {
          setTreeData((origin) =>
            updateTreeData(
              origin,
              key,
              _.map(res, (item) => {
                return {
                  title: _.join(item, ','),
                  key: `${key}.${item}`,
                  isLeaf: true,
                };
              }),
            ),
          );
          resolve();
          return;
        });
      }
    });
  };

  useEffect(() => {
    getDatabases(baseParams).then((res) => {
      const databases = _.map(res, (item) => ({
        title: item,
        key: item,
      }));
      setTreeData(databases);
    });
  }, []);

  return (
    <Tree
      loadData={onLoadData}
      treeData={treeData}
      showLine={{
        showLeafIcon: false,
      }}
    />
  );
}
