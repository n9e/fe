import React from 'react';
import Prometheus from './Prometheus/Detail';
import ElasticSearch from './ElasticSearch/Detail';
import Jaeger from './Jaeger/Detail';
// @ts-ignore
import Plus from 'plus:/parcels/Datasource/Detail';

export default function Form(props) {
  if (props.data.plugin_type === 'prometheus') {
    return <Prometheus {...props} />;
  }
  if (props.data.plugin_type === 'elasticsearch') {
    return <ElasticSearch {...props} />;
  }
  if (props.data.plugin_type === 'jaeger') {
    return <Jaeger {...props} />;
  }
  return <Plus type={props.data.plugin_type} {...props} />;
}
