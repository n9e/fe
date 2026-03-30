# language: zh-CN

功能: query 变量 E2E 模板
  为了验证 query 变量在 Prometheus 数据源和变量依赖关系下的真实行为
  需要覆盖编辑、渲染、交互、依赖联动和会话内回显

  背景:
    假如 变量类型是 "query"
    而且 使用全局默认测试上下文
    而且 使用默认 dashboard 页面
    而且 如未单独说明则使用推荐 Query 命名约定
    而且 测试应基于真实页面交互完成
    而且 文本卡片 panel 使用 ${name} 引用变量
    而且 Query 测试当前只重点覆盖 "Prometheus"
    而且 使用默认 Query Prometheus 测试上下文
    而且 Query 依赖测试数据应通过默认 Prometheus series 接口组织

  场景大纲: 编辑 query 变量
    假如 用户打开“添加变量”弹窗
    当 用户输入变量名称 "<query_name>"
    并且 用户输入变量别名 "<query_label>"
    并且 用户选择数据源类型 "<datasource_type>"
    并且 用户选择数据源值 "<datasource_value>"
    并且 用户输入查询表达式 "<query_definition>"
    并且 用户输入正则过滤 "<query_regex>"
    并且 用户将 “多选” 设置为 "<multi>"
    并且 用户将 “包含全选” 设置为 "<allOption>"
    并且 用户输入 “自定义全选值” "<allValue>"
    并且 用户在变量编辑弹窗内点击“预览”
    并且 用户在变量编辑弹窗内点击“保存”
    那么 预览区候选项应来自真实数据源返回
    而且 若默认 Prometheus 数据源在当前环境不存在则该场景不应强行生成用例
    而且 预览区应返回候选项
    而且 再次打开编辑弹窗时 datasource、definition、reg、multi、allOption、allValue、label 应正确回显

    例子:
      | query_name | query_label | datasource_type | datasource_value | query_definition | query_regex | multi | allOption | allValue |
      | 推荐 Query 下游变量名称 | 推荐 Query 下游变量别名 | Prometheus | 默认 Query Prometheus 数据源 ID | 基于默认 dashboard 页面真实可执行的 PromQL 变量表达式 | /i-.*/ | false | false | N/A |

  场景大纲: 渲染 query 变量和文本卡片 panel
    假如 当前会话中已创建 query 变量 "<query_name>"
    而且 其数据源类型为 "<datasource_type>"
    而且 已创建一个“文本卡片” panel 且内容为 "<panel_content>"
    当 页面完成渲染
    那么 页面上应展示名为 "<query_label>" 的选择器
    而且 候选项应与查询结果一致
    而且 默认值应正确回填
    而且 panel 中应显示通过 ${<query_name>} 替换后的结果
    但是 即使变量栏显示别名 "<query_label>" 也必须通过 ${<query_name>} 取值

    例子:
      | query_name | query_label | datasource_type | panel_content |
      | 推荐 Query 下游变量名称 | 推荐 Query 下游变量别名 | Prometheus | 使用推荐 Query 下游变量 panel 模板 |

  场景大纲: 交互 query 变量
    假如 页面已渲染 query 变量 "<query_name>"
    而且 已创建一个“文本卡片” panel 且内容为 "<panel_content>"
    当 用户选择 "<selected_value>"
    那么 变量值应更新为 "<expected_value>"
    而且 panel 内容应更新为 "<expected_panel_content>"

    例子:
      | query_name | panel_content | selected_value | expected_value | expected_panel_content |
      | 推荐 Query 下游变量名称 | 使用推荐 Query 下游变量 panel 模板 | 从真实 series 提取的候选值 A | 从真实 series 提取的候选值 A | panel 应展示该候选值的替换结果 |

  场景大纲: 多选 query 变量
    假如 页面已渲染多选 query 变量 "<query_name>"
    而且 已创建一个“文本卡片” panel 且内容为 "<panel_content>"
    当 用户依次选择 "<selected_values>"
    那么 变量值应为数组
    而且 panel 内容应展示多值替换结果
    当 用户清空当前选择
    那么 变量值应为 "<empty_state>"
    而且 panel 内容应同步更新为空态结果

    例子:
      | query_name | panel_content | selected_values | empty_state |
      | 推荐 Query 下游变量名称 | 使用推荐 Query 下游变量 panel 模板 | 从真实 series 提取的多个候选值 | [] |

  场景: Prometheus 单选依赖单选
    假如 已创建推荐 Query 上游变量名称且为单选
    而且 推荐 Query 上游变量的候选值至少包含“上游候选值 A”和“上游候选值 B”
    而且 已创建推荐 Query 下游变量名称对应的 query 变量
    而且 下游 query 变量的数据源类型为 "Prometheus"
    而且 下游 query 变量的查询表达式依赖推荐 Query 上游变量名称
    而且 默认 dashboard 页面的真实 series 数据中“上游候选值 A”和“上游候选值 B”对应不同的下游候选集合
    而且 已创建一个“文本卡片” panel 且内容为推荐 Query 联动 panel 内容模板
    当 页面首次渲染
    那么 下游候选项应与“上游候选值 A”对应的数据一致
    而且 panel 中应显示“上游候选值 A”
    当 用户将推荐 Query 上游变量名称从“上游候选值 A”切换到“上游候选值 B”
    那么 下游候选项应刷新为“上游候选值 B”对应集合
    而且 如果旧值不再存在则下游变量应回退到新的默认值
    而且 panel 内容应更新为联动后的真实替换结果

  场景: Prometheus 单选依赖多选
    假如 已创建单选的推荐 Query 上游变量名称
    而且 已创建多选的推荐 Query 下游变量名称
    而且 推荐 Query 下游变量名称支持全选
    而且 推荐 Query 下游变量名称的查询表达式依赖推荐 Query 上游变量名称
    而且 已创建一个“文本卡片” panel 且内容为推荐 Query 联动 panel 内容模板
    当 用户在推荐 Query 下游变量名称中选择多个值
    那么 推荐 Query 下游变量名称的值应为数组
    而且 panel 应展示多值替换结果
    当 用户切换推荐 Query 上游变量名称
    那么 推荐 Query 下游变量名称的候选项应刷新
    而且 如果原多选值部分或全部失效应验证下游值的重置或回退逻辑
    当 用户选择 "All"
    那么 panel 中的结果应符合全选语义

  场景: Prometheus 多选依赖查询
    假如 已创建多选的推荐 Query 上游变量名称
    而且 推荐 Query 上游变量的候选值至少包含“上游候选值 A”和“上游候选值 B”
    而且 已创建推荐 Query 下游变量名称对应的 query 变量
    而且 推荐 Query 下游变量名称的查询表达式依赖推荐 Query 上游变量名称
    而且 已创建一个“文本卡片” panel 且内容为推荐 Query 联动 panel 内容模板
    当 用户将推荐 Query 上游变量名称选为多个值
    那么 推荐 Query 下游变量名称的候选项应根据多值条件刷新
    当 用户移除部分上游值或清空全部上游值
    那么 推荐 Query 下游变量名称的候选项和当前值应按预期更新
    而且 panel 中应显示多选上游变量参与替换后的结果

  场景: 通过真实 Prometheus series 组织依赖测试数据
    假如 使用默认 Query Prometheus 数据源 ID 请求 Prometheus series 接口
    而且 请求路径为默认 Query Prometheus series 接口
    而且 查询指标为默认 Query Prometheus 指标
    当 接口返回真实 series 数据
    那么 测试应从 series 中提取可区分的上游变量值和下游变量候选值
    而且 若未获取到可用 series 数据则测试应立即报错终止
    而且 不应继续生成伪造的依赖联动场景

  场景: 会话内回显 query 变量
    假如 用户已在变量编辑弹窗内保存 query 变量
    当 用户关闭并重新打开变量编辑弹窗
    那么 datasource、definition、reg、multi、allOption、allValue、label 应正确回显
    而且 不点击仪表盘级保存时当前页面内 query 变量和 panel 仍应按最新配置渲染

  场景: query feature 结束后清理环境
    假如 query.feature 中的所有场景已经执行完成
    当 测试准备结束该 feature
    那么 应删除 query.feature 创建的变量和文本卡片 panel
    而且 应清空相关变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理

  场景: query 独立场景执行后清理环境
    假如 query.feature 中前后两个场景没有共享上下文
    当 当前独立场景执行完成
    那么 应立即删除该场景创建的变量和文本卡片 panel
    而且 应立即清空该场景涉及变量的 localStorage
    而且 应按默认 localStorage 清理规则逐个清理
