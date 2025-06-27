import React from 'react';
import { ITreeSelect } from '../types';
import { useTranslation } from 'react-i18next';

export default function TreeSelectDesc(props: ITreeSelect & { dbError: boolean }) {
  const { t: dorisT } = useTranslation('db_doris');
  const { db, table, field, dbError } = props;
  const dbDesc = `${dorisT('current_database')}：${db}  ${dorisT('table')}：${table} `;

  if (dbError) return <span className='ant-form-item-explain-error'>{dorisT('database_table_required')}</span>;
  return table ? <span>{dbDesc}</span> : null;
}
