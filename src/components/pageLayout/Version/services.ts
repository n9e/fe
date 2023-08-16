import _ from 'lodash';
import semver from 'semver';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface Versions {
  github_verison: string;
  version: string;
  newVersion: boolean;
}

export const getVersions = function (): Promise<Versions> {
  return request('/api/n9e/versions', {
    method: RequestMethod.Get,
  }).then((res) => {
    const data = _.isPlainObject(res.dat) ? res.dat : {};
    if (semver.valid(data.version) && semver.valid(data.github_verison) && semver.gt(data.github_verison, data.version)) {
      return {
        ...data,
        newVersion: true,
      };
    }
    return {
      ...data,
      newVersion: false,
    };
  });
};
