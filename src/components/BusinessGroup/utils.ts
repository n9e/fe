import _ from 'lodash';
import queryString from 'query-string';
import i18next from 'i18next';

interface TreeNode {
  id: number;
  key: string;
  originName: string;
  children?: TreeNode[];
}

export function getChildrenIds(node: TreeNode) {
  if (!node.children) return [node.id];
  return _.map(node.children, (item) => {
    if (item.children) {
      return getChildrenIds(item);
    }
    return item.id;
  });
}
export function normalizeTreeData(treeData: TreeNode[], level = 1) {
  return _.map(treeData, (node) => {
    if (node.children) {
      return {
        ...node,
        key: _.join(_.concat(_.fill(Array(level), 'group'), _.flattenDeep(getChildrenIds(node))), ','),
        children: normalizeTreeData(node.children, level + 1),
      };
    }
    return {
      ...node,
      key: _.toString(node.id),
    };
  });
}

export function listToTree(data: { id: number; name: string }[], separator = '-') {
  const result = _.reduce(
    data,
    (r, item) => {
      const keys = item.name.split(separator);

      if (keys.length > 1) {
        const text = keys.pop();
        _.reduce(
          keys,
          (q, text) => {
            var temp = _.find(q, (o) => o.title === text && o.isLeaf !== true); // 2023-12-05 添加不能是叶子节点的判断，防止处理同名节点补的空格再次触发同名问题
            if (!temp) {
              q.push((temp = { id: item.id, key: `${item.id}_${text}`, title: text, selectable: true, children: [] }));
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
  return normalizeTreeData(result);
}

export function getCollapsedKeys(treeData: any[], collapsedKeys: string[], businessGroupIds?: string) {
  if (businessGroupIds) {
    let curBusiIdPath: string[] = [];
    const traverse = (data: any[], parentNode?: any) => {
      let flag = false;
      _.forEach(data, (item) => {
        if (item.key === businessGroupIds && parentNode) {
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

export function getCleanBusinessGroupIds(businessGroupIds?: string) {
  if (!businessGroupIds) return undefined;
  return _.replace(businessGroupIds, /group,/, '');
}

export function getDefaultBusinessGroupKey() {
  const { ids: defaultBusinessGroupIds, isLeaf: defaultBusinessGroupIsLeaf } = queryString.parse(window.location.search);
  const defaultBusinessGroupKey =
    (defaultBusinessGroupIds && (defaultBusinessGroupIsLeaf === 'true' ? (defaultBusinessGroupIds as string) : `group,${defaultBusinessGroupIds}`)) ||
    window.localStorage.getItem('businessGroupKey') ||
    undefined;
  return defaultBusinessGroupKey;
}

export function getDefaultBusiness(busiGroups) {
  let defaultBusinessGroupKey = getDefaultBusinessGroupKey();
  let ids = getCleanBusinessGroupIds(defaultBusinessGroupKey);
  let idsArr = _.map(_.compact(_.split(ids, ',')), _.toNumber);
  const isValid = !_.isEmpty(idsArr)
    ? _.every(idsArr, (id) => {
        if (!_.find(busiGroups, { id })) {
          window.localStorage.removeItem('businessGroupKey');
          return false;
        }
        return true;
      })
    : false;
  // 缓存的节点信息无效时，取第一个节点
  if (!isValid) {
    defaultBusinessGroupKey = busiGroups?.[0]?.id;
    ids = getCleanBusinessGroupIds(defaultBusinessGroupKey);
    idsArr = _.map(_.compact(_.split(ids, ',')), _.toNumber);
  }
  if (defaultBusinessGroupKey) {
    window.localStorage.setItem('businessGroupKey', defaultBusinessGroupKey);
    return {
      key: _.toString(defaultBusinessGroupKey),
      ids,
      id: _.map(_.split(ids, ','), _.toNumber)?.[0],
      isLeaf: !_.startsWith(defaultBusinessGroupKey, 'group,'),
    };
  }
  return {};
}

/**
 * 获取业务组可选项
 * 1. 如果我的业务组和全部业务组一样，则只返回所有业务组
 * 2. 如果我的业务组为空，则只返回所有业务组
 * 3. 否则返回我的业务组和所有业务组，所有业务组排除我的业务组
 * @param myBusiGroups
 * @param allBusiGroups
 */
export const getBusinessGroupsOptions = (myBusiGroups, allBusiGroups) => {
  if (_.isEqual(_.sortBy(myBusiGroups, 'id'), _.sortBy(allBusiGroups, 'id'))) {
    return [
      {
        label: i18next.t('common:my_business_group'),
        options: _.map(myBusiGroups, (item) => {
          return { label: item.name, value: item.id };
        }),
      },
    ];
  }
  if (_.isEmpty(myBusiGroups)) {
    return [
      {
        label: i18next.t('common:all_business_group'),
        options: _.map(allBusiGroups, (item) => {
          return { label: item.name, value: item.id };
        }),
      },
    ];
  }
  return [
    {
      label: i18next.t('common:my_business_group'),
      options: _.map(myBusiGroups, (item) => {
        return { label: item.name, value: item.id };
      }),
    },
    {
      label: i18next.t('common:all_business_group'),
      options: _.map(_.differenceBy(allBusiGroups, myBusiGroups, 'id') as any, (item) => {
        return { label: item.name, value: item.id };
      }),
    },
  ];
};
