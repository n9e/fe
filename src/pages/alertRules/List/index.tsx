import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import { Space, Button } from 'antd';

import { CommonStateContext } from '@/App';
import { getBusiGroupsAlertRules } from '@/services/warning';

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

export default function List(props: ListProps) {
  const { t } = useTranslation('alertRules');
  const { businessGroup } = useContext(CommonStateContext);
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

  return (
    <div className='n9e-border-base alert-rules-list-container' style={{ height: '100%', overflowY: 'auto' }}>
      <ListNG
        hideBusinessGroupColumn={businessGroup.isLeaf && gids !== '-2'}
        showRowSelection
        headerExtra={<HeaderExtra gids={gids} />}
        data={data}
        loading={loading}
        setRefreshFlag={setRefreshFlag}
      />
    </div>
  );
}
