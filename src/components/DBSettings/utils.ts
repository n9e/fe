import _ from 'lodash';
import { RSAEncrypt } from '@/utils';
import { ShardBaseType } from './types';

export function shardRSAEncrypt(data: ShardBaseType, type: string) {
  const cloned = _.cloneDeep(data);
  if (cloned && !cloned[`${type}.is_encrypt`]) {
    if (cloned[`${type}.password`]) {
      cloned[`${type}.password`] = RSAEncrypt(cloned[`${type}.password`]);
    }
    if (cloned[`${type}.access_key_secret`]) {
      cloned[`${type}.access_key_secret`] = RSAEncrypt(cloned[`${type}.access_key_secret`]);
    }
    cloned[`${type}.is_encrypt`] = true;
  }
  return cloned;
}
