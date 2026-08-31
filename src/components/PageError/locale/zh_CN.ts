const zh_CN = {
  '401': { title: '登录已失效', desc: '登录状态已过期，请重新登录' },
  '403': {
    title: '无访问权限',
    desc: '您没有访问该页面的权限',
    desc_with_resource: '您没有访问「{{resource}}」的权限',
    contact_admin: '请联系管理员为你添加权限',
    contact_owners: '请联系 {{owners}} 为你添加权限',
  },
  '404': { title: '页面不存在', desc: '当前页面找不到了，可能已被删除或地址有误' },
  '500': { title: '服务开小差了', desc: '当前服务存在问题，请稍后重试' },
  action: { back: '返回上一页', home: '回首页', retry: '重试', login: '去登录' },
  diagnosis: {
    title: '诊断信息',
    copy: '复制诊断信息',
    status: '状态码',
    path: '访问路径',
    resource: '受限资源',
    required_perm: '所需权限',
    action: '触发操作',
    from: '来源页面',
    occurred_at: '发生时间',
  },
};
export default zh_CN;
