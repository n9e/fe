import React, { useState, useEffect, useContext } from 'react';
import { Resizable } from 're-resizable';
import _ from 'lodash';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { Input, Space } from 'antd';
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
            {title === t('common:business_group') && <SettingOutlined onClick={() => history.push(`/busi-groups`)} />}
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
            {_.map(listToTree(businessGroupData), (item) => {
              if (item.children) {
                return (
                  <div className='n9e-biz-group-item n9e-biz-group-group' key={item.key}>
                    <div
                      className='name'
                      onClick={() => {
                        let newCollapsedNodes = _.cloneDeep(collapsedNodes);
                        if (_.includes(newCollapsedNodes, item.key)) {
                          newCollapsedNodes = _.without(newCollapsedNodes, item.key as string);
                        } else {
                          newCollapsedNodes.push(item.key as string);
                        }
                        setCollapsedNodes(newCollapsedNodes);
                        setLocaleCollapsedNodes(newCollapsedNodes);
                      }}
                    >
                      <Space>
                        {item.title}
                        {!_.includes(collapsedNodes, item.key) ? <DownOutlined /> : <RightOutlined />}
                      </Space>
                    </div>
                    {!_.includes(collapsedNodes, item.key) && (
                      <div className='children'>
                        {_.map(item.children, (child) => {
                          return (
                            <div
                              className={classNames({
                                'n9e-biz-group-item': true,
                                active: child.id == curBusiId,
                              })}
                              key={child.id}
                              onClick={() => {
                                if (child.id !== curBusiId) {
                                  localStorage.setItem('curBusiId', _.toString(child.id));
                                  setCurBusiId && setCurBusiId(child.id, child);
                                }
                              }}
                            >
                              <div className='name'>{child.title}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div
                    className={classNames({
                      'n9e-biz-group-item': true,
                      active: item.id == curBusiId,
                    })}
                    key={item.key}
                    onClick={() => {
                      if (item.id !== curBusiId) {
                        localStorage.setItem('curBusiId', _.toString(item.id));
                        setCurBusiId && setCurBusiId(item.id, item);
                      }
                    }}
                  >
                    <div className='name'>{item.title}</div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </Resizable>
  );
}
