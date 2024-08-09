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
