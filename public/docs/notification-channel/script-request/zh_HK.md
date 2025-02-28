# 腳本通知 配置指南
腳本通知是一種極其靈活的告警推送方式，如果夜鶯平台提供的已有通知媒介不能滿足您的需求，並且配置 HTTP發送的方式（通過自定義 URL, 請求頭, 請求體等），不能對接您公司的通知通道，您可以考慮使用腳本發送類型。

### 工作原理
1. 夜鶯產生告警事件
2. 夜鶯將告警事件序列化為JSON格式
3. 夜鶯調用您指定的通知腳本，並通過stdin傳遞JSON數據
4. 您的腳本處理這些數據並執行自定義邏輯

腳本通知方式可以復用夜鶯內置的告警模板。JSON數據中不僅包含事件原始信息，還包含事件與通知模板渲染後的結果文本、自定義參數、發送目標等，無需在腳本中再處理模板渲染邏輯。

stdin 數據格式如下：

```json
{
    "event": {}, // 告警事件原始數據
    "events": [], // 如果是聚合告警，則包含多個事件，每個事件的結構與event相同
    "tpl": { // 消息模板渲染後的結果文本，用戶在配置通知規則的時候，會關聯一個通知模板
        "title": "告警標題",
        "text": "告警內容"
    },
    "params": { // 自定義參數
        "access_token": "xxx",
        "ats": "xxx"
    },
    "sendtos": ["xxx", "xxx"] // 發送目標列表
}
```

### 變量配置
用於配置腳本所需的認證信息或其他必要參數。

1. 參數配置 $params
- 表示自定義參數，可以在json數據中使用，例如 params.access_token 、 params.token 等。
- 這些參數的值可以在通知規則中由用戶配置，然後在實際發送時動態傳入。比如一個釘釘通知媒介，可以根據用戶配置不同的 token 值，從而實現不同的釘釘群機器人發送。
- 使用 params.xxx 時，需要在 "變量配置" 中添加參數標識 xxx ，然後用戶會在通知規則中，填入 xxx 的值，最終用戶配置的 xxx 值會替換到需要的地方中。
2. 聯繫方式 $sendtos
- 表示本次通知要發送到的目標地址或列表，如手機號、郵箱、IM 的個人 token 等。
- 使用 sendtos 時，需要在 "變量配置" 中配置用戶聯繫方式，最終會根據用戶配置的聯繫方式，將 sendtos 替換為實際的聯繫方式。

### 腳本配置 

超時時間
- 單位：毫秒
- 用途：設置腳本執行的最大允許時間
- 建議：根據腳本複雜度設置合理的超時時間，避免腳本執行時間過長 腳本類型選擇
提供兩種方式來配置腳本：

- 使用腳本 ：直接在界面編寫或粘貼腳本內容
- 使用路徑 ：指定服務器上已存在的腳本文件路徑
注意：如果選擇"使用路徑"方式，請確保：

1. 腳本文件已存在於指定路徑
2. 腳本具有正確的執行權限
3. 運行服務的用戶有權限訪問該腳本

#### 腳本示例
1. 以下是一個 shell 腳本示例，用於處理告警事件並發送到飛書
```bash
#!/bin/bash

# 使用grep和sed提取JSON字段值的函数
get_json_value() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"$field\":[^,}]*" | sed -E 's/"[^"]*":"?([^",}]*)"?.*/\1/'
}

send_feishu() {
    # 从标准输入读取JSON
    payload=$(cat)
    
    # 提取token和content
    token=$(get_json_value "$(echo "$payload" | grep -o '"params":{[^}]*}')" "access_token")
    content=$(get_json_value "$(echo "$payload" | grep -o '"tpl":{[^}]*}')" "content")
    
    # 如果content为空，使用默认值
    if [ -z "$content" ]; then
        content="未找到告警内容"
    fi
    
    # 构建请求消息体
    message="{\"msg_type\": \"text\", \"content\": {\"text\": \"$content\"}}"
    
    if [ -n "$token" ]; then
        # 发送HTTP请求到飞书
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$message" \
            "https://open.feishu.cn/open-apis/bot/v2/hook/$token")
        
        echo "飞书通知结果: token=$token response=$response"
    else
        echo "未提供有效的飞书机器人access_token"
    fi
}

# 可选：保存输入数据用于调试
cat > .payload

# 处理告警消息
cat .payload | send_feishu
```     

2. 以下是一个 Python 脚本示例，用于处理告警事件并发送到飞书
```python
#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import sys
import json
import requests

def send_feishu(payload) -> None:
    """
    发送飞书通知
    Args:
        payload: 包含告警信息的字典
    """
    try:
        event = payload.get('event', {})
        token = payload.get('params', {}).get('access_token')

        headers = {
            "Content-Type": "application/json;charset=utf-8"
        }

        # 构建消息内容
        message = {
            "msg_type": "text",
            "content": {
                "text": payload.get('tpl', {}).get('content', '未找到告警内容')
            }
        }

        if token:
            url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
            response = requests.post(
                url, 
                headers=headers, 
                json=message,
                timeout=5
            )
            print(f"飞书通知结果: token={token} status={response.status_code} response={response.text}")
        else:
            print("未提供有效的飞书机器人access_token")

    except Exception as e:
        print(f"发送飞书通知失败: {str(e)}")


def main():
    payload = json.load(sys.stdin)
    # 可选：将payload写入文件以便调试
    with open(".payload", 'w') as f:
        f.write(json.dumps(payload, indent=4))
    
    send_feishu(payload)

if __name__ == "__main__":
    main()
```     

### 故障排查
### 故障排查 常見問題及解決方案
1. 腳本執行超時
   - 檢查腳本超時時間設置是否合理
   - 優化腳本執行效率
   - 檢查是否存在網絡請求延遲
2. 腳本執行權限問題
   - 確保腳本文件具有可執行權限（chmod +x）
   - 驗證運行服務的用戶對腳本文件有讀取和執行權限
   - 檢查腳本所在目錄的訪問權限
3. 數據格式問題
   - 確保腳本能正確解析 JSON 輸入
   - 檢查 stdin 數據是否完整
   - 驗證 JSON 數據格式是否符合預期
4. 調試方法
   - 在腳本中添加日誌輸出
   - 將 stdin 數據保存到文件中分析
   - 使用以下命令手動測試腳本
    ```bash
     echo '{"event":{},"tpl":{"title":"test","content":"content"},"params":{"access_token":"xxx"}' | ./your_script.py
    ```

5. 環境依賴問題
   
   - 確保所需的第三方庫已正確安裝
   - 檢查 Python 等解釋器版本是否兼容
   - 驗證系統環境變量配置是否正確
如遇到其他問題，請查看系統日誌獲取詳細錯誤信息。
