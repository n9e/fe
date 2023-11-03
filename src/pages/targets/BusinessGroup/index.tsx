import React, { useState, useEffect, useContext } from 'react';
import { Resizable } from 're-resizable';
import _ from 'lodash';
import classNames from 'classnames';
import { Link, useHistory } from 'react-router-dom';
import { Input, Space, Tree } from 'antd';
import { LeftOutlined, RightOutlined, SettingOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getBusiGroups } from '@/services/common';
import { CommonStateContext } from '@/App';
import './style.less';

interface IProps {
  curBusiId?: number;
  setCurBusiId?: (id: number, item: any) => void;
  title?: string;
  renderHeadExtra?: () => React.ReactNode;
}

interface Node {
  id: number;
  title: string;
  key: string | number;
  children?: Node[];
}

export function listToTree2(data: { id: number; name: string }[]) {
  const result = _.reduce(
    data,
    (r, item) => {
      const keys = item.name.split('-');

      if (keys.length > 1) {
        const text = keys.pop();
        _.reduce(
          keys,
          (q, text) => {
            var temp = _.find(q, (o) => o.title === text);
            if (!temp) {
              q.push((temp = { id: item.id, key: `${item.id}_${text}`, originName: item.name, title: text, selectable: false, children: [] }));
            }
            return temp.children;
          },
          r,
        ).push({ id: item.id, key: `${item.id}_${text}`, originName: item.name, title: text, isLeaf: true });
      } else {
        r.push({
          id: item.id,
          key: `${item.id}_${item.name}`,
          title: item.name + ' ', // 防止节点跟组名称重复 antd tree 不会渲染同名节点问题
          originName: item.name,
          isLeaf: true,
        });
      }
      return r;
    },
    [] as any[],
  );
  return result;
}

export function listToTree(data: { id: number; name: string }[]) {
  const treeData: Node[] = [];
  _.forEach(data, (item) => {
    const separatorIndex = item.name.indexOf('-');
    if (separatorIndex > 0) {
      const groupName = item.name.substring(0, separatorIndex);
      const name = item.name.substring(separatorIndex + 1);
      const group = _.find(treeData, { title: groupName });
      if (group) {
        if (group.children) {
          group.children.push({
            title: name,
            key: item.id,
            id: item.id,
          });
        } else {
          group.children = [
            {
              title: name,
              key: item.id,
              id: item.id,
            },
          ];
        }
      } else {
        const groupNodes = _.filter(data, (item) => {
          return item.name.indexOf(`${groupName}-`) === 0;
        });
        if (groupNodes.length > 1) {
          treeData.push({
            title: groupName,
            key: groupName,
            id: item.id,
            children: [
              {
                title: name,
                key: item.id,
                id: item.id,
              },
            ],
          });
        } else {
          treeData.push({
            title: item.name,
            key: item.id,
            id: item.id,
          });
        }
      }
    } else {
      treeData.push({
        title: item.name + ' ', // 防止节点跟组名称重复 antd tree 不会渲染同名节点问题
        key: item.id,
        id: item.id,
      });
    }
  });
  return treeData;
}

export function getLocaleCollapsedNodes() {
  const val = localStorage.getItem('biz_group_collapsed');
  try {
    if (val) {
      const parsed = JSON.parse(val);
      if (_.isArray(parsed)) {
        return parsed;
      }
      return [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function setLocaleCollapsedNodes(nodes: string[]) {
  localStorage.setItem('biz_group_collapsed', JSON.stringify(nodes));
}

export default function index(props: IProps) {
  const { t } = useTranslation();
  const { title = t('common:business_group'), renderHeadExtra, curBusiId, setCurBusiId } = props;
  const history = useHistory();
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('leftwidth') || 200));
  const { busiGroups } = useContext(CommonStateContext);
  const [businessGroupData, setBusinessGroupData] = useState<{ id: number; name: string }[]>([]);
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>(getLocaleCollapsedNodes());

  useEffect(() => {
    setBusinessGroupData(busiGroups);
  }, [busiGroups]);

  return (
    <Resizable
      style={{
        marginRight: collapse ? 0 : 10,
      }}
      size={{ width: collapse ? 0 : width, height: '100%' }}
      enable={{
        right: collapse ? false : true,
      }}
      onResizeStop={(e, direction, ref, d) => {
        let curWidth = width + d.width;
        if (curWidth < 200) {
          curWidth = 200;
        }
        setWidth(curWidth);
        localStorage.setItem('leftwidth', curWidth.toString());
      }}
    >
      <div className={collapse ? 'left-area collapse' : 'left-area'}>
        <div
          className='collapse-btn'
          onClick={() => {
            localStorage.setItem('leftlist', !collapse ? '1' : '0');
            setCollapse(!collapse);
          }}
        >
          {!collapse ? <LeftOutlined /> : <RightOutlined />}
        </div>
        <div className='left-area-group group-shrink'>
          {renderHeadExtra && renderHeadExtra()}
          <div className='left-area-group-title'>
            {title}
            {title === t('common:business_group') && (
              <Link to='/busi-groups' target='_blank'>
                <SettingOutlined />
              </Link>
            )}
          </div>
          <Input
            className='left-area-group-search'
            prefix={<SearchOutlined />}
            onPressEnter={(e) => {
              e.preventDefault();
              const value = e.currentTarget.value;
              getBusiGroups(value).then((res) => {
                setBusinessGroupData(res.dat || []);
              });
            }}
          />
          <div className='radio-list'>
            {!_.isEmpty(businessGroupData) && (
              <Tree
                rootClassName='business-group-tree'
                showLine={true}
                defaultExpandAll
                blockNode
                switcherIcon={<DownOutlined />}
                onSelect={(_selectedKeys, e) => {
                  console.log(111);
                  const nodeId = e.node.id;
                  if (nodeId !== curBusiId) {
                    localStorage.setItem('curBusiId', _.toString(nodeId));
                    setCurBusiId && setCurBusiId(nodeId, e.node);
                  }
                }}
                onExpand={(expandedKeys) => {
                  console.log(expandedKeys);
                }}
                treeData={listToTree2(businessGroupData as any)}
              />
            )}
          </div>
        </div>
      </div>
    </Resizable>
  );
}
