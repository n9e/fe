import React from 'react';
import Prometheus from './Prometheus/Detail';
import ElasticSearch from './ElasticSearch/Detail';
import Jaeger from './Jaeger/Detail';
import Loki from './Loki/Detail';
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
  if (props.data.plugin_type === 'loki') {
    return <Loki {...props} />;
  }
  return <Plus type={props.data.plugin_type} {...props} />;
}
