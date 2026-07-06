import type { AlertRuleConditionHandler } from '../types';
import aliyunSlsQuery from './aliyun-sls';
import ckQuery from './ck';
import dorisQuery from './doris';
import elasticsearchQuery from './elasticsearch';
import influxdbQuery from './influxdb';
import lokiQuery from './loki';
import mysqlQuery from './mysql';
import oracleQuery from './oracle';
import pgsqlQuery from './pgsql';
import prometheusQuery from './prometheus';
import tencentClsQuery from './tencent-cls';
import tdengineQuery from './tdengine';
import volcTlsQuery from './volc-tls';
import victorialogsQuery from './victorialogs';
import bceBlsQuery from './bce-bls';
import cloudwatchQuery from './cloudwatch';
import gcmQuery from './gcm';

const HANDLERS: Record<string, AlertRuleConditionHandler> = {
  'aliyun-sls': aliyunSlsQuery,
  ck: ckQuery,
  doris: dorisQuery,
  elasticsearch: elasticsearchQuery,
  influxdb: influxdbQuery,
  loki: lokiQuery,
  mysql: mysqlQuery,
  oracle: oracleQuery,
  pgsql: pgsqlQuery,
  prometheus: prometheusQuery,
  'tencent-cls': tencentClsQuery,
  tdengine: tdengineQuery,
  'volc-tls': volcTlsQuery,
  victorialogs: victorialogsQuery,
  'bce-bls': bceBlsQuery,
  cloudwatch: cloudwatchQuery,
  gcm: gcmQuery,
};

export function getAlertRuleConditionHandler(cate: string): AlertRuleConditionHandler {
  const handler = HANDLERS[cate];
  if (!handler) {
    throw new Error(`No alert-rule condition handler for datasource cate: ${cate}`);
  }
  return handler;
}

export function hasAlertRuleConditionHandler(cate: string) {
  return Boolean(HANDLERS[cate]);
}
