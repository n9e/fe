# language: zh-CN

功能: textbox 变量 E2E 模板
  为了验证 textbox 变量在当前会话内的编辑、渲染和交互行为
  需要覆盖默认值、别名显示、panel 替换和清空路径

  背景:
    假如 变量类型是 "textbox"
    而且 使用全局默认测试上下文
    而且 使用默认 dashboard 页面
    而且 测试应基于真实页面交互完成
    而且 变量名称 name 是 "<textbox_name>"
    而且 变量别名 label 是 "<textbox_label>"
    而且 文本卡片 panel 内容模板是 "textbox=${<textbox_name>}"

  场景大纲: 编辑 textbox 变量
    假如 用户打开“添加变量”弹窗
    当 用户输入变量名称 "<textbox_name>"
    并且 用户输入变量别名 "<textbox_label>"
    并且 “默认值” 输入框默认值为空
    并且 用户在 “默认值” 输入框中输入 "<textbox_default_value>"
    并且 用户在变量编辑弹窗内点击“保存”
    那么 重新打开变量编辑弹窗时 “默认值” 应为 "<textbox_default_value>"
    而且 重新打开变量编辑弹窗时 “变量别名” 应为 "<textbox_label>"

    例子:
      | textbox_name | textbox_label | textbox_default_value |
      | textbox_01 | 文本框 | textbox_value_01 |

  场景大纲: 渲染 textbox 变量和文本卡片 panel
    假如 当前会话中已创建 textbox 变量 "<textbox_name>"
    而且 其变量别名是 "<textbox_label>"
    而且 其默认值是 "<textbox_default_value>"
    而且 已创建一个“文本卡片” panel 且内容为 "textbox=${<textbox_name>}"
    当 页面完成渲染
    那么 界面上应存在一个显示名为 "<textbox_label>" 的文本输入框
    而且 文本输入框的值应为 "<textbox_default_value>"
    而且 panel 应渲染为 "textbox=<textbox_default_value>"
    但是 panel 中变量引用必须使用 ${<textbox_name>}

    例子:
      | textbox_name | textbox_label | textbox_default_value |
      | textbox_01 | 文本框 | textbox_value_01 |

  场景大纲: 交互修改 textbox 变量
    假如 页面已渲染 textbox 变量 "<textbox_name>"
    而且 已创建一个“文本卡片” panel 且内容为 "textbox=${<textbox_name>}"
    当 用户输入 "<input_value>"
    并且 用户通过 "<submit_mode>" 提交该值
    那么 textbox 变量值应更新为 "<expected_value>"
    而且 panel 内容应更新为 "textbox=<expected_value>"

    例子:
      | textbox_name | input_value | submit_mode | expected_value |
      | textbox_01 | textbox_value_02 | 失焦 | textbox_value_02 |
      | textbox_01 | textbox_value_03 | 回车 | textbox_value_03 |

  场景: 清空 textbox 变量
    假如 页面已渲染 textbox 变量 "textbox_01"
    而且 已创建一个“文本卡片” panel 且内容为 "textbox=${textbox_01}"
    当 用户清空文本输入框
    那么 textbox 变量值应为空字符串
    而且 panel 内容应更新为 "textbox="

  场景: 会话内回显 textbox 变量
    假如 用户已在变量编辑弹窗内保存 textbox 变量 "textbox_01"
    当 用户关闭并重新打开变量编辑弹窗
    那么 defaultValue 和 label 应正确回显
    而且 不点击仪表盘级保存时当前页面内变量栏和 panel 仍应按最新配置渲染

  场景: textbox feature 结束后清理环境
    假如 textbox.feature 中的所有场景已经执行完成
    当 测试准备结束该 feature
    那么 应删除 textbox.feature 创建的变量和文本卡片 panel
    而且 应清空相关变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理

  场景: textbox 独立场景执行后清理环境
    假如 textbox.feature 中前后两个场景没有共享上下文
    当 当前独立场景执行完成
    那么 应立即删除该场景创建的变量和文本卡片 panel
    而且 应立即清空该场景涉及变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理
