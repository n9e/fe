import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Resizable } from 're-resizable';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, RightOutlined, SearchOutlined, PlusSquareOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import { ActionType } from '@/store/manageInterface';
import Tree from '@/components/BusinessGroup/components/Tree';
import EditBusinessDrawer from '@/components/BusinessGroup/components/EditBusinessDrawer';
import CreateBusinessModal from '@/pages/user/component/createModal';

import { listToTree, getCollapsedKeys, getCleanBusinessGroupIds, getDefaultBusinessGroupKey, getDefaultBusiness, getVaildBusinessGroup } from './utils';
import BusinessGroupSelect from './BusinessGroupSelect';
import BusinessGroupSelectWithAll from './BusinessGroupSelectWithAll';
import { getBusiGroups } from './services';
import './style.less';

export {
  listToTree,
  getCollapsedKeys,
  getCleanBusinessGroupIds,
  BusinessGroupSelect,
  getDefaultBusinessGroupKey,
  getDefaultBusiness,
  BusinessGroupSelectWithAll,
  getBusiGroups,
  getVaildBusinessGroup,
};

interface IProps {
  onSelect?: (key: string, item: any) => void;
  title?: string;
  renderHeadExtra?: () => React.ReactNode;
  showSelected?: boolean;
}

interface Node {
  id: string;
  title: string;
  key: string;
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

const filterData = (
  value: string,
  data: {
    name: string;
    id: number;
    label_value?: string;
  }[],
) => {
  const filteredData = _.filter(data, (item) => {
    if (!value) return true;
    return _.includes(_.toLower(item.name), _.toLower(value));
  });
  return filteredData;
};

const BUSINESS_GROUP_SEARCH_KEY = 'businessGroupSearchValue';

export default function index(props: IProps) {
  const { t } = useTranslation('BusinessGroup');
  const { businessGroup, businessGroupOnChange } = useContext(CommonStateContext);
  const location = useLocation();
  const query = queryString.parse(location.search);
  const history = useHistory();
  const { title = t('common:business_groups'), renderHeadExtra, onSelect, showSelected = true } = props;
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('leftwidth') || 200));
  const { busiGroups, siteInfo, setBusiGroups } = useContext(CommonStateContext);
  const [businessGroupTreeData, setBusinessGroupTreeData] = useState<Node[]>([]);
  const [createBusiVisible, setCreateBusiVisible] = useState<boolean>(false);
  const [editBusiDrawerVisible, setEditBusiDrawerVisible] = useState<boolean>(false);
  const [editBusiId, setEditBusiId] = useState<string>();
  const [searchValue, setSearchValue] = useState<string>('');
  const savedSearchValue = sessionStorage.getItem(BUSINESS_GROUP_SEARCH_KEY);

  const reloadData = () => {
    getBusiGroups().then((res = []) => {
      setBusiGroups(res);
      const filteredData = filterData(searchValue, res);
      setBusinessGroupTreeData(listToTree(filteredData, siteInfo?.businessGroupSeparator));
    });
  };

  useEffect(() => {
    let data = busiGroups;
    if (savedSearchValue) {
      setSearchValue(savedSearchValue);
      data = filterData(savedSearchValue, busiGroups);
    }
    setBusinessGroupTreeData(listToTree(data, siteInfo?.businessGroupSeparator));
  }, []);

  return (
    <Resizable
      style={{
        marginRight: collapse ? 0 : 10,
      }}
      size={{ width: collapse ? 0 : width, height: '100%' }}
      enable={{
        right: collapse ? false : true,
      }}
      onResizeStop={(_e, _direction, _ref, d) => {
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
            <Button
              style={{
                height: '30px',
              }}
              size='small'
              type='link'
              onClick={() => {
                setCreateBusiVisible(true);
              }}
              icon={<PlusSquareOutlined />}
            />
          </div>
          <Input
            className='n9e-biz-group-container-group-search'
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              sessionStorage.setItem(BUSINESS_GROUP_SEARCH_KEY, value);
              const filteredData = filterData(value, busiGroups);
              setBusinessGroupTreeData(listToTree(filteredData, siteInfo?.businessGroupSeparator));
            }}
            placeholder={t('common:search_placeholder')}
          />
          {siteInfo?.businessGroupDisplayMode == 'list' ? (
            <div className='radio-list'>
              {_.map(busiGroups, (item) => {
                const itemKey = _.toString(item.id);
                return (
                  <div
                    className={classNames({
                      'n9e-metric-views-list-content-item': true,
                      active: showSelected ? itemKey === businessGroup.key : false,
                    })}
                    key={itemKey}
                    onClick={() => {
                      businessGroupOnChange(itemKey);
                      onSelect && onSelect(itemKey, item);
                      history.push({
                        pathname: location.pathname,
                        search: queryString.stringify({
                          ...query,
                          ids: itemKey,
                          isLeaf: true,
                        }),
                      });
                    }}
                  >
                    <span className='name'>{item.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='radio-list'>
              {!_.isEmpty(businessGroupTreeData) && (
                <Tree
                  defaultExpandedKeys={getCollapsedKeys(businessGroupTreeData, getLocaleExpandedKeys(), businessGroup.key)}
                  selectedKeys={showSelected && businessGroup.key ? [businessGroup.key] : undefined}
                  onSelect={(_selectedKeys, e) => {
                    const itemKey = e.node.key;
                    businessGroupOnChange(itemKey);
                    onSelect && onSelect(itemKey, e.node);
                    history.push({
                      pathname: location.pathname,
                      search: queryString.stringify({
                        ...query,
                        ids: getCleanBusinessGroupIds(itemKey),
                        isLeaf: !_.startsWith(itemKey, 'group,'),
                      }),
                    });
                  }}
                  onExpand={(expandedKeys: string[]) => {
                    setLocaleExpandedKeys(expandedKeys);
                  }}
                  onEdit={(_selectedKeys, e) => {
                    const itemKey = e.node.key;
                    setEditBusiId(itemKey);
                    setEditBusiDrawerVisible(true);
                  }}
                  treeData={businessGroupTreeData as Node[]}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {editBusiId && (
        <EditBusinessDrawer
          id={editBusiId}
          open={editBusiDrawerVisible}
          onCloseDrawer={() => {
            setEditBusiDrawerVisible(false);
            reloadData();
          }}
        />
      )}
      <CreateBusinessModal
        width={600}
        visible={createBusiVisible}
        action={ActionType.CreateBusiness}
        userType='business'
        onClose={(type: string) => {
          setCreateBusiVisible(false);
          if (type === 'create') {
            reloadData();
          }
        }}
      />
    </Resizable>
  );
}
