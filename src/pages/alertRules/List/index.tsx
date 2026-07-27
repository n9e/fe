import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import { Space, Button } from 'antd';

import { CommonStateContext } from '@/App';
import { getBusiGroupsAlertRules } from '@/services/warning';
import EmptyGuide from '@/components/EmptyGuide';
import DocumentDrawer from '@/components/DocumentDrawer';

import { AlertRuleType } from '../types';
import MoreOperations from './MoreOperations';
import Import from './Import';
import ListNG from './ListNG';

interface ListProps {
  gids?: string;
}

function HeaderExtra(
  props: ListProps & {
    selectRowKeys?: React.Key[];
    selectedRows?: AlertRuleType<any>[];
    getList?: () => void;
  },
) {
  const { t } = useTranslation('alertRules');
  const { businessGroup, groupedDatasourceList, reloadGroupedDatasourceList, datasourceCateOptions } = useContext(CommonStateContext);
  const history = useHistory();
  const { gids, selectRowKeys = [], selectedRows = [], getList } = props;

  return (
    <Space>
      {businessGroup.isLeaf && gids !== '-2' && (
        <Button
          type='primary'
          onClick={() => {
            history.push(`/alert-rules/add/${businessGroup.id}`);
          }}
          className='strategy-table-search-right-create'
        >
          {t('common:btn.add')}
        </Button>
      )}
      {businessGroup.isLeaf && businessGroup.id && gids !== '-2' && (
        <Button
          onClick={() => {
            if (businessGroup.id && getList) {
              Import({
                busiId: businessGroup.id,
                refreshList: getList,
                groupedDatasourceList,
                reloadGroupedDatasourceList,
                datasourceCateOptions,
              });
            }
          }}
        >
          {t('common:btn.import')}
        </Button>
      )}
      {getList && (
        <MoreOperations
          bgid={businessGroup.id}
          isLeaf={!!(businessGroup.isLeaf && businessGroup.id && gids !== '-2')}
          selectRowKeys={selectRowKeys}
          selectedRows={selectedRows}
          getAlertRules={getList}
        />
      )}
    </Space>
  );
}

const DOC_URL = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/';

export default function List(props: ListProps) {
  const { t, i18n } = useTranslation('alertRules');
  const { businessGroup, groupedDatasourceList, reloadGroupedDatasourceList, datasourceCateOptions, darkMode } = useContext(CommonStateContext);
  const history = useHistory();
  const { gids } = props;
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [data, setData] = useState<AlertRuleType<any>[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = () => {
    setLoading(true);
    const ids = gids === '-2' ? undefined : gids;
    getBusiGroupsAlertRules(ids)
      .then((res) => {
        setData(res.dat || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [gids, refreshFlag]);

  // 仅在选中具体叶子业务组（有 id 且非「未归组」-2）时，才允许在组内新增 / 导入告警规则
  const canManageInGroup = !!(businessGroup.isLeaf && businessGroup.id && gids !== '-2');

  return (
    <div className='fc-border rounded-lg alert-rules-list-container' style={{ height: '100%', overflowY: 'auto' }}>
      <ListNG
        hideBusinessGroupColumn={businessGroup.isLeaf && gids !== '-2'}
        showRowSelection
        headerExtra={<HeaderExtra gids={gids} />}
        data={data}
        loading={loading}
        setRefreshFlag={setRefreshFlag}
        emptyGuide={
          // 仅在「确实一条规则都没有」时展示引导；加载中或筛选未命中时回退默认空态，避免误导
          !loading && data.length === 0 ? (
            <EmptyGuide
              title={t('empty_guide.title')}
              descriptionClassName='max-w-[620px]'
              description={
                <>
                  <div className='mb-1'>{t('empty_guide.steps_intro')}</div>
                  <ol className='mb-0 pl-[18px] list-decimal text-left'>
                    <li className='leading-[1.7]'>{t('empty_guide.step_datasource')}</li>
                    <li className='leading-[1.7]'>{t('empty_guide.step_rule')}</li>
                    <li className='leading-[1.7]'>{t('empty_guide.step_notify')}</li>
                  </ol>
                </>
              }
              actions={
                <>
                  {canManageInGroup && (
                    <Button type='primary' onClick={() => history.push(`/alert-rules/add/${businessGroup.id}`)}>
                      {t('common:btn.add')}
                    </Button>
                  )}
                  {canManageInGroup ? (
                    <a
                      onClick={() =>
                        Import({
                          busiId: businessGroup.id!, // canManageInGroup 已保证非空
                          refreshList: fetchData,
                          groupedDatasourceList,
                          reloadGroupedDatasourceList,
                          datasourceCateOptions,
                        })
                      }
                    >
                      {t('empty_guide.from_template')}
                    </a>
                  ) : (
                    <a onClick={() => history.push('/components')}>{t('empty_guide.from_template')}</a>
                  )}
                  <a
                    onClick={() => {
                      DocumentDrawer({
                        language: i18n.language,
                        darkMode,
                        title: t('common:page_help'),
                        type: 'iframe',
                        documentPath: DOC_URL,
                      });
                    }}
                  >
                    {t('empty_guide.doc')}
                  </a>
                </>
              }
            />
          ) : undefined
        }
      />
    </div>
  );
}
