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
import PageLayout, { HelpLink } from '@/components/pageLayout';
import { Button, Table, Input, message, Row, Col, Modal, Space } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import UserInfoModal from './component/createModal';
import { deleteBusinessTeamMember, getBusinessTeamList, getBusinessTeamInfo, deleteBusinessTeam } from '@/services/manage';
import { Team, ActionType } from '@/store/manageInterface';
import { CommonStateContext } from '@/App';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@/utils';
import { listToTree, getCollapsedKeys, getLocaleExpandedKeys, setLocaleExpandedKeys, getDefaultBusiness } from '@/components/BusinessGroup';
import Tree from '@/components/BusinessGroup/components/Tree';
import '@/components/BlankBusinessPlaceholder/index.less';
import './index.less';
import usePagination from '@/components/usePagination';

const { confirm } = Modal;
export const PAGE_SIZE = 5000;

const Resource: React.FC = () => {
  const { setBusiGroups, siteInfo, setBusiGroup } = useContext(CommonStateContext);
  const { t } = useTranslation('user');
  const urlQuery = useQuery();
  const pagination = usePagination({ PAGESIZE_KEY: 'business' });
  const id = urlQuery.get('id');
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [teamId, setTeamId] = useState<string>(id || '');
  const [memberList, setMemberList] = useState<{ user_group: any }[]>([]);
  const [teamInfo, setTeamInfo] = useState<{ name: string; id: number; update_by: string; update_at: number }>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [memberLoading, setMemberLoading] = useState<boolean>(false);
  const [searchMemberValue, setSearchMemberValue] = useState<string>('');
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
        <Button
          type='link'
          danger={memberList.length > 1}
          disabled={memberList.length <= 1}
          onClick={() => {
            if (memberList.length <= 1) return;

            const params = [
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
        </Button>
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
    <PageLayout
      title={
        <Space>
          {t('business.title')}
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/personnel-permissions/-business-group/' />
        </Space>
      }
      icon={<UserOutlined />}
    >
      <div className='user-manage-content'>
        <div style={{ display: 'flex', gap: 10, height: '100%', background: 'unset' }}>
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
            {siteInfo?.businessGroupDisplayMode == 'list' ? (
              <div className='radio-list' style={{ overflowY: 'auto' }}>
                {_.map(teamList, (item) => {
                  return (
                    <div
                      className={classNames({
                        'n9e-metric-views-list-content-item': true,
                        active: _.toNumber(item.id) === _.toNumber(teamId),
                      })}
                      key={item.id}
                      onClick={() => {
                        if (_.toNumber(item.id) !== _.toNumber(teamId)) {
                          setTeamId(item.id as any);
                        }
                      }}
                    >
                      <span className='name'>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='radio-list' style={{ overflowY: 'auto' }}>
                {!_.isEmpty(teamList) && (
                  <Tree
                    defaultExpandedKeys={getCollapsedKeys(listToTree(teamList as any, siteInfo?.businessGroupSeparator), getLocaleExpandedKeys(), teamId as any)}
                    selectedKeys={teamId ? [_.toString(teamId)] : []}
                    onSelect={(_selectedKeys, e: any) => {
                      const nodeId = e.node.id;
                      setTeamId(nodeId as any);
                    }}
                    onExpand={(expandedKeys: string[]) => {
                      setLocaleExpandedKeys(expandedKeys);
                    }}
                    treeData={listToTree(teamList as any, siteInfo?.businessGroupSeparator)}
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
                    // color: '#666',
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
                className='mt-2'
                size='small'
                rowKey='id'
                columns={teamMemberColumns}
                dataSource={memberList && memberList.length > 0 ? memberList.filter((item) => item.user_group && item.user_group.name.indexOf(searchMemberValue) !== -1) : []}
                loading={memberLoading}
                pagination={pagination}
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
