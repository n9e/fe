# language: zh-CN

功能: hostIdent 变量 E2E 模板
  为了验证 hostIdent 变量的监控对象列表、正则过滤和访问限制
  需要覆盖编辑、渲染、交互、异常路径和会话内回显

  背景:
    假如 变量类型是 "hostIdent"
    而且 使用全局默认测试上下文
    而且 使用默认 dashboard 页面
    而且 测试应基于真实页面交互完成
    而且 host ident 候选项应来自真实接口和真实页面数据
    而且 文本卡片 panel 使用 ${name} 引用变量

  场景大纲: 编辑 hostIdent 变量
    假如 目标业务组下存在真实监控对象列表数据
    当 用户输入变量名称 "<host_name>"
    并且 用户输入变量别名 "<host_label>"
    并且 用户输入正则过滤 "<host_regex>"
    并且 用户将 “多选” 设置为 "<multi>"
    并且 用户将 “包含全选” 设置为 "<allOption>"
    并且 用户在变量编辑弹窗内点击“保存”
    那么 预览区应展示监控对象 ident 列表
    而且 预览区应只展示匹配 "<host_regex>" 的项
    而且 再次打开编辑弹窗时 reg、multi、allOption、label 应正确回显

    例子:
      | host_name | host_label | host_regex | multi | allOption |
      | host | 主机 | /host.*/ | false | false |
      | host_multi | 主机多选 | /host.*/ | true | true |

  场景: 渲染 hostIdent 变量和文本卡片 panel
    假如 当前会话中已创建 hostIdent 变量 "host"
    而且 已创建一个“文本卡片” panel 且内容为 "host=${host}"
    当 页面完成渲染
    那么 页面上应展示 host ident 变量选择器
    而且 候选项应与监控对象 ident 列表一致
    而且 panel 中应显示当前 ident

  场景: 交互 hostIdent 变量
    假如 页面已渲染 hostIdent 变量 "host"
    而且 已创建一个“文本卡片” panel 且内容为 "host=${host}"
    当 用户选择 ident
    那么 单选模式下值应正确更新
    而且 多选模式下选择多个 ident 后值应为数组
    而且 每次交互后 panel 内容都应同步更新

  场景: 获取监控对象失败
    假如 获取监控对象接口返回失败
    当 页面尝试渲染 hostIdent 变量
    那么 页面应展示错误信息或空候选项状态

  场景: 匿名访问受限
    假如 仪表盘处于匿名访问受限场景
    当 用户打开 hostIdent 变量编辑弹窗
    那么 页面应展示对应告警
    而且 应限制保存

  场景: 会话内回显 hostIdent 变量
    假如 用户已在变量编辑弹窗内保存 hostIdent 变量 "host"
    当 用户关闭并重新打开变量编辑弹窗
    那么 reg、multi、allOption、label 应正确回显
    而且 不点击仪表盘级保存时当前页面内变量栏和 panel 仍应按最新配置渲染

  场景: hostIdent feature 结束后清理环境
    假如 host-ident.feature 中的所有场景已经执行完成
    当 测试准备结束该 feature
    那么 应删除 host-ident.feature 创建的变量和文本卡片 panel
    而且 应清空相关变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理

  场景: hostIdent 独立场景执行后清理环境
    假如 host-ident.feature 中前后两个场景没有共享上下文
    当 当前独立场景执行完成
    那么 应立即删除该场景创建的变量和文本卡片 panel
    而且 应立即清空该场景涉及变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理
