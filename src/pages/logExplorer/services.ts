import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { IndexDataItem } from './types';

export type { IndexDataItem };

// export const getDorisDatabases = (data: DorisDBParams): Promise<string[]> => {
//   return request('/api/n9e/db-databases', {
//     method: RequestMethod.Post,
//     data,
//   }).then((res) => res.dat);
// };
