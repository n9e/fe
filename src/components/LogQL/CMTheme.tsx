import { HighlightStyle, tags } from '@codemirror/highlight';
import { EditorView } from '@codemirror/view';

export const baseTheme = EditorView.theme({
  '.cm-content': {
    padding: 0,
  },
  '&.cm-editor.cm-focused': {
    outline: 'unset',
  },
  '.cm-scroller': {
    maxHeight: '100px',
    fontFamily: 'Consolas,Monaco,sans-serif,PingFangSC-Regular,microsoft yahei ui,microsoft yahei,simsun,"sans-serif"',
  },
  '.cm-matchingBracket': {
    fontWeight: 'bold',
    outline: '1px dashed transparent',
  },
  '.cm-nonmatchingBracket': { borderColor: 'red' },

  '.cm-tooltip.cm-tooltip-autocomplete': {
    '& > ul': {
      maxHeight: '350px',
      maxWidth: 'unset',
    },
    '& > ul > li': {
      padding: '2px 1em 2px 3px',
      overflowY: 'hidden',
    },
    '& > ul > li[aria-selected]': {
      color: 'unset',
    },
    minWidth: '30%',
  },

  '.cm-completionDetail': {
    float: 'right',
    color: '#999',
  },

  '.cm-tooltip.cm-completionInfo': {
    marginTop: '-11px',
    padding: '10px',
    border: 'none',
    minWidth: '250px',
    maxWidth: 'min-content',
  },

  '.cm-completionInfo.cm-completionInfo-right': {
    '&:before': {
      content: "' '",
      height: '0',
      position: 'absolute',
      width: '0',
      left: '-20px',
      borderWidth: '10px',
      borderStyle: 'solid',
      borderColor: 'transparent',
    },
    marginLeft: '12px',
  },
  '.cm-completionInfo.cm-completionInfo-left': {
    '&:before': {
      content: "' '",
      height: '0',
      position: 'absolute',
      width: '0',
      right: '-20px',
      borderWidth: '10px',
      borderStyle: 'solid',
      borderColor: 'transparent',
    },
    marginRight: '12px',
  },

  '.cm-completionMatchedText': {
    textDecoration: 'none',
    fontWeight: 'bold',
    color: '#3ba1fb',
  },

  '.cm-selectionMatch': {
    backgroundColor: 'unset',
  },

  '.cm-diagnostic': {
    '&.cm-diagnostic-error': {
      borderLeft: '3px solid #e65013',
    },
  },

  '.cm-completionIcon': {
    boxSizing: 'content-box',
    fontSize: '16px',
    lineHeight: '1',
    marginRight: '10px',
    verticalAlign: 'top',
    '&:after': { content: "'\\ea88'" },
    fontFamily: 'codicon',
    paddingRight: '0',
    opacity: '1',
    color: '#2ca9fd',
  },

  '.cm-completionIcon-function, .cm-completionIcon-method': {
    '&:after': { content: "'\\ea8c'" },
    color: '#652d90',
  },
  '.cm-completionIcon-class': {
    '&:after': { content: "'○'" },
  },
  '.cm-completionIcon-interface': {
    '&:after': { content: "'◌'" },
  },
  '.cm-completionIcon-variable': {
    '&:after': { content: "'𝑥'" },
  },
  '.cm-completionIcon-constant': {
    '&:after': { content: "'\\eb5f'" },
    color: '#2ca9fd',
  },
  '.cm-completionIcon-type': {
    '&:after': { content: "'𝑡'" },
  },
  '.cm-completionIcon-enum': {
    '&:after': { content: "'∪'" },
  },
  '.cm-completionIcon-property': {
    '&:after': { content: "'□'" },
  },
  '.cm-completionIcon-keyword': {
    '&:after': { content: "'\\eb62'" },
    color: '#616161',
  },
  '.cm-completionIcon-namespace': {
    '&:after': { content: "'▢'" },
  },
  '.cm-completionIcon-text': {
    '&:after': { content: "'\\ea95'" },
    color: '#ee9d28',
  },
  '.cm-tooltip': {
    'max-width': '800px',
  },
});

export const lightTheme = EditorView.theme(
  {
    '.cm-tooltip': {
      backgroundColor: '#f8f8f8',
      borderColor: 'rgba(52, 79, 113, 0.2)',
    },

    '.cm-tooltip.cm-tooltip-autocomplete': {
      '& li:hover': {
        backgroundColor: '#ddd',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: '#d6ebff',
        color: 'unset',
      },
    },

    '.cm-tooltip.cm-completionInfo': {
      backgroundColor: '#f5f5f5',
    },

    '.cm-tooltip > .cm-completionInfo.cm-completionInfo-right': {
      '&:before': {
        borderRightColor: '#f5f5f5',
      },
    },
    '.cm-tooltip > .cm-completionInfo.cm-completionInfo-left': {
      '&:before': {
        borderLeftColor: '#f5f5f5',
      },
    },

    '.cm-line': {
      '&::selection': {
        backgroundColor: '#add6ff',
      },
      '& > span::selection': {
        backgroundColor: '#add6ff',
      },
    },
  },
  { dark: false },
);

export const darkTheme = EditorView.theme(
  {
    '.cm-content': {
      caretColor: '#fff',
    },

    '.cm-tooltip.cm-tooltip-autocomplete': {
      '& li:hover': {
        backgroundColor: '#55555c',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: '#1d4f78',
        color: 'unset',
      },
    },

    '.cm-tooltip.cm-completionInfo': {
      backgroundColor: '#333338',
    },

    '.cm-tooltip > .cm-completionInfo.cm-completionInfo-right': {
      '&:before': {
        borderRightColor: '#333338',
      },
    },
    '.cm-tooltip > .cm-completionInfo.cm-completionInfo-left': {
      '&:before': {
        borderLeftColor: '#333338',
      },
    },

    '.cm-line': {
      '&::selection': {
        backgroundColor: '#767676',
      },
      '& > span::selection': {
        backgroundColor: '#767676',
      },
    },
  },
  { dark: true },
);
export const highlighter = HighlightStyle.define([
  { tag: tags.number, color: '#09885a' },
  { tag: tags.string, color: '#006eff' },
  { tag: tags.keyword, color: '#FF752A' },
  { tag: tags.function(tags.variableName), color: '#FF752A' },
  { tag: tags.labelName, color: '#800000' },
  { tag: tags.operator },
  { tag: tags.modifier, color: '#008080' },
  { tag: tags.paren },
  { tag: tags.squareBracket },
  { tag: tags.brace },
  { tag: tags.invalid, color: 'red' },
  { tag: tags.comment, color: '#888', fontStyle: 'italic' },
]);
