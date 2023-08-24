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
import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';
import PageLayout from '@/components/pageLayout';
import { Button, Table, Input, message, Row, Col, Modal, Space } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, InfoCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import UserInfoModal from './component/createModal';
import { deleteBusinessTeamMember, getBusinessTeamList, getBusinessTeamInfo, deleteBusinessTeam } from '@/services/manage';
import { Team, ActionType } from '@/store/manageInterface';
import { CommonStateContext } from '@/App';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@/utils';
import { listToTree, getLocaleCollapsedNodes, setLocaleCollapsedNodes } from '@/pages/targets/BusinessGroup';
import '@/components/BlankBusinessPlaceholder/index.less';
import './index.less';

const { confirm } = Modal;
export const PAGE_SIZE = 200;

const Resource: React.FC = () => {
  const { setBusiGroups } = useContext(CommonStateContext);
  const { t } = useTranslation('user');
  const urlQuery = useQuery();
  const id = urlQuery.get('id');
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [teamId, setTeamId] = useState<string>(id || '');
  const [memberList, setMemberList] = useState<{ user_group: any }[]>([]);
  const [teamInfo, setTeamInfo] = useState<{ name: string; id: number; update_by: string; update_at: number }>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [memberLoading, setMemberLoading] = useState<boolean>(false);
  const [searchMemberValue, setSearchMemberValue] = useState<string>('');
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>(getLocaleCollapsedNodes());
  const teamMemberColumns: ColumnsType<any> = [
    {
      title: t('team.name'),
      dataIndex: ['user_group', 'name'],
      ellipsis: true,
    },
    {
      title: t('common:table.note'),
      dataIndex: ['user_group', 'note'],
      ellipsis: true,
      render: (text: string, record) => record['user_group'].note || '-',
    },
    {
      title: t('business.perm_flag'),
      dataIndex: 'perm_flag',
    },
    {
      title: t('common:table.operations'),
      width: '100px',
      render: (text: string, record) => (
        <a
          style={{
            color: memberList.length > 1 ? 'red' : '#00000040',
          }}
          onClick={() => {
            if (memberList.length <= 1) return;

            let params = [
              {
                user_group_id: record['user_group'].id,
                busi_group_id: teamId,
              },
            ];
            confirm({
              title: t('common:confirm.delete'),
              onOk: () => {
                deleteBusinessTeamMember(teamId, params).then(() => {
                  message.success(t('common:success.delete'));
                  getTeamList();
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
    teamId && getTeamInfoDetail(teamId);
  }, [teamId]);

  useEffect(() => {
    getTeamList();
  }, []);

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
      setTeamList(data.dat || []);
      if (
        (!teamId ||
          isDelete ||
          _.every(data.dat, (item) => {
            return item.id !== teamId;
          })) &&
        data.dat.length > 0
      ) {
        setTeamId(data.dat[0].id);
      } else {
        teamId && getTeamInfoDetail(teamId);
      }
      setBusiGroups(data.dat || []);
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

  const handleClick = (type: ActionType) => {
    setAction(type);
    setVisible(true);
  };

  // 弹窗关闭回调
  const handleClose = (action) => {
    setVisible(false);
    if (['create', 'delete', 'update'].includes(action)) {
      getList(action);
    }
    if (teamId && ['update', 'addMember', 'deleteMember'].includes(action)) {
      getTeamInfoDetail(teamId);
    }
  };

  return (
    <PageLayout title={t('business.title')} icon={<UserOutlined />}>
      <div className='user-manage-content'>
        <div style={{ display: 'flex', height: '100%' }}>
          <div className='left-tree-area'>
            <div className='sub-title'>
              {t('business.list')}
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
                {t('common:btn.add')}
              </Button>
            </div>
            <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('business.search_placeholder')}
                onPressEnter={(e: any) => {
                  getTeamList(e.target.value);
                }}
                onBlur={(e: any) => {
                  getTeamList(e.target.value);
                }}
              />
            </div>

            <div className='radio-list' style={{ overflowY: 'auto' }}>
              {_.map(listToTree(teamList as any), (item) => {
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
                                  active: child.id == (teamId as any),
                                })}
                                key={child.id}
                                onClick={() => {
                                  if (child.id !== (teamId as any)) {
                                    localStorage.setItem('curBusiId', _.toString(child.id));
                                    setTeamId(child.id as any);
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
                        active: item.id == (teamId as any),
                      })}
                      key={item.key}
                      onClick={() => {
                        console.log(item.id, teamId);
                        if (item.id !== (teamId as any)) {
                          localStorage.setItem('curBusiId', _.toString(item.id));
                          setTeamId(item.id as any);
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
                    onClick={() => handleClick(ActionType.EditBusiness)}
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
                          deleteBusinessTeam(teamId).then((_) => {
                            message.success(t('common:success.delete'));
                            handleClose('delete');
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
                    <span>ID：{teamInfo?.id}</span>
                    <span>
                      {t('common:table.note')}：{t('business.note_content')}
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
                    placeholder={t('business.team_search_placeholder')}
                  />
                </Col>
                <Button
                  type='primary'
                  onClick={() => {
                    handleClick(ActionType.AddBusinessMember);
                  }}
                >
                  {t('business.add_team')}
                </Button>
              </Row>

              <Table
                size='small'
                rowKey='id'
                columns={teamMemberColumns}
                dataSource={memberList && memberList.length > 0 ? memberList.filter((item) => item.user_group && item.user_group.name.indexOf(searchMemberValue) !== -1) : []}
                loading={memberLoading}
              />
            </div>
          ) : (
            <div className='blank-busi-holder'>
              <p style={{ textAlign: 'left', fontWeight: 'bold' }}>
                <InfoCircleOutlined style={{ color: '#1473ff' }} /> {t('Tips')}
              </p>
              <p>
                {t('business.empty')}&nbsp;
                <a onClick={() => handleClick(ActionType.CreateBusiness)}>{t('business.create')}</a>
              </p>
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
    </PageLayout>
  );
};

export default Resource;
