import _ from 'lodash';

export default function getUUID() {
  return _.toString(new Date().getTime());
}
