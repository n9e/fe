import _ from 'lodash';

/** 处理器的类型字段：兼容后端返回的 typ 与旧数据里的 type */
export const getProcessorType = (processor: any): string | undefined => processor?.typ ?? processor?.type;

/**
 * 这条工作流是否跑得起来：至少有一个处理器，且每个都选了类型。
 *
 * 类型为空时前后端都不会自然拦下来——后端 Verify() 只校验 name / team_ids，
 * 落库后派生出 Type 为空的节点，执行时 GetProcessorByType("") 返回 not found，
 * 该节点被标记为 failed。结果是工作流静默不生效，且每来一个匹配事件就写一条
 * status=failed 的执行记录。所以保存前必须由调用方挡住。
 */
export function hasRunnableProcessors(processors?: any[]): boolean {
  return !_.isEmpty(processors) && _.every(processors, (processor) => !!getProcessorType(processor));
}
