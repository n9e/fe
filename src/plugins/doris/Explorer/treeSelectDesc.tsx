import React, { useState } from 'react';
import { ITreeSelect } from '../types';
import { useTranslation } from 'react-i18next';

export default function TreeSelectDesc(props: ITreeSelect & { dbError: boolean }) {
  const { t:dorisT } = useTranslation('db_doris');
  const { db, table, field, dbError } = props;
  const dbDesc = `${dorisT('当前数据库')}：${db}  ${dorisT('数据表')}：${table} `;
  if(dbError) return <span className='ant-form-item-explain-error'>{dorisT('请先选择数据库和数据表')}</span>
  return table ? <span>{dbDesc}</span>: null;
}
