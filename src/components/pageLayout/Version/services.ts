import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface Versions {
  github_verison: string;
  version: string;
}

export const getVersions = function (): Promise<Versions> {
  return request('/api/n9e/versions', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};
