# language: zh-CN

功能: constant 变量 E2E 模板
  为了验证 constant 变量的只读渲染和模板替换行为
  需要覆盖编辑、渲染、交互限制和会话内回显

  背景:
    假如 变量类型是 "constant"
    而且 使用全局默认测试上下文
    而且 使用默认 dashboard 页面
    而且 测试应基于真实页面交互完成
    而且 文本卡片 panel 使用 ${name} 引用变量

  场景大纲: 编辑 constant 变量
    假如 用户打开“添加变量”弹窗
    当 用户输入变量名称 "<constant_name>"
    并且 用户输入变量别名 "<constant_label>"
    并且 用户在 “常量值” 输入框中输入 "<constant_value>"
    并且 用户在变量编辑弹窗内点击“保存”
    那么 重新打开编辑弹窗时 “常量值” 应为 "<constant_value>"
    而且 重新打开编辑弹窗时 “变量别名” 应为 "<constant_label>"

    例子:
      | constant_name | constant_label | constant_value |
      | const_env | 常量环境 | prod |

  场景大纲: 渲染 constant 变量和文本卡片 panel
    假如 当前会话中已创建 constant 变量 "<constant_name>"
    而且 已创建一个“文本卡片” panel 且内容为 "const=${<constant_name>}"
    当 页面完成渲染
    那么 页面上应展示名为 "<constant_label>" 的只读输入框
    而且 输入框值应为 "<constant_value>"
    而且 panel 中应显示 "const=<constant_value>"

    例子:
      | constant_name | constant_label | constant_value |
      | const_env | 常量环境 | prod |

  场景: constant 变量不可编辑
    假如 页面已渲染 constant 变量 "const_env"
    当 用户尝试修改页面上的常量值
    那么 常量值应保持不变
    而且 panel 内容应保持与常量值一致

  场景: 会话内回显 constant 变量
    假如 用户已在变量编辑弹窗内保存 constant 变量 "const_env"
    当 用户关闭并重新打开变量编辑弹窗
    那么 definition 和 label 应正确回显
    而且 不点击仪表盘级保存时当前页面内只读输入框和 panel 仍应按最新配置渲染

  场景: constant feature 结束后清理环境
    假如 constant.feature 中的所有场景已经执行完成
    当 测试准备结束该 feature
    那么 应删除 constant.feature 创建的变量和文本卡片 panel
    而且 应清空相关变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理

  场景: constant 独立场景执行后清理环境
    假如 constant.feature 中前后两个场景没有共享上下文
    当 当前独立场景执行完成
    那么 应立即删除该场景创建的变量和文本卡片 panel
    而且 应立即清空该场景涉及变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理
