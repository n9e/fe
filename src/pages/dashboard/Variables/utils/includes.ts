import _ from 'lodash';

export default function includes(
  source:
    | {
        label: string;
        value: string;
      }[]
    | undefined,
  target,
) {
  if (_.isArray(target)) {
    // 不为空则有交集
    return !_.isEmpty(_.intersection(_.map(source, 'value'), target));
  }
  return _.includes(_.map(source, 'value'), target);
}
