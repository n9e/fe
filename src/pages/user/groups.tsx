/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState, useContext } from 'react';
import moment from 'moment';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { Button, Table, Input, message, List, Row, Col, Modal, Space, Tree } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, InfoCircleOutlined, DownOutlined } from '@ant-design/icons';
import UserInfoModal from './component/createModal';
import { getTeamInfoList, getTeamInfo, deleteTeam, deleteMember } from '@/services/manage';
import { User, Team, UserType, ActionType, TeamInfo } from '@/store/manageInterface';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { listToTree } from '@/components/BusinessGroup';
import { CommonStateContext } from '@/App';
import './index.less';
import './locale';

const { confirm } = Modal;
export const PAGE_SIZE = 20;

export function getLocaleExpandedKeys() {
  const val = localStorage.getItem('team_tree_expanded_keys');
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
  localStorage.setItem('team_tree_expanded_keys', JSON.stringify(nodes));
}

const Resource: React.FC = () => {
  const { siteInfo } = useContext(CommonStateContext);
  const { t } = useTranslation('user');
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [teamId, setTeamId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [memberList, setMemberList] = useState<User[]>([]);
  const [allMemberList, setAllMemberList] = useState<User[]>([]);
  const [teamInfo, setTeamInfo] = useState<Team>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [memberLoading, setMemberLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchMemberValue, setSearchMemberValue] = useState<string>('');
  const userColumn: ColumnsType<User> = [
    {
      title: t('account:profile.username'),
      dataIndex: 'username',
      ellipsis: true,
    },
    {
      title: t('account:profile.nickname'),
      dataIndex: 'nickname',
      ellipsis: true,
      render: (text: string, record) => record.nickname || '-',
    },
    {
      title: t('account:profile.email'),
      dataIndex: 'email',
      render: (text: string, record) => record.email || '-',
    },
    {
      title: t('account:profile.phone'),
      dataIndex: 'phone',
      render: (text: string, record) => record.phone || '-',
    },
  ];

  const teamMemberColumns: ColumnsType<User> = [
    ...userColumn,
    {
      title: t('common:table.operations'),
      width: '100px',
      render: (text: string, record) => (
        <a
          style={{
            color: 'red',
          }}
          onClick={() => {
            let params = {
              ids: [record.id],
            };
            confirm({
              title: t('common:confirm.delete'),
              onOk: () => {
                deleteMember(teamId, params).then((_) => {
                  message.success(t('common:success.delete'));
                  handleClose('updateMember');
                });
              },
              onCancel: () => {},
            });
          }}
        >
          {t('common:btn.delete')}
        </a>
      ),
    },
  ];

  useEffect(() => {
    getList(true);
  }, []); //teamId变化触发

  useEffect(() => {
    if (teamId) {
      getTeamInfoDetail(teamId);
    }
  }, [teamId]);

  const getList = (isDeleteOrAdd = false) => {
    getTeamList('', isDeleteOrAdd);
  };

  // 获取团队列表
  const getTeamList = (search?: string, isDelete?: boolean) => {
    getTeamInfoList({ query: search || '' }).then((data) => {
      setTeamList(data.dat || []);
      if ((!teamId || isDelete) && data.dat.length > 0) {
        setTeamId(data.dat[0].id);
      }
    });
  };

  // 获取团队详情
  const getTeamInfoDetail = (id: string) => {
    setMemberLoading(true);
    getTeamInfo(id).then((data: TeamInfo) => {
      setTeamInfo(data.user_group);
      setMemberList(data.users);
      setAllMemberList(data.users);
      setMemberLoading(false);
    });
  };

  const handleSearch = (type?: string, val?: string) => {
    if (type === 'team') {
      getTeamList(val);
    } else {
      if (!val) {
        getTeamInfoDetail(teamId);
      } else {
        setMemberLoading(true);
        let newList = allMemberList.filter(
          (item) =>
            item.username.indexOf(val) !== -1 ||
            item.nickname.indexOf(val) !== -1 ||
            item.id.toString().indexOf(val) !== -1 ||
            item.phone.indexOf(val) !== -1 ||
            item.email.indexOf(val) !== -1,
        );
        setMemberList(newList);
        setMemberLoading(false);
      }
    }
  };

  const handleClick = (type: ActionType, id?: string, memberId?: string) => {
    if (id) {
      setTeamId(id);
    } else {
      setTeamId('');
    }

    if (memberId) {
      setMemberId(memberId);
    } else {
      setMemberId('');
    }

    setAction(type);
    setVisible(true);
  };

  // 弹窗关闭回调
  const handleClose = (isDeleteOrAdd: boolean | string = false) => {
    setVisible(false);
    if (searchValue) {
      handleSearch('team', searchValue);
    } else {
      // 添加、删除成员 不用获取列表
      if (isDeleteOrAdd !== 'updateMember') {
        getList(isDeleteOrAdd !== 'updateName'); // 修改名字，不用选中第一个
      }
    }
    if (teamId && (isDeleteOrAdd === 'update' || isDeleteOrAdd === 'updateMember' || isDeleteOrAdd === 'updateName')) {
      getTeamInfoDetail(teamId);
    }
  };

  return (
    <PageLayout title={t('team.title')} icon={<UserOutlined />}>
      <div className='user-manage-content'>
        <div style={{ display: 'flex', height: '100%' }}>
          <div className='left-tree-area'>
            <div className='sub-title'>
              {t('team.list')}
              <Button
                style={{
                  height: '30px',
                }}
                size='small'
                type='link'
                onClick={() => {
                  handleClick(ActionType.CreateTeam);
                }}
              >
                {t('common:btn.add')}
              </Button>
            </div>
            <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
              <Input
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                onPressEnter={(e) => {
                  // @ts-ignore
                  getTeamList(e.target.value);
                }}
                onBlur={(e) => {
                  // @ts-ignore
                  getTeamList(e.target.value);
                }}
              />
            </div>
            {siteInfo?.teamDisplayMode == 'list' ? (
              <div className='radio-list' style={{ overflowY: 'auto' }}>
                <List
                  style={{
                    marginBottom: '12px',
                    flex: 1,
                    overflow: 'auto',
                  }}
                  dataSource={teamList}
                  size='small'
                  renderItem={(item) => (
                    <List.Item key={item.id} className={teamId === item.id ? 'is-active' : ''} onClick={() => setTeamId(item.id)}>
                      {item.name}
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <div className='radio-list' style={{ overflowY: 'auto' }}>
                {!_.isEmpty(teamList) && (
                  <Tree
                    rootClassName='business-group-tree'
                    showLine={{
                      showLeafIcon: false,
                    }}
                    defaultExpandParent={false}
                    defaultExpandedKeys={getLocaleExpandedKeys()}
                    selectedKeys={teamId ? [_.toString(teamId)] : []}
                    blockNode
                    switcherIcon={<DownOutlined />}
                    onSelect={(_selectedKeys, e: any) => {
                      const nodeId = e.node.id;
                      setTeamId(nodeId as any);
                    }}
                    onExpand={(expandedKeys: string[]) => {
                      setLocaleExpandedKeys(expandedKeys);
                    }}
                    treeData={listToTree(teamList as any, siteInfo?.teamSeparator)}
                  />
                )}
              </div>
            )}
          </div>
          {teamList.length > 0 ? (
            <div className='resource-table-content'>
              <Row className='team-info'>
                <Col
                  span='24'
                  style={{
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline',
                  }}
                >
                  {teamInfo && teamInfo.name}
                  <EditOutlined
                    style={{
                      marginLeft: '8px',
                      fontSize: '14px',
                    }}
                    onClick={() => handleClick(ActionType.EditTeam, teamId)}
                  ></EditOutlined>
                  <DeleteOutlined
                    style={{
                      marginLeft: '8px',
                      fontSize: '14px',
                    }}
                    onClick={() => {
                      confirm({
                        title: t('common:confirm.delete'),
                        onOk: () => {
                          deleteTeam(teamId).then((_) => {
                            message.success(t('common:success.delete'));
                            handleClose(true);
                          });
                        },
                        onCancel: () => {},
                      });
                    }}
                  />
                </Col>
                <Col
                  style={{
                    marginTop: '8px',
                    color: '#666',
                  }}
                >
                  <Space>
                    <span>
                      {t('common:table.note')}：{teamInfo?.note ? teamInfo.note : '-'}
                    </span>
                    <span>
                      {t('common:table.update_by')}：{teamInfo?.update_by ? teamInfo.update_by : '-'}
                    </span>
                    <span>
                      {t('common:table.update_at')}：{teamInfo?.update_at ? moment.unix(teamInfo.update_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </span>
                  </Space>
                </Col>
              </Row>
              <Row justify='space-between' align='middle'>
                <Col span='12'>
                  <Input
                    prefix={<SearchOutlined />}
                    value={searchMemberValue}
                    className={'searchInput'}
                    onChange={(e) => setSearchMemberValue(e.target.value)}
                    placeholder={t('team.search_placeholder')}
                    onPressEnter={(e) => handleSearch('member', searchMemberValue)}
                  />
                </Col>
                <Button
                  type='primary'
                  onClick={() => {
                    handleClick(ActionType.AddUser, teamId);
                  }}
                >
                  {t('team.add_member')}
                </Button>
              </Row>

              <Table className='mt8' size='small' rowKey='id' columns={teamMemberColumns} dataSource={memberList} loading={memberLoading} />
            </div>
          ) : (
            <div className='blank-busi-holder'>
              <p style={{ textAlign: 'left', fontWeight: 'bold' }}>
                <InfoCircleOutlined style={{ color: '#1473ff' }} /> Tips
              </p>
              <p>
                {t('team.empty')}&nbsp;
                <a onClick={() => handleClick(ActionType.CreateTeam)}>{t('team.create')}</a>
              </p>
            </div>
          )}
        </div>
        <UserInfoModal
          visible={visible}
          action={action as ActionType}
          width={500}
          userType={UserType.Team}
          onClose={handleClose}
          onSearch={(val) => {
            setSearchValue(val);
            handleSearch('team', val);
          }}
          userId={undefined}
          teamId={teamId}
          memberId={memberId}
        />
      </div>
    </PageLayout>
  );
};

export default Resource;
