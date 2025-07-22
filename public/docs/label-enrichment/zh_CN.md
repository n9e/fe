## 数据标签丰富说明

标签丰富功能可基于 CloudWatch 指标中的资源标识字段，自动从标签词表（基于 AWS 资源标签构建）中提取业务标签（如环境、服务名），并补充到原始指标中，提升可读性与可筛选性。

---

### 数据样例

CloudWatch 数据查询结果中，部分时序指标自带资源标识字段，例如：

```json
{ "InstanceId": "i-009e2d6affd17d345", "Series": "CPUUtilization" }
```

与此同时，AWS 控制台中，该 EC2 实例（i-009e2d6affd17d345）在资源标签页配置了：

```
env = prod
name = nginx-service
```

这些标签会被系统提取并构建为标签词表，供标签丰富功能使用

---

### 配置说明

你可以配置某个字段（如 `InstanceId`）作为匹配键，系统将使用它在标签词表中查找对应资源的标签，并将选定标签添加到原始指标中。

例如：

- 标签词表来源：EC2 实例标签数据
- 匹配字段（源标签）：`InstanceId`
- 需要补充的标签：`env`, `name`

---

### 丰富结果

原始指标数据为：

```json
{
  "InstanceId": "i-009e2d6affd17d345",
  "Series": "CPUUtilization"
}
```

标签丰富后，变为：

```json
{
  "InstanceId": "i-009e2d6affd17d345",
  "Series": "CPUUtilization",
  "env": "prod",
  "name": "nginx-service"
}
```
