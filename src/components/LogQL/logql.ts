import _ from 'lodash';
import { Extension } from '@codemirror/state';
import { CompleteConfiguration, CompleteStrategy, newCompleteStrategy } from './complete';
import { CompletionContext } from '@codemirror/autocomplete';
import { SQLDialect } from '@codemirror/lang-sql';

const KEYWORDS = [
  'select',
  'as',
  'group by',
  'order by',
  'from',
  'where',
  'and',
  'or',
  'not',
  'in',
  'between',
  'contains',
  'array',
  'limit',
  'offset',
  'union',
  'intersect',
  'except',
  'asc',
  'desc',
  'having',
];

const dialect = SQLDialect.define({
  keywords: KEYWORDS.join(' '),
});
export class LogQLExtension {
  private complete: CompleteStrategy;
  private enableCompletion: boolean;

  constructor() {
    this.complete = newCompleteStrategy();
    this.enableCompletion = true;
  }

  setComplete(conf?: CompleteConfiguration): LogQLExtension {
    this.complete = newCompleteStrategy(conf);
    return this;
  }

  getComplete(): CompleteStrategy {
    return this.complete;
  }

  activateCompletion(activate: boolean): LogQLExtension {
    this.enableCompletion = activate;
    return this;
  }

  asExtension(): Extension {
    let extension: Extension = [dialect.language];
    if (this.enableCompletion) {
      const completion = dialect.language.data.of({
        autocomplete: (context: CompletionContext) => {
          return this.complete.logQL(context);
        },
      });
      extension = _.concat(extension, completion);
    }
    return extension;
  }
}
