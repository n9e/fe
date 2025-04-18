import React, { useState, useEffect, useContext } from 'react';
import { Resizable } from 're-resizable';
import _ from 'lodash';
import classNames from 'classnames';
import { Link, useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Button, Input } from 'antd';
import { LeftOutlined, RightOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import Tree from '@/components/BusinessGroup/components/Tree';
import { listToTree, getCollapsedKeys, getCleanBusinessGroupIds, getDefaultBusinessGroupKey, getDefaultBusiness, getVaildBusinessGroup } from './utils';
import BusinessGroupSelect from './BusinessGroupSelect';
import BusinessGroupSelectWithAll from './BusinessGroupSelectWithAll';
import { getBusiGroups } from './services';
import './style.less';
import UserInfoModal from '@/pages/user/component/createModal';
import { Team, ActionType } from '@/store/manageInterface';
import { PAGE_SIZE } from '@/pages/user/business';
import { getBusinessTeamList, getBusinessTeamInfo } from '@/services/manage';
import { useQuery } from '@/utils';
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

export default function index(props: IProps) {
  const { t } = useTranslation('BusinessGroup');
  const { businessGroup, businessGroupOnChange } = useContext(CommonStateContext);
  const location = useLocation();
  const query = queryString.parse(location.search);
  const history = useHistory();
  const { title = t('common:business_groups'), renderHeadExtra, onSelect, showSelected = true } = props;
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('leftwidth') || 200));
  const { busiGroups, siteInfo, setBusiGroups, setBusiGroup } = useContext(CommonStateContext);
  const [businessGroupTreeData, setBusinessTreeGroupData] = useState<Node[]>([]);
  const [busiGroupsListData, setBusiGroupsListData] = useState<any[]>([]);

  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();

  const urlQuery = useQuery();
  const id = urlQuery.get('id');
  const [teamId, setTeamId] = useState<string>(id || '');
  const [memberList, setMemberList] = useState<{ user_group: any }[]>([]);
  const [teamInfo, setTeamInfo] = useState<{ name: string; id: number; update_by: string; update_at: number }>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [memberLoading, setMemberLoading] = useState<boolean>(false);

  const handleClick = (type: ActionType) => {
    setAction(type);
    setVisible(true);
  };
  const getList = (action) => {
    getTeamList(undefined, action === 'delete');
  };
  // 获取业务组列表
  const getTeamList = (search?: string, isDelete?: boolean) => {
    let params = {
      query: search,
      limit: PAGE_SIZE,
    };
    getBusinessTeamList(params).then((data) => {
      setTeamList(_.sortBy(data.dat, (item) => _.lowerCase(item.name)));
      if (
        (!teamId ||
          isDelete ||
          _.every(data.dat, (item) => {
            return _.toNumber(item.id) !== _.toNumber(teamId);
          })) &&
        data.dat.length > 0
      ) {
        setTeamId(data.dat[0].id);
      } else {
        teamId && getTeamInfoDetail(teamId);
      }
      setBusiGroups(data.dat || []);
      setBusiGroup(getDefaultBusiness(data.dat));
    });
  };

  // 获取业务组详情
  const getTeamInfoDetail = (id: string) => {
    setMemberLoading(true);
    getBusinessTeamInfo(id).then((data) => {
      setTeamInfo(data);
      setMemberList(data.user_groups);
      setMemberLoading(false);
    });
  };
  const handleClose = (action) => {
    setVisible(false);
    if (['create', 'delete', 'update'].includes(action)) {
      getList(action);
    }
    if (teamId && ['update', 'addMember', 'deleteMember'].includes(action)) {
      getTeamInfoDetail(teamId);
    }
  };
  useEffect(() => {
    setBusinessTreeGroupData(listToTree(busiGroups, siteInfo?.businessGroupSeparator));
    setBusiGroupsListData(busiGroups);
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
              <Button
                style={{
                  height: '30px',
                }}
                size='small'
                type='link'
                onClick={() => {
                  handleClick(ActionType.CreateBusiness);
                }}
              >
                {t('btn.add')}
              </Button>
            )}
          </div>
          <Input
            className='n9e-biz-group-container-group-search'
            prefix={<SearchOutlined />}
            onPressEnter={(e) => {
              e.preventDefault();
              const value = e.currentTarget.value;
              getBusiGroups({
                query: value,
              }).then((res) => {
                setBusinessTreeGroupData(listToTree(res || [], siteInfo?.businessGroupSeparator));
                setBusiGroupsListData(res || []);
              });
            }}
          />
          {siteInfo?.businessGroupDisplayMode == 'list' ? (
            <div className='radio-list'>
              {_.map(busiGroupsListData, (item) => {
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
                  treeData={businessGroupTreeData as Node[]}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <UserInfoModal
        visible={visible}
        action={action as ActionType}
        userType={'business'}
        onClose={handleClose}
        teamId={teamId}
        onSearch={(val) => {
          setTeamId(val);
        }}
      />
    </Resizable>
  );
}
