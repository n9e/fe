import React, { useContext, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Table, Tag, Alert } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import semver from 'semver';
import PageLayout from '@/components/pageLayout';
import BusinessGroup from '@/components/BusinessGroup';
import { CommonStateContext } from '@/App';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { getDashboards, getDashboard } from '@/services/dashboardV2';
import MigrationModal from './MigrationModal';
import './locale';

export default function index() {
  const { t } = useTranslation('migrationDashboard');
  const { businessGroup } = useContext(CommonStateContext);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refresh_'));
  const [loading, setLoading] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [settingOpen, setSettingOpen] = useState(false);

  useEffect(() => {
    if (businessGroup.id) {
      setLoading(true);
      getDashboards(businessGroup.id)
        .then((res) => {
          let requests: Promise<any>[] = [];
          _.forEach(res, (board) => {
            requests.push(getDashboard(board.id));
          });
          Promise.all(requests)
            .then((res) => {
              setBoards(
                _.filter(res, (item) => {
                  try {
                    const configs = JSON.parse(item.configs);
                    // v6 对应的版本号是 3.0.0，小于 3.0.0 的都是需要迁移的
                    return configs && semver.lt(configs.version, '3.0.0');
                  } catch (e) {
                    return false;
                  }
                }),
              );
            })
            .finally(() => {
              setLoading(false);
            });
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [businessGroup.id, refreshFlag]);

  return (
    <PageLayout title={t('title')}>
      <div style={{ display: 'flex' }}>
        <BusinessGroup />
        {businessGroup.ids ? (
          <div className='dashboards-v2'>
            <div style={{ marginBottom: 10 }}>
              <Button
                type='primary'
                onClick={() => {
                  setSettingOpen(true);
                }}
              >
                {t('migrate')}
              </Button>
            </div>
            <Alert
              message={
                <div>
                  <Trans ns='migrationDashboard' i18nKey='help' components={{ br: <br /> }} />
                </div>
              }
              type='warning'
            />
            <Table
              size='small'
              loading={loading}
              dataSource={boards}
              columns={[
                {
                  title: t('dashboard:name'),
                  dataIndex: 'name',
                },
                {
                  title: t('dashboard:tags'),
                  dataIndex: 'tags',
                  render: (text: string) => (
                    <>
                      {_.map(_.split(text, ' '), (tag, index) => {
                        return tag ? (
                          <Tag color='purple' key={index}>
                            {tag}
                          </Tag>
                        ) : null;
                      })}
                    </>
                  ),
                },
                {
                  title: t('common:table.update_at'),
                  width: 200,
                  dataIndex: 'update_at',
                  render: (text: number) => moment.unix(text).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  title: t('common:table.create_by'),
                  width: 70,
                  dataIndex: 'create_by',
                },
              ]}
              pagination={false}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text='监控仪表盘' />
        )}
      </div>
      <MigrationModal
        visible={settingOpen}
        setVisible={setSettingOpen}
        boards={boards}
        onOk={() => {
          setRefreshFlag(_.uniqueId('refresh_'));
        }}
      />
    </PageLayout>
  );
}
