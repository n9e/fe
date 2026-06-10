import React, { useState, useEffect, useContext, useImperativeHandle, forwardRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Resizable } from 're-resizable';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Button, Input, Popover, Space, Modal, message, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, RightOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { CommonStateContext } from '@/App';
import { ActionType } from '@/store/manageInterface';
import Tree from '@/components/BusinessGroup/components/Tree';
import EditBusinessDrawer from '@/components/BusinessGroup/components/EditBusinessDrawer';
import CreateBusinessModal from '@/pages/user/component/createModal';
import { deleteBusinessTeam } from '@/services/manage';
import AuthorizationWrapper, { useIsAuthorized } from '@/components/AuthorizationWrapper';

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

interface PresetFilterOption {
  value: string;
  label: string;
  tooltip?: string;
}

interface IProps {
  selected?: string;
  onSelect?: (key: string, item?: any) => void;
  title?: string;
  renderHeadExtra?: () => React.ReactNode;
  showSelected?: boolean;
  presetFilters?: PresetFilterOption[];
  presetFilterTitle?: string;
  localeKey?: string;
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

const BusinessGroup = forwardRef((props: IProps, ref) => {
  const { t } = useTranslation('BusinessGroup');
  const { businessGroup, businessGroupOnChange } = useContext(CommonStateContext);
  const location = useLocation();
  const query = queryString.parse(location.search);
  const history = useHistory();
  const { title = t('common:business_groups'), renderHeadExtra, onSelect, showSelected = true } = props;
  const selected = props.selected || businessGroup.key;
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('leftwidth') || 200));
  const { busiGroups, siteInfo, setBusiGroups } = useContext(CommonStateContext);
  const [businessGroupTreeData, setBusinessGroupTreeData] = useState<Node[]>([]);
  const [createBusiVisible, setCreateBusiVisible] = useState<boolean>(false);
  const [editBusiDrawerVisible, setEditBusiDrawerVisible] = useState<boolean>(false);
  const [editBusiId, setEditBusiId] = useState<string>();
  const [searchValue, setSearchValue] = useState<string>('');
  const savedSearchValue = sessionStorage.getItem(BUSINESS_GROUP_SEARCH_KEY);
  const isBusiPutAuthorized = useIsAuthorized(['/busi-groups/put']);
  const isBusiDelAuthorized = useIsAuthorized(['/busi-groups/del']);

  const handlePresetFilterClick = (value: string) => {
    // 更新 context（'-2' 全部、'-1' 公开 使用 group, 前缀）
    if (value === '-2' || value === '-1') {
      businessGroupOnChange(`group,${value}`);
    } else {
      businessGroupOnChange(value);
    }

    // 更新页面级 localStorage
    if (props.localeKey) {
      localStorage.setItem(props.localeKey, value);
    }

    // 更新 URL：设置 ids/isLeaf 参数，便于分享和刷新后恢复状态
    history.push({
      pathname: location.pathname,
      search: queryString.stringify({
        ..._.omit(query, ['preset-filter']),
        ids: value,
        isLeaf: false,
      }),
    });

    // 通知父组件更新本地 gids
    onSelect && onSelect(value);
  };

  // 内部计算是否匹配预置筛选值（用于 showSelected 和 URL 同步判断）
  // 使用 getCleanBusinessGroupIds 比较，因 selected 可能是 'group,-2' 而预设值是 '-2'
  const cleanSelected = getCleanBusinessGroupIds(selected);
  const isPresetFilterActive = props.presetFilters?.some((f) => cleanSelected === f.value) ?? false;
  const internalShowSelected = isPresetFilterActive ? false : showSelected;

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

  // 在 businessGroup 有值但 URL 缺少 ids/isLeaf 参数时（如 localStorage 恢复后刷新），同步到 URL
  // 兼容预置筛选值：选中预置筛选时使用 isLeaf=false，而非基于 selected 前缀判断
  useEffect(() => {
    if (!businessGroup.key) return;
    const expectedIds = getCleanBusinessGroupIds(selected);
    const expectedIsLeaf = isPresetFilterActive ? false : !_.startsWith(selected, 'group,');
    if (query.ids !== expectedIds || query.isLeaf !== String(expectedIsLeaf)) {
      history.replace({
        pathname: location.pathname,
        search: queryString.stringify({
          ..._.omit(query, ['preset-filter']),
          ids: expectedIds,
          isLeaf: expectedIsLeaf,
        }),
      });
    }
  }, [selected, isPresetFilterActive]);

  useImperativeHandle(ref, () => ({
    getCollapse: () => collapse,
    setCollapse: (newCollapsed) => {
      localStorage.setItem('leftlist', newCollapsed ? '1' : '0');
      setCollapse(newCollapsed);
    },
  }));

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
        <div className='flex flex-col h-full overflow-hidden'>
          {renderHeadExtra && renderHeadExtra()}
          {props.presetFilters && props.presetFilters.length > 0 && (
            <div className='mb-2'>
              {props.presetFilterTitle && <div className='text-l1 font-bold leading-none mb-4'>{props.presetFilterTitle}</div>}
              {_.map(props.presetFilters, (item) => (
                <div
                  key={item.value}
                  className={classNames('justify-between py-[6px] px-[8px] cursor-pointer rounded-md hover:bg-fc-200/80', {
                    'bg-fc-200/90': cleanSelected === item.value,
                    'font-bold': cleanSelected === item.value,
                    'text-title': cleanSelected === item.value,
                  })}
                  onClick={() => handlePresetFilterClick(item.value)}
                >
                  <Space>
                    {item.label}
                    {item.tooltip && (
                      <Tooltip title={item.tooltip}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    )}
                  </Space>
                </div>
              ))}
            </div>
          )}
          <div className='n9e-biz-group-container-group-title'>
            {title}
            <Button
              style={{
                height: '30px',
              }}
              size='small'
              type='text'
              onClick={() => {
                setCreateBusiVisible(true);
              }}
              icon={<PlusOutlined />}
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
            <div className='scroll-container overflow-x-hidden overflow-y-auto min-h-0 h-full'>
              {_.map(filterData(searchValue, busiGroups), (item) => {
                const itemKey = _.toString(item.id);
                return (
                  <Popover
                    key={itemKey}
                    trigger='hover'
                    placement='right'
                    overlayClassName='n9e-buis-group-item-popover'
                    content={
                      isBusiPutAuthorized || isBusiDelAuthorized ? (
                        <Space size={2}>
                          <AuthorizationWrapper allowedPerms={['/busi-groups/put']}>
                            <Button
                              size='small'
                              icon={
                                <EditOutlined
                                  onClick={() => {
                                    setEditBusiId(itemKey);
                                    setEditBusiDrawerVisible(true);
                                  }}
                                />
                              }
                              type='text'
                            />
                          </AuthorizationWrapper>
                          <AuthorizationWrapper allowedPerms={['/busi-groups/del']}>
                            <Button
                              size='small'
                              icon={<DeleteOutlined />}
                              type='text'
                              danger
                              onClick={() => {
                                Modal.confirm({
                                  title: t('common:confirm.delete'),
                                  onOk: () => {
                                    deleteBusinessTeam(itemKey).then(() => {
                                      message.success(t('common:success.delete'));
                                      reloadData();
                                    });
                                  },
                                });
                              }}
                            />
                          </AuthorizationWrapper>
                        </Space>
                      ) : undefined
                    }
                  >
                    <div
                      className={classNames('n9e-list-item px-[8px] py-[6px] cursor-pointer break-all', {
                        active: internalShowSelected ? itemKey === selected : false,
                      })}
                      onClick={() => {
                        businessGroupOnChange(itemKey);
                        if (props.localeKey) localStorage.removeItem(props.localeKey);
                        onSelect && onSelect(itemKey, item);
                        history.push({
                          pathname: location.pathname,
                          search: queryString.stringify({
                            ..._.omit(query, ['preset-filter']),
                            ids: itemKey,
                            isLeaf: true,
                          }),
                        });
                      }}
                    >
                      <span>{item.name}</span>
                    </div>
                  </Popover>
                );
              })}
            </div>
          ) : (
            <div className='scroll-container overflow-x-hidden overflow-y-auto min-h-0 h-full'>
              {!_.isEmpty(businessGroupTreeData) && (
                <Tree
                  defaultExpandedKeys={getCollapsedKeys(businessGroupTreeData, getLocaleExpandedKeys(), selected)}
                  selectedKeys={internalShowSelected && selected ? [selected] : undefined}
                  onSelect={(_selectedKeys, e) => {
                    const itemKey = e.node.key;
                    businessGroupOnChange(itemKey);
                    if (props.localeKey) localStorage.removeItem(props.localeKey);
                    onSelect && onSelect(itemKey, e.node);
                    history.push({
                      pathname: location.pathname,
                      search: queryString.stringify({
                        ..._.omit(query, ['preset-filter']),
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
                  reloadData={reloadData}
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
});

export default BusinessGroup;
