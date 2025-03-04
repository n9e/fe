# スクリプト通知設定ガイド
スクリプト通知は非常に柔軟なアラート配信方法です。Nightingaleプラットフォームが提供する既存の通知チャネルがご要件を満たせない場合、またはHTTP配信方法（カスタムURL、リクエストヘッダー、リクエストボディなど）で御社の通知チャネルに接続できない場合は、スクリプトベースの通知の使用をご検討ください。

### 動作の仕組み
1. Nightingaleがアラートイベントを生成
2. NightingaleがアラートイベントをJSON形式にシリアライズ
3. Nightingaleが指定された通知スクリプトを呼び出し、JSONデータをstdinを通じて渡す
4. スクリプトがこのデータを処理してカスタムロジックを実行

スクリプト通知は、Nightingaleの組み込みアラートテンプレートを再利用できます。JSONデータには、元のイベント情報だけでなく、イベントと通知テンプレートからレンダリングされたテキスト結果、カスタムパラメータ、配信先なども含まれており、スクリプトでテンプレートレンダリングロジックを処理する必要がありません。

stdinデータ形式は以下の通りです：

```json
{
    "event": {}, // 元のアラートイベントデータ
    "events": [], // 集約されたアラートの場合、複数のイベントを含み、各イベントはeventと同じ構造
    "tpl": { // レンダリングされたメッセージテンプレート結果、ユーザーは通知ルール設定時に通知テンプレートを関連付け
        "title": "アラートタイトル",
        "text": "アラート内容"
    },
    "params": { // カスタムパラメータ
        "access_token": "xxx",
        "ats": "xxx"
    },
    "sendtos": ["xxx", "xxx"] // 配信先リスト
}
```

### 変数設定
スクリプトに必要な認証情報やその他のパラメータを設定するために使用します。
1. パラメータ設定 $params

- JSONデータで使用できるカスタムパラメータを表します（例：`params.access_token`、`params.token`など）
- これらのパラメータ値は、通知ルールでユーザーが設定でき、実際の配信時に動的に渡されます。例えば、DingTalk通知チャネルでは、ユーザーが設定した異なるトークン値を使用して、異なるDingTalkグループロボットにメッセージを送信できます。
- `params.xxx`を使用する場合、「変数設定」にパラメータ識別子`xxx`を追加する必要があります。その後、ユーザーは通知ルールで`xxx`の値を入力し、最終的にユーザーが設定した`xxx`の値が必要な箇所に置き換えられます。

2. 連絡方法 $sendtos

- この通知の送信先アドレスまたはリストを表します（電話番号、メール、IMの個人トークンなど）
- `sendtos`を使用する場合、「変数設定」でユーザーの連絡方法を設定する必要があり、最終的に`sendtos`はユーザーが設定した連絡先情報に基づいて実際の連絡方法に置き換えられます。

### スクリプト設定

#### タイムアウト
- 単位：ミリ秒
- 目的：スクリプトの最大実行時間を設定
- 推奨：スクリプトの複雑さに基づいて、過度の実行時間を避けるため適切なタイムアウトを設定

#### スクリプトタイプの選択
スクリプトを設定する2つの方法が提供されています：

- **スクリプトを使用**：インターフェースで直接スクリプト内容を記述またはペースト
- **パスを使用**：サーバー上の既存のスクリプトファイルのパスを指定

注意：「パスを使用」方法を選択する場合、以下を確認してください：
1. 指定されたパスにスクリプトファイルが存在すること
2. スクリプトに適切な実行権限があること
3. サービスを実行するユーザーがスクリプトにアクセスする権限を持っていること

#### スクリプト例
1. Below is a shell script example for processing alert events and sending them to Feishu
```bash
#!/bin/bash

# Function to extract JSON field values using grep and sed
get_json_value() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"$field\":[^,}]*" | sed -E 's/"[^"]*":"?([^",}]*)"?.*/\1/'
}

send_feishu() {
    # Read JSON from standard input
    payload=$(cat)
    
    # Extract token and content
    token=$(get_json_value "$(echo "$payload" | grep -o '"params":{[^}]*}')" "access_token")
    content=$(get_json_value "$(echo "$payload" | grep -o '"tpl":{[^}]*}')" "content")
    
    # If content is empty, use default value
    if [ -z "$content" ]; then
        content="No alert content found"
    fi
    
    # Build request message body
    message="{\"msg_type\": \"text\", \"content\": {\"text\": \"$content\"}}"
    
    if [ -n "$token" ]; then
        # Send HTTP request to Feishu
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$message" \
            "https://open.feishu.cn/open-apis/bot/v2/hook/$token")
        
        echo "Feishu notification result: token=$token response=$response"
    else
        echo "No valid Feishu robot access_token provided"
    fi
}

# Optional: Save input data for debugging
cat > .payload

# Process alert message
cat .payload | send_feishu
```     

2. 以下はPythonスクリプトの例で、アラートイベントを処理して飛書に送信します
```python
#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import sys
import json
import requests

def send_feishu(payload) -> None:
    """
    Send Feishu notification
    Args:
        payload: Dictionary containing alert information
    """
    try:
        event = payload.get('event', {})
        token = payload.get('params', {}).get('access_token')

        headers = {
            "Content-Type": "application/json;charset=utf-8"
        }

        # Build message content
        message = {
            "msg_type": "text",
            "content": {
                "text": payload.get('tpl', {}).get('content', 'No alert content found')
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
            print(f"Feishu notification result: token={token} status={response.status_code} response={response.text}")
        else:
            print("No valid Feishu robot access_token provided")

    except Exception as e:
        print(f"Failed to send Feishu notification: {str(e)}")


def main():
    payload = json.load(sys.stdin)
    # Optional: Write payload to file for debugging
    with open(".payload", 'w') as f:
        f.write(json.dumps(payload, indent=4))
    
    send_feishu(payload)

if __name__ == "__main__":
    main()
```     

### トラブルシューティング

#### 一般的な問題と解決策

1. **スクリプト実行タイムアウト**
   - スクリプトのタイムアウト設定が適切か確認
   - スクリプトの実行効率を最適化
   - ネットワークリクエストの遅延を確認

2. **スクリプト権限の問題**
   - スクリプトファイルに実行権限があることを確認（chmod +x）
   - サービスを実行するユーザーがスクリプトファイルの読み取りと実行権限を持っていることを確認
   - スクリプトを含むディレクトリへのアクセス権限を確認

3. **データフォーマットの問題**
   - スクリプトがJSON入力を正しく解析できることを確認
   - stdinデータが完全であることを確認
   - JSONデータ形式が期待通りであることを確認

4. **デバッグ方法**
   - スクリプトにログ出力を追加
   - stdin データをファイルに保存して分析
   - 以下のコマンドでスクリプトを手動でテスト：
    ```bash
     echo '{"event":{},"tpl":{"title":"test","content":"content"},"params":{"access_token":"xxx"}' | ./your_script.py
    ```

5. **環境依存の問題**
   - 必要なサードパーティライブラリが適切にインストールされていることを確認
   - Pythonやその他のインタープリタのバージョンが互換性があることを確認
   - システム環境変数が正しく設定されていることを確認

その他の問題が発生した場合は、システムログで詳細なエラー情報を確認してください。
