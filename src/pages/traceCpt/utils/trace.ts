import { TraceResponse, TraceSpanData } from '../type';
import TreeNode from './TreeNode';

export const TREE_ROOT_ID = '__root__';

export function getTraceSpanIdsAsTree(trace: TraceResponse) {
  const nodesById = new Map(trace.spans.map((span: TraceSpanData) => [span.spanID, new TreeNode(span.spanID)]));
  const spansById = new Map(trace.spans.map((span: TraceSpanData) => [span.spanID, span]));
  const root = new TreeNode(TREE_ROOT_ID);
  trace.spans.forEach((span: TraceSpanData) => {
    const node = nodesById.get(span.spanID)!;
    if (Array.isArray(span.references) && span.references.length) {
      const { refType, spanID: parentID } = span.references[0];
      if (refType === 'CHILD_OF' || refType === 'FOLLOWS_FROM') {
        const parent = nodesById.get(parentID) || root;
        parent.children?.push(node);
      } else {
        throw new Error(`Unrecognized ref type: ${refType}`);
      }
    } else {
      root.children.push(node);
    }
  });
  const comparator = (nodeA: TreeNode | undefined, nodeB: TreeNode | undefined) => {
    const a: TraceSpanData | undefined = nodeA?.value ? spansById.get(nodeA.value.toString()) : undefined;
    const b: TraceSpanData | undefined = nodeB?.value ? spansById.get(nodeB.value.toString()) : undefined;
    return +(a?.startTime! > b?.startTime!) || +(a?.startTime === b?.startTime) - 1;
  };
  trace.spans.forEach((span: TraceSpanData) => {
    const node: TreeNode | undefined = nodesById.get(span.spanID);
    if (node!.children.length > 1) {
      node?.children.sort(comparator);
    }
  });
  root.children.sort(comparator);
  return root;
}
