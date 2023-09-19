import React, { useState, useEffect } from 'react';
import { Tree, Segmented } from 'antd';
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

const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => {
  return _.map(list, (node) => {
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
};
export default function Meta(props: Props) {
  const { datasourceValue } = props;
  const [isStable, setIsStable] = useState<boolean>(false); // 是否是超级表
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
          is_stable: isStable,
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
                console.log(item);
                return {
                  title: `${item.name} (${item.type})`,
                  key: `${key}.${item.name}`,
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
  }, [isStable]);

  return (
    <div>
      <Segmented
        block
        options={[
          {
            label: '普通表',
            value: 'table',
          },
          {
            label: '超级表',
            value: 'stable',
          },
        ]}
        value={isStable ? 'stable' : 'table'}
        onChange={(value) => {
          setIsStable(value === 'stable');
        }}
      />
      <Tree
        blockNode
        key={isStable ? 'stable' : 'table'}
        loadData={onLoadData}
        treeData={treeData}
        showLine={{
          showLeafIcon: false,
        }}
      />
    </div>
  );
}
