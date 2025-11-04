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

let existingEnv = {};
if (fs.existsSync(envUrl)) {
  const content = fs.readFileSync(envUrl, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim() && !line.startsWith('#'));

  lines.forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      existingEnv[key.trim()] = valueParts.join('=').trim();
    }
  });
}
_.forEach(feats, (feat) => {
  const key = `VITE_IS_${feat}`;
  existingEnv[key] = true;
});

fs.writeFileSync(
  envUrl,
  _.join(
    _.map(existingEnv, (value, key) => {
      return `${key}=${value}`;
    }),
    '\n',
  ),
);
