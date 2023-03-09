import React from 'react';
import _ from 'lodash';
import Queries from './Queries';
import Triggers from './Triggers';

export default function index({ form }) {
  return (
    <>
      <Queries form={form} />
      <Triggers queries={[]} />
    </>
  );
}
