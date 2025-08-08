# GroupToNestedTableTransformation

## 概述

`GroupToNestedTableTransformation` 是一个数据转换器，用于将表格数据按指定字段进行分组，并对其他字段应用聚合函数。该转换器参考了 Grafana 的 "Group to nested tables" 功能，支持灵活的分组和多种聚合计算。

## 功能特性

- **多字段分组**：支持按一个或多个字段进行数据分组
- **多种聚合函数**：支持 sum、avg、count、max、min、last、variance、stdDev 等聚合计算
- **灵活配置**：每个字段可以独立配置为分组字段或聚合字段
- **多聚合支持**：单个字段可以同时应用多种聚合函数
- **类型安全**：完整的 TypeScript 类型支持

## 配置接口

```typescript
export interface GroupToNestedTableOptions {
  fields: {
    [fieldName: string]: {
      aggregations: (keyof NonNullable<TableData['fields'][0]['state']['calcs']>)[]; // 聚合函数列表
      operation: 'aggregate' | 'groupby';
    };
  }[];
}
```

### 参数说明

- `fields`: 字段配置数组，每个元素包含一个字段的配置
  - `fieldName`: 要处理的字段名称
  - `operation`: 操作类型
    - `'groupby'`: 用于分组的字段
    - `'aggregate'`: 需要进行聚合计算的字段
  - `aggregations`: 聚合函数列表（仅对 `aggregate` 类型字段有效）
    - `'sum'`: 求和
    - `'avg'`: 平均值
    - `'count'`: 计数
    - `'max'`: 最大值
    - `'min'`: 最小值
    - `'last'`: 最后一个值
    - `'variance'`: 方差
    - `'stdDev'`: 标准差

## 使用示例

### 基本分组示例

```typescript
import GroupToNestedTableTransformation, { GroupToNestedTableOptions } from './GroupToNestedTableTransformation';

// 配置：按服务器分组，计算CPU使用率的平均值和最大值
const options: GroupToNestedTableOptions = {
  fields: [
    {
      server: {
        operation: 'groupby',
        aggregations: [],
      },
    },
    {
      cpu_usage: {
        operation: 'aggregate',
        aggregations: ['avg', 'max'],
      },
    },
  ],
};

const transformation = new GroupToNestedTableTransformation(options);
const result = transformation.apply([tableData]);
```

### 多字段分组示例

```typescript
// 配置：按服务器和区域分组，计算多个指标
const options: GroupToNestedTableOptions = {
  fields: [
    {
      server: {
        operation: 'groupby',
        aggregations: [],
      },
    },
    {
      region: {
        operation: 'groupby',
        aggregations: [],
      },
    },
    {
      cpu_usage: {
        operation: 'aggregate',
        aggregations: ['avg', 'max', 'min'],
      },
    },
    {
      memory_usage: {
        operation: 'aggregate',
        aggregations: ['last', 'avg'],
      },
    },
    {
      request_count: {
        operation: 'aggregate',
        aggregations: ['sum', 'count'],
      },
    },
  ],
};
```

## 输入输出示例

### 输入数据

```typescript
const inputData: TableData = {
  refId: 'A',
  fields: [
    {
      name: 'time',
      type: 'time',
      values: [1609459200000, 1609459260000, 1609459320000, 1609459380000],
      state: {},
    },
    {
      name: 'server',
      type: 'string',
      values: ['server1', 'server2', 'server1', 'server2'],
      state: {},
    },
    {
      name: 'cpu_usage',
      type: 'number',
      values: [80, 75, 85, 70],
      state: {},
    },
    {
      name: 'memory_usage',
      type: 'number',
      values: [60, 55, 65, 50],
      state: {},
    },
  ],
};
```

### 输出数据

使用上面的基本分组配置，输出结果为：

```typescript
{
  refId: 'A',
  fields: [
    {
      name: 'server',
      type: 'string',
      values: ['server1', 'server2'],  // 分组字段
      state: {}
    },
    {
      name: 'cpu_usage (avg)',
      type: 'number',
      values: [82.5, 72.5],  // server1: (80+85)/2=82.5, server2: (75+70)/2=72.5
      state: {
        displayName: 'cpu_usage (avg)'
      }
    },
    {
      name: 'cpu_usage (max)',
      type: 'number',
      values: [85, 75],  // server1: max(80,85)=85, server2: max(75,70)=75
      state: {
        displayName: 'cpu_usage (max)'
      }
    }
  ]
}
```

## 工作原理

1. **字段分类**：根据配置将字段分为分组字段和聚合字段
2. **数据分组**：使用分组字段的值组合作为分组键，将数据行分组
3. **聚合计算**：对每个分组内的聚合字段应用指定的聚合函数
4. **结果构建**：构建新的表格数据，包含分组字段和聚合结果字段

## 注意事项

1. **必须指定分组字段**：至少需要一个 `operation: 'groupby'` 的字段
2. **空值处理**：聚合计算会自动过滤掉 null 和 undefined 值
3. **字段存在性**：如果指定的字段在数据中不存在，会被忽略
4. **类型保持**：聚合字段会保持原有的数据类型
5. **显示名称**：聚合字段会自动生成包含聚合函数名的显示名称

## 错误处理

- 如果没有配置任何字段，返回原始数据
- 如果没有有效的分组字段，返回原始数据
- 如果指定的字段不存在，会被跳过
- 聚合计算遇到空数组时返回 null

## 性能考虑

- 分组操作的时间复杂度为 O(n)，其中 n 是数据行数
- 聚合计算的复杂度取决于聚合函数的类型
- 建议在大数据集上使用时考虑数据量和聚合函数的选择

## 集成使用

该转换器已集成到转换器映射中，可以通过以下方式使用：

```typescript
import { transformationsMap } from '../transformations';

// 通过映射获取
const TransformationClass = transformationsMap['groupToNestedTable'];
const transformation = new TransformationClass(options);

// 或者直接导入
import GroupToNestedTableTransformation from './GroupToNestedTableTransformation';
const transformation = new GroupToNestedTableTransformation(options);
```
