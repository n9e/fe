import React from 'react';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import Detail from '@/pages/dashboard/Detail/Detail';

export default function index() {
  const { search } = useLocation<any>();
  const query = queryString.parse(search);
  const id = _.toNumber(query.__uuid__);

  return <Detail isPreview isBuiltin gobackPath='/components' builtinParams={id} hideGoBack hideGoList />;
}
