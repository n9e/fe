import { getAlertEventList } from '@/services/warning';
import { json2csv } from 'json-2-csv';

export const downloadFile = (data = '', filename = 'export.csv') => {
  let body = document.body;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(
    new Blob(['\ufeff' + data], {
      type: 'text/csv;charset=utf-8;',
    }),
  );
  a.setAttribute('download', filename);
  body.appendChild(a);
  a.click();
  body.removeChild(a);
};

const exportEvents = (params, callback) => {
  getAlertEventList(params).then((res) => {
    json2csv(res, callback);
  });
};
export default exportEvents;
