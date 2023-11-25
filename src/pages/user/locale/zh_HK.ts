const zh_HK = {
  user: {
    title: '使用者管理',
    search_placeholder: '使用者名稱、郵箱或手機',
    create: '創建使用者',
    edit: '編輯使用者',
  },
  team: {
    title: '團隊管理',
    list: '團隊列表',
    search_placeholder: '使用者名稱、顯示名、郵箱或手機',
    create: '創建團隊',
    edit: '編輯團隊',
    add_member: '新增成員',
    empty: '沒有與你相關的團隊，請先',
    name: '團隊名稱',
    add_member_selected: '已選擇 {{num}} 項',
  },
  business: {
    title: '業務組管理',
    list: '業務組',
    search_placeholder: '業務名',
    team_search_placeholder: '搜尋團隊名稱',
    create: '創建業務組',
    edit: '編輯業務組',
    add_team: '新增團隊',
    perm_flag: '權限',
    note_content: '告警規則，告警事件，監控機器，自愈腳本等都歸屬業務組，是一個在系統裡可以自閉環的組織',
    empty: '業務組（監控機器、監控儀表盤、告警規則、自愈腳本都要歸屬某個業務組）為空，請先',
    name: '業務組名稱',
    name_tip: `
      通過 {{separator}} 分隔後會渲染成樹結構 <1 />
      如：redis{{separator}}監控 和 redis{{separator}}登錄 將顯示成如下  <1 />
      redis <1 />
      - 監控 <1 />
      - 登錄 <1 />
    `,
    label_enable: '作為標籤使用',
    label_enable_tip: '系統會自動把業務組的英文標識作為標籤附到該業務組下轄監控機器的時序資料上',
    label_value: '英文標識',
    label_value_tip: `
      <0>
        儘量用英文，不能與其他業務組標識重複，系統會自動生成
        <1>busigroup={{val}}</1>
        的標籤
      </0>
    `,
    team_name: '團隊',
    perm_flag_0: '只讀',
    perm_flag_1: '讀寫',
    user_group_msg: '業務組團隊不能為空',
  },
  disbale: '禁用',
  enable: '啟用',
  ok_and_search: '確定並搜尋',
};

export default zh_HK;
