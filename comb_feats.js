const fs = require('fs');
const process = require('process');
const _ = require('lodash');

const argv = (key) => {
  if (process.argv.includes(`--${key}`)) return true;
  const value = process.argv.find((element) => element.startsWith(`--${key}=`));
  if (!value) return null;
  return value.replace(`--${key}=`, '');
};

const envUrl = '.env.advanced';
const feats = _.split(argv('feats'), ',');
fs.writeFileSync(
  envUrl,
  _.join(
    _.map(feats, (feat) => {
      return `VITE_IS_${feat}=true`;
    }),
    '\n',
  ),
);
