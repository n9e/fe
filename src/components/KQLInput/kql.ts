import _ from 'lodash';
import { styleTags, tags } from '@codemirror/highlight';
import { Extension } from '@codemirror/state';
import { CompleteConfiguration, CompleteStrategy, newCompleteStrategy } from './complete';
import { CompletionContext } from '@codemirror/autocomplete';
import { LRLanguage } from '@codemirror/language';
import { parser } from './grammar/parser';

export enum LanguageType {
  KQL = 'KQL',
}

export function KQLLanguage(top: LanguageType): LRLanguage {
  return LRLanguage.define({
    parser: parser.configure({
      top: top,
      props: [
        styleTags({
          LineComment: tags.comment,
          FieldName: tags.labelName,
          FieldValue: tags.string,
          StringLiteral: tags.string,
          NumberLiteral: tags.number,
          'And Or': tags.logicOperator,
          '( )': tags.paren,
          '⚠': tags.invalid,
        }),
      ],
    }),
    languageData: {
      closeBrackets: { brackets: ['(', '"'] },
      commentTokens: { line: '#' },
    },
  });
}

export class kQLExtension {
  private complete: CompleteStrategy;
  private enableCompletion: boolean;

  constructor() {
    this.complete = newCompleteStrategy();
    this.enableCompletion = true;
  }

  setComplete(conf?: CompleteConfiguration): kQLExtension {
    this.complete = newCompleteStrategy(conf);
    return this;
  }

  getComplete(): CompleteStrategy {
    return this.complete;
  }

  activateCompletion(activate: boolean): kQLExtension {
    this.enableCompletion = activate;
    return this;
  }

  asExtension(languageType = LanguageType.KQL): Extension {
    const language = KQLLanguage(languageType);
    let extension: Extension = [language];
    if (this.enableCompletion) {
      const completion = language.data.of({
        autocomplete: (context: CompletionContext) => {
          return this.complete.KQL(context);
        },
      });
      extension = extension.concat(completion);
    }
    return extension;
  }
}
