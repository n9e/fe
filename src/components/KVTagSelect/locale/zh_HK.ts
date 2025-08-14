const zh_HK = {
  append_tags_msg: '標籤格式不正確，請檢查！',
  append_tags_msg1: '標籤長度應小於等於 64 位',
  append_tags_msg2: '標籤格式應為 key=value。且 key 以字母或下劃線開頭，由字母、數字和下劃線組成。',
  append_tags_placeholder: '標籤格式為 key=value ，使用回車或空格分隔',
  tag: {
    key: {
      label: '標籤鍵',
      msg: '標籤鍵不能為空',
    },
    func: {
      label: '運算符',
      label_tip: `支援多種匹配運算符，說明如下：
- \`==\` 符合某個具體的標籤值，只能填入一個，如果想同時符合多個，應該使用 \`in\` 運算子
- \`=~\` 填入正規表示式，靈活匹配標籤值
- \`in\` 符合多個標籤值，類似 SQL 裡的 \`in\` 操作
- \`not in\` 不符合的標籤值，可填入多個，類似 SQL 裡的 \`not in\` 操作，用來排除多個標籤值
- \`!=\` 不等於，用於排除特定的某個標籤值
- \`!~\` 正規不匹配，填入正規，符合這個正規的標籤值都會被排除，類似 PromQL 中的 \`!~\``,
      msg: '運算符不能為空',
    },
    value: {
      label: '標籤值',
      placeholder1: '可以輸入多個值，用回車分割',
      placeholder2: '請輸入正則表達式',
      msg: '標籤值不能為空',
    },
    add: '新增標籤',
  },
};

export default zh_HK;
