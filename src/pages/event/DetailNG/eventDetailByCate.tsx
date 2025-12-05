import React from 'react';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';

import TDengineDetail from '@/plugins/TDengine/Event';
import { Event as ElasticsearchDetail } from '@/plugins/elasticsearch';
import { Event as MySQLDetail } from '@/plugins/mysql';
import { Event as Pgsql } from '@/plugins/pgsql';
import { Event as Victorialogs } from '@/plugins/victorialogs';

import Host from '../Detail/Host';
import PrometheusDetail from '../Detail/Prometheus';
import LokiDetail from '../Detail/Loki';

const eventDetail = ({ eventDetail, t, history, commonState, indexPatterns }) => {
  const { cate, rule_prod } = eventDetail || {};

  if (cate === 'host') {
    return Host(t, commonState);
  }
  if (cate === DatasourceCateEnum.prometheus && !_.includes(['firemap', 'northstar'], rule_prod)) {
    return PrometheusDetail({
      eventDetail,
      history,
    });
  }
  if (cate === DatasourceCateEnum.loki) {
    return LokiDetail({
      eventDetail,
      history,
    });
  }
  if (cate === DatasourceCateEnum.tdengine) {
    return TDengineDetail(t);
  }
  if (cate === DatasourceCateEnum.elasticsearch) {
    return ElasticsearchDetail({ indexPatterns });
  }
  if (cate === DatasourceCateEnum.opensearch) {
    return ElasticsearchDetail();
  }
  if (cate === DatasourceCateEnum.mysql) {
    return MySQLDetail();
  }
  if (cate === DatasourceCateEnum.pgsql) {
    return Pgsql();
  }
  if (cate === DatasourceCateEnum.victorialogs) {
    return Victorialogs();
  }

  return [false];
};

export default eventDetail;
