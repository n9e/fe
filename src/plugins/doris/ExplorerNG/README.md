# Doris 日志检索

本目录实现 `/log/explorer` 的 Doris 数据源适配。页面支持 Query 和 SQL 两种模式。[页面入口](index.tsx)管理检索状态和筛选条件，[主区域](Main/index.tsx)根据模式展示输入控件和结果。

| 模块                               | 职责                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| [字段侧栏](SideBarNav/index.tsx)   | 选择数据库、表和时间字段，加载可用字段与表配置。                                             |
| [Query 模式](Main/Query/index.tsx) | 按关键词及字段条件检索，展示日志列表、高亮和趋势图，处理分页与日志上下文。                   |
| [SQL 模式](Main/SQL/index.tsx)     | 执行 SQL，以表格或时序图展示结果。[查询工作区](useQueryWorkspace.ts)负责从辅助表单生成 SQL。 |
| [Doris 接口](../services.ts)       | 封装字段发现、日志查询、直方图、上下文和 SQL 等请求。                                        |

## 专题文档

- [VARIANT 划词与高亮](variant-selection-highlighting.md)记录接口数据结构、字段拍平、路径定位和回归步骤。
