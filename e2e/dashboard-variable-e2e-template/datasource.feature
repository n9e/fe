# language: zh-CN

功能: datasource 变量 E2E 模板
  为了验证 datasource 变量的数据源过滤、默认值和下游联动
  需要覆盖编辑、渲染、交互和会话内回显

  背景:
    假如 变量类型是 "datasource"
    而且 使用全局默认测试上下文
    而且 使用默认 dashboard 页面
    而且 测试应基于真实页面交互完成
    而且 datasource 候选项应来自真实接口和真实页面数据
    而且 文本卡片 panel 使用 ${name} 引用变量

  场景大纲: 编辑 datasource 变量
    假如 用户打开“添加变量”弹窗
    当 用户输入变量名称 "<ds_name>"
    并且 用户输入变量别名 "<ds_label>"
    并且 用户选择数据源类型 "<datasource_cate>"
    并且 用户输入 “数据源过滤” "<regex>"
    并且 用户选择默认值 "<default_value>"
    并且 用户在变量编辑弹窗内点击“保存”
    那么 预览区应展示过滤后的数据源列表
    而且 默认值下拉中应仅展示符合过滤条件的选项
    而且 再次打开编辑弹窗时 definition、regex、defaultValue、label 应正确回显

    例子:
      | ds_name | ds_label | datasource_cate | regex | default_value |
      | ds | 数据源 | prometheus | /prom/ | 1 |

  场景: 渲染 datasource 变量和文本卡片 panel
    假如 当前会话中已创建 datasource 变量 "ds"
    而且 已创建一个“文本卡片” panel 且内容为 "ds=${ds}"
    当 页面完成渲染
    那么 页面上应展示数据源变量选择器
    而且 候选项应与过滤后的数据源列表一致
    而且 初始值应为配置的默认数据源
    而且 panel 中应显示当前 datasource id 或其替换结果

  场景: 交互 datasource 变量
    假如 页面已渲染 datasource 变量 "ds"
    而且 存在依赖该数据源变量的 query 变量
    而且 已创建一个“文本卡片” panel 且内容为 "ds=${ds}"
    当 用户切换选中的数据源
    那么 datasource 变量值应更新为目标 datasource id
    而且 下游 query 变量应触发重查
    而且 panel 内容应同步更新

  场景: 会话内回显 datasource 变量
    假如 用户已在变量编辑弹窗内保存 datasource 变量 "ds"
    当 用户关闭并重新打开变量编辑弹窗
    那么 definition、regex、defaultValue、label 应正确回显
    而且 不点击仪表盘级保存时当前页面内变量栏和 panel 仍应按最新配置渲染

  场景: datasource feature 结束后清理环境
    假如 datasource.feature 中的所有场景已经执行完成
    当 测试准备结束该 feature
    那么 应删除 datasource.feature 创建的变量和文本卡片 panel
    而且 应清空相关变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理

  场景: datasource 独立场景执行后清理环境
    假如 datasource.feature 中前后两个场景没有共享上下文
    当 当前独立场景执行完成
    那么 应立即删除该场景创建的变量和文本卡片 panel
    而且 应立即清空该场景涉及变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理
