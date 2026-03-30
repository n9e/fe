# language: zh-CN

功能: custom 变量 E2E 模板
  为了验证 custom 变量的候选项、单多选、全选和 panel 替换行为
  需要覆盖编辑、渲染、交互和会话内回显

  背景:
    假如 变量类型是 "custom"
    而且 使用全局默认测试上下文
    而且 使用默认 dashboard 页面
    而且 测试应基于真实页面交互完成
    而且 文本卡片 panel 使用 ${name} 引用变量

  场景大纲: 编辑 custom 变量
    假如 用户打开“添加变量”弹窗
    当 用户输入变量名称 "<custom_name>"
    并且 用户输入变量别名 "<custom_label>"
    并且 用户在 “可选项” 输入框中输入 "<definition>"
    并且 用户将 “多选” 设置为 "<multi>"
    并且 用户将 “包含全选” 设置为 "<allOption>"
    并且 用户输入 “自定义全选值” "<allValue>"
    并且 用户在变量编辑弹窗内点击“保存”
    那么 预览区应展示 "<definition>" 对应的候选项
    而且 再次打开编辑弹窗时 definition、multi、allOption、allValue、label 应正确回显

    例子:
      | custom_name | custom_label | definition | multi | allOption | allValue |
      | region | 地域 | bj, sh, gz | false | false | N/A |
      | env | 环境 | dev, prod | true | true | .* |

  场景大纲: 渲染 custom 变量和文本卡片 panel
    假如 当前会话中已创建 custom 变量 "<custom_name>"
    而且 已创建一个“文本卡片” panel 且内容为 "custom=${<custom_name>}"
    当 页面完成渲染
    那么 页面上应展示名为 "<custom_label>" 的下拉选择器
    而且 候选项应包含 "<option_a>"、"<option_b>"、"<option_c>"
    而且 如果开启全选则应展示 "All" 选项
    而且 panel 中应展示当前变量值

    例子:
      | custom_name | custom_label | option_a | option_b | option_c |
      | region | 地域 | bj | sh | gz |

  场景大纲: 单选模式交互 custom 变量
    假如 页面已渲染单选 custom 变量 "<custom_name>"
    而且 已创建一个“文本卡片” panel 且内容为 "custom=${<custom_name>}"
    当 用户选择 "<selected_value>"
    那么 变量值应更新为 "<selected_value>"
    而且 panel 内容应更新为 "custom=<selected_value>"

    例子:
      | custom_name | selected_value |
      | region | bj |

  场景大纲: 多选模式交互 custom 变量
    假如 页面已渲染多选 custom 变量 "<custom_name>"
    而且 已创建一个“文本卡片” panel 且内容为 "custom=${<custom_name>}"
    当 用户依次选择 "<selected_values>"
    那么 变量值应为数组
    而且 panel 内容应展示多值替换结果

    例子:
      | custom_name | selected_values |
      | env | dev,prod |

  场景: 全选与普通选项互斥
    假如 页面已渲染支持全选的 custom 变量 "env"
    当 用户选择 "All"
    那么 变量值中应仅保留 "all"
    而且 其他已选项应被清空
    而且 panel 内容应符合全选语义

  场景: 清空 custom 变量
    假如 页面已渲染 custom 变量
    当 用户清空当前选择
    那么 单选模式下变量值应为空字符串
    而且 多选模式下变量值应为空数组
    而且 panel 内容应同步更新

  场景: 会话内回显 custom 变量
    假如 用户已在变量编辑弹窗内保存 custom 变量
    当 用户关闭并重新打开变量编辑弹窗
    那么 definition、multi、allOption、allValue、label 应正确回显
    而且 不点击仪表盘级保存时当前页面内变量栏和 panel 仍应按最新配置渲染

  场景: custom feature 结束后清理环境
    假如 custom.feature 中的所有场景已经执行完成
    当 测试准备结束该 feature
    那么 应删除 custom.feature 创建的变量和文本卡片 panel
    而且 应清空相关变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理

  场景: custom 独立场景执行后清理环境
    假如 custom.feature 中前后两个场景没有共享上下文
    当 当前独立场景执行完成
    那么 应立即删除该场景创建的变量和文本卡片 panel
    而且 应立即清空该场景涉及变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理
