import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import ListNG from '@/pages/alertRules/List/ListNG';
import { AlertRuleType } from '@/pages/alertRules/types';

import { getNotifyAlertRules } from '../../services';

interface Props {
  id: number;
}

export default function AlertRules(props: Props) {
  const { id } = props;
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [data, setData] = useState<AlertRuleType<any>[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = () => {
    setLoading(true);
    getNotifyAlertRules(id)
      .then((dat) => {
        setData(dat || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [id, refreshFlag]);

  return <ListNG hideBusinessGroupColumn readonly data={data} loading={loading} setRefreshFlag={setRefreshFlag} />;
}
