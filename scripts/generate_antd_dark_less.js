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
        'primary-color': '#8162dc',
        'border-color-base': 'rgb(79, 82, 99)',
        'border-color-split': 'rgb(57, 60, 77)',
        'component-background': 'rgb(39, 42, 56)',
        'table-header-bg': '#303340',
        'table-row-hover-bg': '#303340',
        'table-header-sort-bg': '#303340',
        'popover-background': 'rgb(39, 42, 56)',
        'normal-color': 'rgb(79, 82, 99)',
        'warning-color': '#6C53B1',
      },
      compress: false,
    })
    .then(function (output) {
      fs.writeFileSync(filename, `.theme-dark { ${output.css} }`);
      callback();
    });
}

var customizeFilePath = 'node_modules/antd/lib/style/mixins/customize.less';

exec(`cp ${customizeFilePath} ${customizeFilePath}.copy`, () => {
  fs.writeFileSync(customizeFilePath, '.popover-customize-bg(@containerClass, @background: @popover-background, @prefix: @ant-prefix) when (@theme = dark) {}');
  saveLess('node_modules/antd/dist/antd.dark.less', 'src/theme/antd.dark.less', () => {
    exec(`mv ${customizeFilePath}.copy ${customizeFilePath}`);
  });
});
