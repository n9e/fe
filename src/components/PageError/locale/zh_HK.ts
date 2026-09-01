const zh_HK = {
  '403': {
    title: '無存取權限',
    desc: '您沒有存取該頁面的權限',
    desc_with_resource: '您沒有存取「{{resource}}」的權限',
    contact_admin: '請聯絡管理員為你新增權限',
    contact_owners: '請聯絡 {{owners}} 為你新增權限',
    owners_more: ' 等 {{count}} 人',
  },
  '404': { title: '頁面不存在', desc: '當前頁面找不到了，可能已被刪除或網址有誤' },
  '500': { title: '服務出了點問題', desc: '當前服務存在問題，請稍後重試' },
  action: { back: '返回上一頁', home: '回首頁', retry: '重試' },
  diagnosis: {
    title: '診斷資訊',
    copy: '複製診斷資訊',
    status: '狀態碼',
    path: '存取路徑',
    resource: '受限資源',
    required_perm: '所需權限',
    action: '觸發操作',
    from: '來源頁面',
    occurred_at: '發生時間',
  },
};
export default zh_HK;
