# language: zh-CN

功能: datasourceIdentifier 变量 E2E 模板
  为了验证 datasourceIdentifier 变量基于 identifier 的过滤和取值
  需要覆盖编辑、渲染、交互和会话内回显

  背景:
    假如 变量类型是 "datasourceIdentifier"
    而且 使用全局默认测试上下文
    而且 使用默认 dashboard 页面
    而且 测试应基于真实页面交互完成
    而且 datasource identifier 候选项应来自真实接口和真实页面数据
    而且 文本卡片 panel 使用 ${name} 引用变量

  场景大纲: 编辑 datasourceIdentifier 变量
    假如 用户打开“添加变量”弹窗
    当 用户输入变量名称 "<var_name>"
    并且 用户输入变量别名 "<var_label>"
    并且 用户选择数据源类型 "<datasource_cate>"
    并且 用户输入 “数据源过滤” "<regex>"
    并且 用户选择默认 identifier "<default_identifier>"
    并且 用户在变量编辑弹窗内点击“保存”
    那么 预览区应展示 identifier 列表
    而且 预览区应只保留匹配 identifier 的候选项
    而且 再次打开编辑弹窗时 definition、regex、defaultValue、label 应正确回显

    例子:
      | var_name | var_label | datasource_cate | regex | default_identifier |
      | ds_identifier | 数据源标识 | prometheus | /vm/ | vm-01 |

  场景: 渲染 datasourceIdentifier 变量和文本卡片 panel
    假如 当前会话中已创建 datasourceIdentifier 变量 "ds_identifier"
    而且 已创建一个“文本卡片” panel 且内容为 "ds_identifier=${ds_identifier}"
    当 页面完成渲染
    那么 页面上应展示 datasource identifier 选择器
    而且 候选项值应为 identifier 而不是 datasource id
    而且 panel 中应显示当前 identifier

  场景: 交互 datasourceIdentifier 变量
    假如 页面已渲染 datasourceIdentifier 变量 "ds_identifier"
    而且 已创建一个“文本卡片” panel 且内容为 "ds_identifier=${ds_identifier}"
    当 用户修改选中项
    那么 变量值应更新为目标 identifier
    而且 panel 内容应同步更新

  场景: 会话内回显 datasourceIdentifier 变量
    假如 用户已在变量编辑弹窗内保存 datasourceIdentifier 变量 "ds_identifier"
    当 用户关闭并重新打开变量编辑弹窗
    那么 definition、regex、defaultValue、label 应正确回显
    而且 不点击仪表盘级保存时当前页面内变量栏和 panel 仍应按最新配置渲染

  场景: datasourceIdentifier feature 结束后清理环境
    假如 datasource-identifier.feature 中的所有场景已经执行完成
    当 测试准备结束该 feature
    那么 应删除 datasource-identifier.feature 创建的变量和文本卡片 panel
    而且 应清空相关变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理

  场景: datasourceIdentifier 独立场景执行后清理环境
    假如 datasource-identifier.feature 中前后两个场景没有共享上下文
    当 当前独立场景执行完成
    那么 应立即删除该场景创建的变量和文本卡片 panel
    而且 应立即清空该场景涉及变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理
