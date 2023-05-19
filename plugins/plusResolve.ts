import { loadEnv } from 'vite';
import _ from 'lodash';

const env = loadEnv('advanced', process.cwd(), '');

export default function PlusResolve() {
  const plusModuleId = 'plus:';

  return {
    name: 'plus-resolve',
    resolveId(id, importer, resolveOptions) {
      if (id.indexOf(plusModuleId) === 0) {
        let updatedId = id;
        if (_.endsWith(env.npm_lifecycle_event, ':advanced')) {
          updatedId = id.replace(plusModuleId, '/src/plus');
        } else {
          updatedId = '/plugins/PlusPlaceholder';
        }
        return this.resolve(updatedId, importer, Object.assign({ skipSelf: true }, resolveOptions)).then((resolved) => resolved || { id: updatedId });
      }
    },
  };
}
