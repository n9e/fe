/**
 * Generate antd.dark.less
 * 1. 定义暗黑模式的 less 变量
 * 2. 重写 customize.less 阻止 antd drawer 组件覆盖 table 组件的样式
 */
var fs = require('fs');
var path = require('path');
var less = require('less');
var { exec } = require('child_process');

var options = less.options;

function saveLess(filePath, filename, callback) {
  var lessCode = fs.readFileSync(filePath, 'utf8');
  less
    .render(lessCode, {
      javascriptEnabled: true,
      paths: [path.dirname(filePath)].concat(options.paths),
      modifyVars: {
        'font-size-base': '12px',
        'menu-item-font-size': '14px',
        'form-item-margin-bottom': '18px',
        'btn-padding-horizontal-base': '12px',

        'blue-base': '#177ddc',
        'purple-base': '#642ab5',
        'cyan-base': '#13a8a8',
        'green-base': '#49aa19',
        'magenta-base': '#cb2b83',
        'pink-base': '#cb2b83', // alias of magenta
        'red-base': '#d32029',
        'orange-base': '#d87a16',
        'yellow-base': '#d8bd14',
        'volcano-base': '#d84a1b',
        'geekblue-base': '#2b4acb',
        'lime-base': '#8bbb11',
        'gold-base': '#d89614',

        'primary-color': '#FFBC0D',
        'success-color': '#4EBE77',
        'warning-color': '#FFBC0D',
        'link-color': '#4880FF',
        'tabs-ink-bar-color': '#FFBC0D',
        'radio-button-checked-bg': '#FFF2CB',
        // 'checkbox-check-color': '#333',
        'btn-primary-color': '#222',

        'font-family': 'Helvetica Neue,sans-serif,PingFangSC-Regular,microsoft yahei ui,microsoft yahei,simsun,"sans-serif"',

        // 2026-05 table design
        'table-bg': 'var(--fc-fill-2)',
        'table-header-bg': 'var(--fc-fill-2-5)',
        'table-header-color': 'var(--fc-text-3)',
        'table-header-sort-bg': 'var(--fc-fill-2-5)',
        'table-body-sort-bg': 'rgb(var(--fc-fill-5-rgb) / 0.1)',
        'table-row-hover-bg': 'rgb(var(--fc-fill-5-rgb) / 0.2)',
        'table-selected-row-color': 'inherit',
        // AntD calls color functions on selected/border tokens; patch runtime CSS vars in theme/default.less.
        'table-selected-row-bg': 'rgba(228, 228, 231, 0.15)',
        'table-body-selected-sort-bg': '@table-selected-row-bg',
        'table-selected-row-hover-bg': 'rgba(228, 228, 231, 0.25)',
        'table-expanded-row-bg': 'var(--fc-fill-2-5)',
        'table-border-color': '#e4e4e7',
        'table-padding-vertical': '16px',
        'table-padding-horizontal': '16px',
        'table-padding-vertical-md': '(@table-padding-vertical * 3 / 4)',
        'table-padding-horizontal-md': '(@table-padding-horizontal / 2)',
        'table-padding-vertical-sm': '(@table-padding-vertical / 2)',
        'table-padding-horizontal-sm': '(@table-padding-horizontal / 2)',
        'table-border-radius-base': '@border-radius-base',
        'table-footer-bg': '@table-header-bg',
        'table-footer-color': '@table-header-color',
        'table-header-bg-sm': '@table-header-bg',
        'table-font-size': '12px',
        'table-font-size-md': '14px',
        'table-font-size-sm': '@table-font-size',
        'table-header-cell-split-color': 'var(--fc-border-color)',
        'table-header-sort-active-bg': 'rgb(var(--fc-fill-5-rgb) / 0.4)',
        'table-fixed-header-sort-active-bg': 'var(--fc-fill-3)',
        'border-radius-base': '8px',
        'border-radius-sm': '4px',
        'checkbox-border-radius': '2px',
      },
      compress: false,
    })
    .then(function (output) {
      fs.writeFileSync(filename, `.theme-light-gold { ${output.css} }`);
      callback();
    });
}

var customizeFilePath = 'node_modules/antd/lib/style/mixins/customize.less';

exec(`cp ${customizeFilePath} ${customizeFilePath}.copy`, () => {
  // fs.writeFileSync(customizeFilePath, '.popover-customize-bg(@containerClass, @background: @popover-background, @prefix: @ant-prefix) when (@theme = dark) {}');
  saveLess('node_modules/antd/dist/antd.less', 'src/theme/antd.light-gold.less', () => {
    exec(`mv ${customizeFilePath}.copy ${customizeFilePath}`);
  });
});
