import React from 'react';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';
import Detail from './Detail';

export default function index() {
  const { state } = useLocation<any>();
  if (state && state.isBuiltin) {
    return <Detail isPreview isBuiltin gobackPath='/dashboards-built-in' builtinParams={_.omit(state, 'isBuiltin')} />;
  }
  return <Detail />;
}
