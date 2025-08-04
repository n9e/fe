import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import ListNG from '@/pages/warning/subscribe/ListNG';

import { getNotifySubAlertRules } from '../../services';

interface Props {
  id: number;
}

export default function SubscribeRules(props: Props) {
  const { id } = props;
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = () => {
    setLoading(true);
    getNotifySubAlertRules(id)
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
