import _ from 'lodash';

export function listToTree2(data: { id: number; name: string }[]) {
  const result = _.reduce(
    data,
    (r, item) => {
      const keys = item.name.split('-');

      if (keys.length > 1) {
        const text = keys.pop();
        _.reduce(
          keys,
          (q, text) => {
            var temp = _.find(q, (o) => o.title === text && o.isLeaf !== true); // 2023-12-05 添加不能是叶子节点的判断，防止处理同名节点补的空格再次触发同名问题
            if (!temp) {
              q.push((temp = { id: item.id, key: `${item.id}_${text}`, originName: item.name, title: text, selectable: false, children: [] }));
            }
            return temp.children;
          },
          r,
        ).push({ id: item.id, key: item.id, originName: item.name, title: text + ' ', isLeaf: true });
      } else {
        r.push({
          id: item.id,
          key: item.id,
          title: item.name + ' ', // 防止节点跟组名称重复 antd tree 不会渲染同名节点问题
          originName: item.name,
          isLeaf: true,
        });
      }
      return r;
    },
    [] as any[],
  );
  return result;
}

export function getCollapsedKeys(treeData: any[], collapsedKeys: string[], curBusiId?: number) {
  if (curBusiId) {
    let curBusiIdPath: string[] = [];
    const traverse = (data: any[], parentNode?: any) => {
      let flag = false;
      _.forEach(data, (item) => {
        if (item.key === curBusiId && parentNode) {
          curBusiIdPath.push(parentNode.key);
          flag = true;
          return false;
        }
        if (item.children) {
          if (traverse(item.children, item) && parentNode) {
            curBusiIdPath.push(parentNode.key);
            flag = true;
          }
        }
      });
      return flag;
    };
    traverse(treeData);
    if (!_.isEmpty(curBusiIdPath)) {
      return _.union(collapsedKeys, curBusiIdPath);
    }
  }
  return collapsedKeys;
}
