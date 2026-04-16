---
name: cr-plus
description: 复用 cr 审查规则，并将审查范围限制到 src/plus
---

请先完整读取并严格遵循 [.github/prompts/cr.prompt.md](.github/prompts/cr.prompt.md) 的全部规则与输出格式。

在此基础上追加且仅追加以下约束：

1. `src/plus` 是独立子仓库，本次 code review 必须在该仓库上下文执行 git 命令（推荐统一使用 `git -C src/plus ...`，或先 `cd src/plus` 再执行）。
2. 基准分支解析、状态检查、diff 统计与 diff 明细都必须针对 `src/plus` 仓库执行，不要在根仓库用路径过滤替代。
3. 如 `src/plus` 仓库内无变更，按基准提示词里的“空 diff”规则输出积极总结，风险列表保持为空。
