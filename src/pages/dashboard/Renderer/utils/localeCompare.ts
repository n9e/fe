import _ from 'lodash';

export default function localeCompare(a: any, b: any) {
  if (typeof a === 'string' && typeof b === 'string') {
    if (!_.isNaN(_.toNumber(a)) && !_.isNaN(_.toNumber(b))) {
      return _.toNumber(a) - _.toNumber(b);
    }
    return a.localeCompare(b);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  // handle other types, like boolean, undefined, null
  return _.toString(a).localeCompare(_.toString(b));
}
