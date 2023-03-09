export const getRadialData = (
  data: {
    parent: string;
    child: string;
    callCount: number;
  }[],
) => {
  const nodes: { id: string; label: string }[] = [];
  const edges: { source: string; target: string; value: number }[] = [];
  const map = new Map();
  data.forEach((item) => {
    if (!map.has(item.parent)) {
      map.set(item.parent, true); // set any value to Map
      nodes.push({ id: item.parent, label: item.parent });
    }
    if (!map.has(item.child)) {
      map.set(item.child, true); // set any value to Map
      nodes.push({ id: item.child, label: item.child });
    }
    edges.push({ source: item.parent, target: item.child, value: item.callCount });
  });
  return {
    nodes,
    edges,
  };
};
