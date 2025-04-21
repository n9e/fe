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
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Col, Drawer, Input, Row, Space, Button, message, Table, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CloseOutlined } from '@ant-design/icons';
import { Team, ActionType } from '@/store/manageInterface';
import { EditOutlined, DeleteOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { deleteBusinessTeamMember, getBusinessTeamList, getBusinessTeamInfo, deleteBusinessTeam } from '@/services/manage';
import { getDefaultBusiness } from '@/components/BusinessGroup';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import UserInfoModal from '@/pages/user/component/createModal';

interface Props {
  open?: boolean;
  id: string;
  onCloseDrawer: () => void;
}

export default function index(props: Props) {
  const { setBusiGroups, setBusiGroup } = useContext(CommonStateContext);
  const { t } = useTranslation();
  const { confirm } = Modal;
  const PAGE_SIZE = 5000;
  const { open, id, onCloseDrawer } = props;
  const pagination = usePagination({ PAGESIZE_KEY: 'business' });
  const [memberList, setMemberList] = useState<{ user_group: any }[]>([]);
  const [teamInfo, setTeamInfo] = useState<{ name: string; id: number; update_by: string; update_at: number }>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [memberLoading, setMemberLoading] = useState<boolean>(false);
  const [searchMemberValue, setSearchMemberValue] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [teamId, setTeamId] = useState<string>(id || '');

  useEffect(() => {
    getTeamInfoDetail(id);
    setTeamId(id);
  }, [id]);

  useEffect(() => {
    getTeamList();
  }, []);

  const teamMemberColumns: ColumnsType<any> = [
    {
      title: t('user:team.name'),
      dataIndex: ['user_group', 'name'],
      ellipsis: true,
    },
    {
      title: t('common:table.note'),
      dataIndex: ['user_group', 'note'],
      ellipsis: true,
      render: (_: string, record) => record['user_group'].note || '-',
    },
    {
      title: t('user:business.perm_flag'),
      dataIndex: 'perm_flag',
    },
    {
      title: t('common:table.operations'),
      width: '100px',
      render: (_: string, record) => (
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

  const getList = (action: string) => {
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
    console.log(teamId);
    setVisible(false);
    if (['create', 'delete', 'update'].includes(action)) {
      getList(action);
    }
    if (teamId && ['update', 'addMember', 'deleteMember'].includes(action)) {
      getTeamInfoDetail(teamId);
    }
  };
  return (
    <Drawer
      width={700}
      closable={false}
      title={t('common:btn.edit')}
      destroyOnClose
      extra={
        <CloseOutlined
          onClick={() => {
            onCloseDrawer();
          }}
        />
      }
      onClose={() => {
        onCloseDrawer();
      }}
      visible={open}
    >
      {teamList.length > 0 ? (
        <div>
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
                    title: t('common:btn.delete'),
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
              }}
            >
              <Space wrap>
                <span>ID：{teamInfo?.id}</span>
                <span>
                  {t('common:table.note')}：{t('user:business.note_content')}
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
                placeholder={t('user:business.team_search_placeholder')}
              />
            </Col>
            <Button
              type='primary'
              onClick={() => {
                handleClick(ActionType.AddBusinessMember);
              }}
            >
              {t('user:business.add_team')}
            </Button>
          </Row>

          <Table
            className='mt8'
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
            {t('user:business.empty')}&nbsp;
            <a onClick={() => handleClick(ActionType.CreateBusiness)}>{t('user:business.create')}</a>
          </p>
        </div>
      )}
      <UserInfoModal visible={visible} action={action as ActionType} userType='business' onClose={handleClose} teamId={teamId} />
    </Drawer>
  );
}
