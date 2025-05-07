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
import { CloseOutlined, EditOutlined, DeleteOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { Team, ActionType } from '@/store/manageInterface';
import { deleteBusinessTeamMember, getBusinessTeamList, getBusinessTeamInfo, deleteBusinessTeam } from '@/services/manage';
import { getDefaultBusiness } from '@/components/BusinessGroup';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import BusinessModal from '@/pages/user/component/createModal';

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
  const [memberLoading, setMemberLoading] = useState<boolean>(false);
  const [searchMemberValue, setSearchMemberValue] = useState<string>('');
  const [businessModalVisible, setBusinessModalVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [teamId, setTeamId] = useState<string>(id || '');

  useEffect(() => {
    getTeamInfoDetail(id);
    setTeamId(id);
  }, [id]);

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
                busi_group_id: parseInt(teamId),
              },
            ];
            confirm({
              title: t('common:confirm.delete'),
              onOk: () => {
                deleteBusinessTeamMember(teamId, params).then(() => {
                  message.success(t('common:success.delete'));
                  getTeamInfoDetail(teamId);
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

  // 获取业务组列表
  const getTeamList = (search?: string, isDelete?: boolean) => {
    let params = {
      query: search,
      limit: PAGE_SIZE,
    };
    getBusinessTeamList(params).then((data) => {
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

  // 弹窗关闭回调
  const handleClose = (action: string) => {
    setBusinessModalVisible(false);
    const savedSearchValue = sessionStorage.getItem('businessGroupSearchValue') || '';
    if (['create', 'delete', 'update'].includes(action)) {
      getBusinessTeamList({
        query: savedSearchValue,
        limit: PAGE_SIZE,
      }).then((data) => {
        const results = data.dat || [];
        setBusiGroups(results);
        setBusiGroup(getDefaultBusiness(results));
        // 保存搜索结果
        if (savedSearchValue) {
          sessionStorage.setItem('businessGroupSearchValue', savedSearchValue);
          sessionStorage.setItem('businessGroupSearchResults', JSON.stringify(results));
        }
      });
    }
    if (teamId && ['update', 'addMember'].includes(action)) {
      getTeamInfoDetail(teamId);
    }
  };
  return (
    <Drawer width={960} closable={false} title={t('common:btn.edit')} destroyOnClose extra={<CloseOutlined onClick={onCloseDrawer} />} onClose={onCloseDrawer} visible={open}>
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
              onClick={() => {
                setAction(ActionType.EditBusiness);
                setBusinessModalVisible(true);
              }}
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
                      onCloseDrawer();
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
              className='searchInput'
              onChange={(e) => setSearchMemberValue(e.target.value)}
              placeholder={t('user:business.team_search_placeholder')}
            />
          </Col>
          <Button
            type='primary'
            onClick={() => {
              setAction(ActionType.AddBusinessMember);
              setBusinessModalVisible(true);
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

      <BusinessModal visible={businessModalVisible} action={action as ActionType} userType='business' onClose={handleClose} teamId={teamId} />
    </Drawer>
  );
}
