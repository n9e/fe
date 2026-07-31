import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface DatasourceItem {
  sub_id?: number;
  channel: string;
  target: string;
  username: string;
  status: number;
  detail: string;
}

interface AlertRulesRecords {
  [key: string]: {
    target: string;
    username: string;
    status: number;
    detail: string;
  }[];
}

interface AlertSubscribesRecord {
  sub_id: number;
  notifies: AlertRulesRecords;
}

/**
 * 探测这套部署是否曾成功发出过通知，用于新手引导判定「发送测试告警」是否完成。
 * 只回布尔与时间戳，不含渠道/接收人/内容。老后端没有该路由时会 404，调用方按未送达处理。
 */
export function getNotifyDelivered(): Promise<{ delivered: boolean; last_at: number }> {
  return request('/api/n9e/notification-records/delivered', {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => {
    return res.dat || { delivered: false, last_at: 0 };
  });
}

export function getEventNotifyRecords(eventId): Promise<{
  sub_rules: AlertSubscribesRecord[];
  notifies: AlertRulesRecords;
}> {
  return request(`/api/n9e/event-notify-records/${eventId}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return (
      res.dat || {
        sub_rules: [],
        notifies: [],
      }
    );
  });
}
