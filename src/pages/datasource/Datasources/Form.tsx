import React from 'react';
import { useParams } from 'react-router-dom';
import Prometheus from './Prometheus/Form';
import ElasticSearch from './ElasticSearch/Form';
import Jaeger from './Jaeger/Form';
// @ts-ignore
import Plus from 'plus:/parcels/Datasource/Form';

export default function Form(props) {
  const params = useParams<{ action: string; type: string }>();
  if (params.type === 'prometheus') {
    return <Prometheus {...props} />;
  }
  if (params.type === 'elasticsearch') {
    return <ElasticSearch {...props} />;
  }
  if (params.type === 'jaeger') {
    return <Jaeger {...props} />;
  }
  return <Plus type={params.type} {...props} />;
}
