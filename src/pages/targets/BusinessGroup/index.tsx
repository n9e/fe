import React, { useState, useEffect, useContext } from 'react';
import { Resizable } from 're-resizable';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Input, Tree } from 'antd';
import { LeftOutlined, RightOutlined, SettingOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getBusiGroups } from '@/services/common';
import { CommonStateContext } from '@/App';
import { listToTree2, getCollapsedKeys } from './utils';
import '@/components/BusinessGroup/style.less';

export { listToTree2, getCollapsedKeys };

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

export function getLocaleExpandedKeys() {
  const val = localStorage.getItem('biz_group_expanded_keys');
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

export function setLocaleExpandedKeys(nodes: string[]) {
  localStorage.setItem('biz_group_expanded_keys', JSON.stringify(nodes));
}

export default function index(props: IProps) {
  const { t } = useTranslation();
  const { title = t('common:business_group'), renderHeadExtra, curBusiId, setCurBusiId } = props;
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('leftwidth') || 200));
  const { busiGroups } = useContext(CommonStateContext);
  const [businessGroupData, setBusinessGroupData] = useState<Node[]>([]);

  useEffect(() => {
    setBusinessGroupData(listToTree2(busiGroups));
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
      <div className={collapse ? 'n9e-biz-group-container collapse' : 'n9e-biz-group-container'}>
        <div
          className='collapse-btn'
          onClick={() => {
            localStorage.setItem('leftlist', !collapse ? '1' : '0');
            setCollapse(!collapse);
          }}
        >
          {!collapse ? <LeftOutlined /> : <RightOutlined />}
        </div>
        <div className='n9e-biz-group-container-group group-shrink'>
          {renderHeadExtra && renderHeadExtra()}
          <div className='n9e-biz-group-container-group-title'>
            {title}
            {title === t('common:business_group') && (
              <Link to='/busi-groups' target='_blank'>
                <SettingOutlined />
              </Link>
            )}
          </div>
          <Input
            className='n9e-biz-group-container-group-search'
            prefix={<SearchOutlined />}
            onPressEnter={(e) => {
              e.preventDefault();
              const value = e.currentTarget.value;
              getBusiGroups(value).then((res) => {
                setBusinessGroupData(listToTree2(res.dat || []));
              });
            }}
          />
          <div className='radio-list'>
            {!_.isEmpty(businessGroupData) && (
              <Tree
                rootClassName='business-group-tree'
                defaultExpandParent={false}
                defaultExpandedKeys={getCollapsedKeys(businessGroupData, getLocaleExpandedKeys(), curBusiId)}
                selectedKeys={curBusiId ? [curBusiId] : undefined}
                blockNode
                onSelect={(_selectedKeys, e) => {
                  const nodeId = e.node.id;
                  if (nodeId !== curBusiId) {
                    localStorage.setItem('curBusiId', _.toString(nodeId));
                    setCurBusiId && setCurBusiId(nodeId, e.node);
                  }
                }}
                onExpand={(expandedKeys: string[]) => {
                  setLocaleExpandedKeys(expandedKeys);
                }}
                treeData={businessGroupData as Node[]}
              />
            )}
          </div>
        </div>
      </div>
    </Resizable>
  );
}
