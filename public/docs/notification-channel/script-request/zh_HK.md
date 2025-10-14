# 腳本通知 配置指南

## 📖 什麼是腳本通知？

腳本通知是夜鶯平台提供的一種**高度靈活**的告警推送方式。簡單來說，當系統出現告警時，夜鶯會自動調用您編寫的腳本程序來發送通知。

## 🚀 新手快速開始

如果您是第一次使用腳本通知，建議按以下步驟操作：

### 第1步：確認是否需要腳本通知
腳本通知適用於以下場景：
- ✅ 公司使用的通知工具不在夜鶯內置清單中（如企微、釘釘等已內置）
- ✅ 需要複雜的數據處理或格式轉換
- ✅ 需要同時發送到多個不同管道

### 第2步：準備測試環境
1. **先用簡單腳本測試**（複製本文檔中的「入門示例」）
2. **確認數據流通**（檢查日誌文件是否有內容）
3. **再改為實際通知**（修改為飛書/企微/內部 IM 等真實通知）

### 第3步：配置通知渠道
1. 在夜鶯界面創建「腳本通知」類型的通知渠道
2. 配置必要的變數（如 `access_token`）
3. 選擇腳本配置方式（建議新手選擇「使用腳本」直接編寫）

### 第4步：測試驗證
1. 手動測試腳本（參考文檔末尾的測試方法）
2. 創建測試告警規則關聯該通知渠道
3. 觸發告警驗證通知是否正常

> 💡 **新手提示**：強烈建議先使用入門示例中的日誌記錄腳本進行測試，確認數據傳遞正常後，再修改為實際的通知邏輯。

## 🔄 工作原理

想像一下這個過程：

1. **監控系統發現問題** → 夜鶯檢測到告警事件（比如：服務器CPU使用率超過80%）
2. **打包告警信息** → 夜鶯將這個告警的所有信息整理成一個JSON格式的「包裹」
3. **調用您的腳本** → 夜鶯找到您指定的腳本程序，啟動它
4. **傳遞數據** → 夜鶯將JSON「包裹」通過標準輸入（stdin）傳給您的腳本
5. **腳本處理** → 您的腳本收到數據，按照您的邏輯發送通知（比如發到飛書群）

> 💡 **好處**：夜鶯已經幫您處理好了告警模板的渲染，腳本收到的數據是格式化好的，您只需要專注於「怎麼發送」這一步。

## 📦 您的腳本會收到什麼數據？

夜鶯會通過標準輸入（stdin）向您的腳本傳遞一個JSON格式的數據包，包含以下信息：

```json
{
    "event": {
        "rule_name": "CPU使用率過高",
        // ... 更多告警事件的原始數據
    },
    "events": [
        // 如果是聚合告警（多個事件一起發送），這裡會包含多個事件
        // 每個事件的結構與上面的event相同
    ],
    "tpl": {
        "title": "【告警】CPU使用率過高",
        "content": "服務器 web-01 的CPU使用率達到85.6%，已超過閾值80%，請及時處理！"
        // 這是夜鶯根據告警模板渲染好的最終文本，直接可用
    },
    "params": {
        "access_token": "your_feishu_bot_token",
        "webhook_secret": "your_secret_key"
        // 您在界面配置的自定義參數
    },
    "sendtos": ["138321xxxx", "135321xxxx"]
    // 要發送給誰，這個清單是根據通知規則確定的
}
```

> 💡 **重點理解**：`tpl` 部分是夜鶯已經渲染好的消息內容，您通常直接使用這個內容發送即可，無需再次處理模板。

## ⚙️ 變數配置詳解

在創建腳本通知渠道時，您需要配置兩種變數：

### 1️⃣ 自定義參數（$params）

**作用**：存儲腳本運行時需要的配置信息，如API密鑰、存取令牌等。

**舉個例子**：
- 🎯 **場景**：您要發送飛書通知，需要飛書機器人的access_token
- 📝 **配置步驟**：
  1. 在「變數配置」中添加參數標識：`access_token`
  2. 用戶在配置通知規則時，會看到需要填入`access_token`的值
  3. 用戶填入實際的token：`cli_a12b34c56d78e90f`
  4. 腳本運行時，通過`params.access_token`就能獲取到這個token

**實際應用**：
```python
# 在您的腳本中這樣使用：
token = payload.get('params', {}).get('access_token')
url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
```

### 2️⃣ 發送目標（$sendtos）

**作用**：定義通知要發送給哪些人或群。

**舉個例子**：
- 🎯 **場景**：根據不同告警發送給不同的人
- 📝 **配置原理**：
  1. 在通知規則中，管理員設置某個告警要通知「張三」和「運維群」
  2. 系統會根據用戶配置的聯繫方式，將「張三」轉換為他的手機號（根據變數配置中的聯繫方式來決定轉換為什麼）
  3. 腳本收到的`sendtos`陣列就包含了這些實際的手機號

**實際應用**：
```python
# 在您的腳本中遍歷發送目標：
for target in payload.get('sendtos', []):
    send_notification_to(target, message)
```

## 🛠️ 腳本配置指南

### ⏰ 超時時間設置
- **單位**：毫秒（1秒 = 1000毫秒）
- **作用**：防止腳本執行時間過長，避免系統卡死
- **建議值**：
  - 簡單腳本：5000毫秒（5秒）
  - 複雜腳本：10000毫秒（10秒）
  - 有網絡請求：15000毫秒（15秒）

### 📄 腳本配置方式

您可以選擇兩種方式來配置腳本：

#### 方式1：直接編寫腳本（推薦新手使用）
- ✅ **優點**：在界面中直接編寫，方便修改和調試
- ✅ **適用場景**：腳本內容較短，邏輯簡單
- 📝 **操作**：選擇「使用腳本」，在文字方塊中編寫或粘貼您的腳本代碼

#### 方式2：使用本地腳本文件
- ✅ **優點**：適合複雜腳本，可以使用IDE開發
- ✅ **適用場景**：腳本較大，需要引用多個文件
- 📝 **操作**：選擇「使用路徑」，填入腳本文件的完整路徑

⚠️ **使用路徑方式的注意事項**：
1. **文件存在**：確保腳本文件已保存到服務器指定位置
2. **執行權限**：運行 `chmod +x /path/to/your/script.py` 給腳本添加執行權限
3. **用戶權限**：確保運行夜鶯服務的用戶能夠訪問這個文件
4. **路徑正確**：使用絕對路徑，如：`/opt/scripts/feishu_notify.py`

## 📝 腳本示例

### 🚀 入門示例：最簡單的日誌記錄腳本

如果您是第一次使用腳本通知，建議先從這個簡單例子開始：

```python
#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
import sys
import json
from datetime import datetime

# 讀取夜鶯傳入的數據
payload = json.load(sys.stdin)

# 獲取告警信息
title = payload.get('tpl', {}).get('title', '未知告警')
content = payload.get('tpl', {}).get('content', '未知內容')
sendtos = payload.get('sendtos', [])

# 生成日誌記錄
timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
log_message = f"[{timestamp}] 告警通知：{title}\n內容：{content}\n發送目標：{', '.join(sendtos)}\n{'='*50}\n"

# 寫入日誌文件
with open('/tmp/alerts.log', 'a', encoding='utf-8') as f:
    f.write(log_message)

print(f"告警已記錄到日誌文件，標題：{title}")
```

**這個腳本的作用**：
- 📝 將每次告警記錄到 `/tmp/alerts.log` 文件中
- 🎯 展示了如何讀取和使用夜鶯傳入的數據
- ✅ 簡單可靠，適合用來測試腳本通知是否正常工作

### 🎯 進階示例：發送飛書通知

以下是一個更完整的Python腳本示例，用於處理告警事件並發送到飛書：

```python
#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
import sys
import json
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError
import socket

def send_feishu_notification(payload):
    """
    發送飛書通知的核心函數（使用標準庫，無需安裝第三方庫）
    """
    try:
        # 1. 獲取必要信息
        token = payload.get('params', {}).get('access_token')
        title = payload.get('tpl', {}).get('title', '系統告警')
        content = payload.get('tpl', {}).get('content', '未知告警內容')
        
        # 2. 檢查必要參數
        if not token:
            print("❌ 錯誤：未配置飛書機器人access_token")
            return False
            
        # 3. 構建飛書消息格式
        feishu_message = {
            "msg_type": "text",
            "content": {
                "text": f"🚨 {title}\n\n{content}"
            }
        }
        
        # 4. 準備HTTP請求
        url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
        data = json.dumps(feishu_message).encode('utf-8')
        
        # 5. 創建請求對象
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json;charset=utf-8'}
        )
        
        # 6. 發送請求（設置10秒超時）
        with urllib.request.urlopen(req, timeout=10) as response:
            response_data = response.read().decode('utf-8')
            
            if response.status == 200:
                print("✅ 飛書通知發送成功")
                print(f"回應內容: {response_data}")
                return True
            else:
                print(f"❌ 飛書通知發送失敗: HTTP {response.status}")
                print(f"回應內容: {response_data}")
                return False
                
    except socket.timeout:
        print("❌ 發送飛書通知超時")
        return False
    except HTTPError as e:
        print(f"❌ HTTP請求失敗: {e.code} {e.reason}")
        return False
    except URLError as e:
        print(f"❌ 網絡連接失敗: {str(e.reason)}")
        return False
    except Exception as e:
        print(f"❌ 發送飛書通知時發生未知錯誤: {str(e)}")
        return False

def main():
    try:
        # 讀取夜鶯傳入的數據
        payload = json.load(sys.stdin)
        
        # 可選：保存數據到文件供調試使用
        # with open('/tmp/nightingale_payload.json', 'w', encoding='utf-8') as f:
        #     json.dump(payload, f, indent=2, ensure_ascii=False)
        
        # 發送通知
        success = send_feishu_notification(payload)
        
        # 根據結果設置退出碼
        sys.exit(0 if success else 1)
        
    except json.JSONDecodeError:
        print("❌ 錯誤：無法解析輸入的JSON數據")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 腳本執行失敗: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

**這個腳本的特點**：
- 🔧 **容錯性好**：包含完整的錯誤處理邏輯
- 📝 **日誌清晰**：使用表情符號和清晰的提示信息
- ⚡ **超時控制**：設置了10秒的網絡請求超時
- 🔍 **便於調試**：可選擇保存JSON數據到文件
- ✅ **返回狀態碼**：成功返回0，失敗返回1
- 🚀 **零依賴**：只使用 Python 標準庫，無需安裝第三方包

**使用前準備**：
1. ✅ **無需安裝額外依賴**：腳本只使用 Python 標準庫
2. 在變數配置中添加參數：`access_token`
3. 用戶在通知規則中填入飛書機器人的實際token     

## 🔧 故障排查指南

### 📋 快速檢查清單

當腳本通知不工作時，按以下順序檢查：

1. **基礎檢查**
   - [ ] 腳本語法是否正確？
   - [ ] Python 版本是否支持？（建議 Python 3.6+）
   - [ ] 超時時間設置是否合理？

2. **權限檢查**
   - [ ] 腳本是否有執行權限？
   - [ ] 夜鶯服務是否能訪問腳本文件？

3. **數據檢查**
   - [ ] 變數配置是否正確？
   - [ ] 用戶是否填寫了必要的參數？

### 🐛 常見問題解決方案

#### 問題1：腳本執行超時 ⏰
**症狀**：日誌顯示腳本執行超時
**原因**：
- 腳本執行時間超過了配置的超時限制
- 網絡請求回應慢

**解決方案**：
```bash
# 1. 適當調整超時時間
# 在界面中將超時時間從 5000 調整為 15000（15秒）

# 2. 優化腳本中的網絡請求超時
# 在 urllib.request.urlopen() 中設置超時
with urllib.request.urlopen(req, timeout=5) as response:  # 設置5秒超時
    pass
```

#### 問題2：腳本沒有收到數據 📨
**症狀**：腳本運行了，但沒有處理任何數據
**調試方法**：
```python
# 在腳本開頭添加調試代碼
import sys
import json

try:
    payload = json.load(sys.stdin)
    # 將收到的數據寫入文件
    with open('/tmp/debug_payload.json', 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print("數據已保存到 /tmp/debug_payload.json")
except Exception as e:
    print(f"讀取數據失敗: {e}")
```

#### 問題3：參數沒有傳遞到腳本 ⚙️
**症狀**：`params` 為空或缺少預期的參數
**檢查步驟**：
1. 在腳本通知渠道配置中，確認已添加參數標識（如 `access_token`）
2. 在通知規則配置中，確認用戶已填寫對應參數的值
3. 在腳本中打印參數進行確認：
```python
params = payload.get('params', {})
print(f"收到的參數: {params}")
```

#### 問題4：網絡請求失敗 🌐
**症狀**：腳本執行正常，但通知沒有發出
**排查方法**：
```python
import urllib.request
import json
from urllib.error import URLError, HTTPError
import socket

try:
    # 準備請求數據
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json;charset=utf-8'}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        response_data = response.read().decode('utf-8')
        print(f"HTTP狀態碼: {response.status}")
        print(f"回應內容: {response_data}")
        
        if response.status != 200:
            print("❌ 請檢查API地址和參數是否正確")
            
except socket.timeout:
    print("❌ 網絡請求超時，請檢查網絡連接")
except HTTPError as e:
    print(f"❌ HTTP請求失敗: {e.code} {e.reason}")
except URLError as e:
    print(f"❌ 無法連接到目標服務器: {e.reason}")
```

### 🧪 手動測試腳本

使用以下命令手動測試您的腳本：

```bash
echo '{"event":{"rule_name":"測試告警"},"tpl":{"title":"測試標題","content":"測試內容"},"params":{"access_token":"your_token"},"sendtos":["測試用戶"]}' | python3 /path/to/your/script.py
```

### 🆘 仍然無法解決？

如果按照上述步驟仍然無法解決問題，請收集以下信息尋求幫助：

1. **腳本內容**（隱藏敏感信息如token）
2. **錯誤日誌**的完整信息
3. **測試命令**的執行結果
4. **系統環境**信息（Python版本、作業系統等）

這樣可以幫助技術支援人員更快地定位和解決問題。