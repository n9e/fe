import _ from 'lodash';
import moment from 'moment';

export default function getValuePropsWithTimeFormItem(value: string | moment.Moment) {
  if (_.isString(value)) {
    return {
      value: moment(value, 'HH:mm'),
    };
  }
  if (moment.isMoment(value)) {
    return {
      value: value,
    };
  }
  return {
    value: undefined,
  };
}
