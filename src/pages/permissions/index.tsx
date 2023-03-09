import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, List, Input, Modal, Space } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { RoleType, OperationType } from './types';
import { getRoles, deleteRoles, getOperations } from './services';
import RoleFormModal from './RoleFormModal';
import Operations from './Operations';
import './locale';

const { confirm } = Modal;

export default function index() {
  const { t } = useTranslation('permissions');
  const [roleList, setRoleList] = useState<RoleType[]>([]);
  const [activeRole, setActiveRole] = useState<RoleType>();
  const [roleSearchValue, setRoleSearchValue] = useState<string>('');
  const [operations, setOperations] = useState<OperationType[]>([]);

  const fetchRoles = () => {
    getRoles().then((res) => {
      setRoleList(res);
      if (!activeRole) {
        setActiveRole(res[0]);
      }
    });
  };

  useEffect(() => {
    fetchRoles();
    getOperations().then((res) => {
      setOperations(res);
    });
  }, []);

  return (
    <PageLayout title={t('title')} icon={<SafetyCertificateOutlined />}>
      <div className='user-manage-content'>
        <div style={{ display: 'flex', height: '100%' }}>
          <div className='left-tree-area'>
            <div className='sub-title'>
              {t('roles')}
              <Button
                style={{
                  height: '30px',
                }}
                size='small'
                type='link'
                onClick={() => {
                  RoleFormModal({
                    action: 'post',
                    onOk: () => {
                      fetchRoles();
                    },
                  });
                }}
              >
                {t('role_add')}
              </Button>
            </div>
            <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
              <Input
                prefix={<SearchOutlined />}
                value={roleSearchValue}
                onChange={(e) => {
                  setRoleSearchValue(e.target.value);
                }}
              />
            </div>

            <List
              style={{
                marginBottom: '12px',
                flex: 1,
                overflow: 'auto',
              }}
              dataSource={
                _.filter(roleList, (item) => {
                  return _.upperCase(item.name).indexOf(_.upperCase(roleSearchValue)) > -1;
                }) as RoleType[]
              }
              size='small'
              renderItem={(item) => (
                <List.Item key={item.id} className={activeRole?.id === item.id ? 'is-active' : ''} onClick={() => setActiveRole(item)}>
                  {item.name}
                </List.Item>
              )}
            />
          </div>
          <div className='resource-table-content'>
            <div className='team-info'>
              <Space
                style={{
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                <span>{activeRole?.name}</span>
                {activeRole?.name !== 'Admin' && (
                  <>
                    <EditOutlined
                      onClick={() => {
                        RoleFormModal({
                          action: 'put',
                          initialValues: activeRole,
                          onOk: (values) => {
                            fetchRoles();
                            setActiveRole(values);
                          },
                        });
                      }}
                    />
                    <DeleteOutlined
                      disabled={activeRole?.name === 'Admin'}
                      onClick={() => {
                        confirm({
                          title: t('common:confirm.delete'),
                          onOk() {
                            if (activeRole?.id) {
                              deleteRoles(activeRole?.id).then(() => {
                                fetchRoles();
                                setActiveRole(roleList[0]);
                              });
                            }
                          },
                        });
                      }}
                    />
                  </>
                )}
              </Space>
              <div>
                {t('common:table.note')}：{activeRole?.note || '-'}
              </div>
            </div>
            <Operations data={operations} roleId={activeRole?.id} disabled={activeRole?.name === 'Admin'} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
