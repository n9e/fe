# スクリプト通知設定ガイド

## 📖 スクリプト通知とは？

スクリプト通知は、Nightingaleプラットフォームが提供する**非常に柔軟性の高い**アラート配信方法です。簡単に言うと、システムでアラートが発生したときに、Nightingaleがあなたが作成したスクリプトプログラムを自動的に呼び出して通知を送信します。

## 🚀 初心者向けクイックスタート

スクリプト通知を初めて使用する場合は、以下の手順に従って操作することをお勧めします：

### ステップ1：スクリプト通知が必要かどうかを確認
スクリプト通知は以下のシナリオに適用されます：
- ✅ 会社で使用している通知ツールがNightingaleの組み込みリストにない（WeCom、DingTalkなどは既に組み込まれています）
- ✅ 複雑なデータ処理やフォーマット変換が必要
- ✅ 複数の異なるチャネルに同時に送信する必要がある

### ステップ2：テスト環境を準備
1. **まず簡単なスクリプトでテスト**（このドキュメントの「入門例」をコピー）
2. **データフローを確認**（ログファイルにコンテンツがあるかチェック）
3. **実際の通知に変更**（Feishu/WeCom/内部IMなどの実際の通知に修正）

### ステップ3：通知チャネルの設定
1. Nightingale画面で「スクリプト通知」タイプの通知チャネルを作成
2. 必要な変数を設定（`access_token`など）
3. スクリプト設定方法を選択（初心者には「スクリプトを使用」で直接記述することを推奨）

### ステップ4：テスト検証
1. スクリプトの手動テスト（ドキュメント末尾のテスト方法を参照）
2. このチャネルに関連付けるテストアラートルールを作成
3. アラートをトリガーして通知が正常かどうかを確認

> 💡 **初心者のヒント**：まず入門例のログ記録スクリプトを使用してテストし、データ転送が正常であることを確認してから、実際の通知ロジックに修正することを強く推奨します。

## 🔄 動作原理

このプロセスを想像してください：

1. **監視システムが問題を発見** → Nightingaleがアラートイベントを検出（例：サーバーCPU使用率が80%を超える）
2. **アラート情報をパッケージ化** → Nightingaleがこのアラートのすべての情報をJSON形式の「パッケージ」に整理
3. **あなたのスクリプトを呼び出し** → Nightingaleが指定されたスクリプトプログラムを見つけて起動
4. **データを渡す** → NightingaleがJSON「パッケージ」を標準入力（stdin）を通してあなたのスクリプトに渡す
5. **スクリプトが処理** → あなたのスクリプトがデータを受け取り、あなたのロジックに従って通知を送信（例：Feishuグループに送信）

> 💡 **利点**：Nightingaleは既にアラートテンプレートのレンダリングを処理しており、スクリプトが受け取るデータはフォーマットされているため、あなたは「どのように送信するか」のステップにのみ集中すればよいのです。

## 📦 あなたのスクリプトが受け取るデータは？

Nightingaleは標準入力（stdin）を通してあなたのスクリプトにJSON形式のデータパッケージを渡し、以下の情報が含まれています：

```json
{
    "event": {
        "rule_name": "CPU使用率が高い",
        // ... より多くのアラートイベントの元データ
    },
    "events": [
        // 集約アラート（複数のイベントを一緒に送信）の場合、ここに複数のイベントが含まれます
        // 各イベントの構造は上記のeventと同じです
    ],
    "tpl": {
        "title": "【アラート】CPU使用率が高い",
        "content": "サーバー web-01 のCPU使用率は85.6%に達し、閾値80%を超えました。速やかに対処してください！"
        // これはNightingaleがアラートテンプレートに基づいてレンダリングした最終テキストで、直接使用可能です
    },
    "params": {
        "access_token": "your_feishu_bot_token",
        "webhook_secret": "your_secret_key"
        // 画面で設定したカスタムパラメータ
    },
    "sendtos": ["138321xxxx", "135321xxxx"]
    // 誰に送信するか、このリストは通知ルールに基づいて決定されます
}
```

> 💡 **重要な理解**：`tpl`部分はNightingaleが既にレンダリングした メッセージコンテンツです。通常、このコンテンツを直接使用して送信すればよく、テンプレートを再処理する必要はありません。

## ⚙️ 変数設定の詳細

スクリプト通知チャネルを作成する際、2種類の変数を設定する必要があります：

### 1️⃣ カスタムパラメータ（$params）

**役割**：スクリプト実行時に必要な設定情報（APIキー、アクセストークンなど）を保存します。

**例**：
- 🎯 **シナリオ**：Feishu通知を送信したいが、Feishuボットのaccess_tokenが必要
- 📝 **設定手順**：
  1. 「変数設定」でパラメータ識別子を追加：`access_token`
  2. ユーザーが通知ルールを設定する際、`access_token`の値を入力する必要があると表示される
  3. ユーザーが実際のトークンを入力：`cli_a12b34c56d78e90f`
  4. スクリプト実行時、`params.access_token`でこのトークンを取得できる

**実際の応用**：
```python
# あなたのスクリプトでこのように使用：
token = payload.get('params', {}).get('access_token')
url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
```

### 2️⃣ 送信ターゲット（$sendtos）

**役割**：通知を誰に、またはどのグループに送信するかを定義します。

**例**：
- 🎯 **シナリオ**：異なるアラートを異なる人に送信
- 📝 **設定の原理**：
  1. 通知ルールで、管理者が特定のアラートを「田中さん」と「運用グループ」に通知するよう設定
  2. システムはユーザーが設定した連絡先に基づいて、「田中さん」を彼の電話番号に変換（変数設定の連絡先に基づいて何に変換するかを決定）
  3. スクリプトが受け取る`sendtos`配列にはこれらの実際の電話番号が含まれる

**実際の応用**：
```python
# あなたのスクリプトで送信ターゲットを反復処理：
for target in payload.get('sendtos', []):
    send_notification_to(target, message)
```

## 🛠️ スクリプト設定ガイド

### ⏰ タイムアウト設定
- **単位**：ミリ秒（1秒 = 1000ミリ秒）
- **役割**：スクリプトの実行時間が長すぎることを防ぎ、システムがフリーズするのを避ける
- **推奨値**：
  - シンプルなスクリプト：5000ミリ秒（5秒）
  - 複雑なスクリプト：10000ミリ秒（10秒）
  - ネットワークリクエストあり：15000ミリ秒（15秒）

### 📄 スクリプト設定方法

スクリプトを設定する2つの方法を選択できます：

#### 方法1：直接スクリプトを記述（初心者推奨）
- ✅ **利点**：画面で直接記述、修正とデバッグが便利
- ✅ **適用シナリオ**：スクリプトコンテンツが短く、ロジックがシンプル
- 📝 **操作**：「スクリプトを使用」を選択し、テキストボックスにあなたのスクリプトコードを記述または貼り付け

#### 方法2：ローカルスクリプトファイルを使用
- ✅ **利点**：複雑なスクリプトに適しており、IDEで開発可能
- ✅ **適用シナリオ**：スクリプトが大きく、複数のファイルを参照する必要がある
- 📝 **操作**：「パスを使用」を選択し、スクリプトファイルの完全パスを入力

⚠️ **パス方式使用時の注意事項**：
1. **ファイル存在**：スクリプトファイルがサーバーの指定場所に保存されていることを確認
2. **実行権限**：`chmod +x /path/to/your/script.py`を実行してスクリプトに実行権限を追加
3. **ユーザー権限**：Nightingaleサービスを実行するユーザーがこのファイルにアクセスできることを確認
4. **パス正確性**：絶対パスを使用。例：`/opt/scripts/feishu_notify.py`

## 📝 スクリプト例

### 🚀 入門例：最もシンプルなログ記録スクリプト

スクリプト通知を初めて使用する場合は、まずこのシンプルな例から始めることをお勧めします：

```python
#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
import sys
import json
from datetime import datetime

# Nightingaleから渡されるデータを読み取り
payload = json.load(sys.stdin)

# アラート情報を取得
title = payload.get('tpl', {}).get('title', '不明なアラート')
content = payload.get('tpl', {}).get('content', '不明なコンテンツ')
sendtos = payload.get('sendtos', [])

# ログレコードを生成
timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
log_message = f"[{timestamp}] アラート通知：{title}\n内容：{content}\n送信ターゲット：{', '.join(sendtos)}\n{'='*50}\n"

# ログファイルに書き込み
with open('/tmp/alerts.log', 'a', encoding='utf-8') as f:
    f.write(log_message)

print(f"アラートはログファイルに記録されました。タイトル：{title}")
```

**このスクリプトの役割**：
- 📝 各アラートを `/tmp/alerts.log` ファイルに記録
- 🎯 Nightingaleから渡されるデータを読み取り、使用する方法を示している
- ✅ シンプルで信頼性があり、スクリプト通知が正常に動作するかをテストするのに適している

### 🎯 上級例：Feishu通知の送信

以下は、アラートイベントを処理してFeishuに送信するより完全なPythonスクリプトの例です：

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
    Feishu通知を送信するコア関数（標準ライブラリを使用、サードパーティライブラリのインストール不要）
    """
    try:
        # 1. 必要な情報を取得
        token = payload.get('params', {}).get('access_token')
        title = payload.get('tpl', {}).get('title', 'システムアラート')
        content = payload.get('tpl', {}).get('content', '不明なアラート内容')
        
        # 2. 必要なパラメータをチェック
        if not token:
            print("❌ エラー：Feishuボットaccess_tokenが設定されていません")
            return False
            
        # 3. Feishuメッセージフォーマットを構築
        feishu_message = {
            "msg_type": "text",
            "content": {
                "text": f"🚨 {title}\n\n{content}"
            }
        }
        
        # 4. HTTPリクエストを準備
        url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
        data = json.dumps(feishu_message).encode('utf-8')
        
        # 5. リクエストオブジェクトを作成
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json;charset=utf-8'}
        )
        
        # 6. リクエストを送信（10秒のタイムアウトを設定）
        with urllib.request.urlopen(req, timeout=10) as response:
            response_data = response.read().decode('utf-8')
            
            if response.status == 200:
                print("✅ Feishu通知の送信に成功しました")
                print(f"応答内容: {response_data}")
                return True
            else:
                print(f"❌ Feishu通知の送信に失敗しました: HTTP {response.status}")
                print(f"応答内容: {response_data}")
                return False
                
    except socket.timeout:
        print("❌ Feishu通知の送信がタイムアウトしました")
        return False
    except HTTPError as e:
        print(f"❌ HTTPリクエストが失敗しました: {e.code} {e.reason}")
        return False
    except URLError as e:
        print(f"❌ ネットワーク接続が失敗しました: {str(e.reason)}")
        return False
    except Exception as e:
        print(f"❌ Feishu通知送信中に不明なエラーが発生しました: {str(e)}")
        return False

def main():
    try:
        # Nightingaleから渡されるデータを読み取り
        payload = json.load(sys.stdin)
        
        # オプション：デバッグ用にデータをファイルに保存
        # with open('/tmp/nightingale_payload.json', 'w', encoding='utf-8') as f:
        #     json.dump(payload, f, indent=2, ensure_ascii=False)
        
        # 通知を送信
        success = send_feishu_notification(payload)
        
        # 結果に基づいて終了コードを設定
        sys.exit(0 if success else 1)
        
    except json.JSONDecodeError:
        print("❌ エラー：入力されたJSONデータを解析できませんでした")
        sys.exit(1)
    except Exception as e:
        print(f"❌ スクリプト実行が失敗しました: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

**このスクリプトの特徴**：
- 🔧 **障害耐性が良い**：完全なエラー処理ロジックを含む
- 📝 **ログが明確**：絵文字と明確な提示情報を使用
- ⚡ **タイムアウト制御**：10秒のネットワークリクエストタイムアウトを設定
- 🔍 **デバッグが容易**：JSONデータをファイルに保存することを選択可能
- ✅ **ステータスコードを返す**：成功時は0、失敗時は1を返す
- 🚀 **依存関係なし**：Python標準ライブラリのみを使用、サードパーティパッケージのインストール不要

**使用前の準備**：
1. ✅ **追加依存関係のインストール不要**：スクリプトはPython標準ライブラリのみを使用
2. 変数設定でパラメータを追加：`access_token`
3. ユーザーが通知ルールでFeishuボットの実際のトークンを入力     

## 🔧 トラブルシューティングガイド

### 📋 クイックチェックリスト

スクリプト通知が動作しない場合は、以下の順序でチェックしてください：

1. **基本チェック**
   - [ ] スクリプトの構文は正しいか？
   - [ ] Pythonバージョンはサポートされているか？（Python 3.6+を推奨）
   - [ ] タイムアウト時間の設定は合理的か？

2. **権限チェック**
   - [ ] スクリプトに実行権限があるか？
   - [ ] Nightingaleサービスがスクリプトファイルにアクセスできるか？

3. **データチェック**
   - [ ] 変数設定は正しいか？
   - [ ] ユーザーは必要なパラメータを入力したか？

### 🐛 よくある問題の解決策

#### 問題1：スクリプト実行タイムアウト ⏰
**症状**：ログにスクリプト実行タイムアウトと表示される
**原因**：
- スクリプトの実行時間が設定されたタイムアウト制限を超えた
- ネットワークリクエストの応答が遅い

**解決策**：
```bash
# 1. タイムアウト時間を適切に調整
# 画面でタイムアウト時間を5000から15000（15秒）に調整

# 2. スクリプト内のネットワークリクエストタイムアウトを最適化
# urllib.request.urlopen()でタイムアウトを設定
with urllib.request.urlopen(req, timeout=5) as response:  # 5秒のタイムアウトを設定
    pass
```

#### 問題2：スクリプトがデータを受け取らない 📨
**症状**：スクリプトは実行されたが、データを処理していない
**デバッグ方法**：
```python
# スクリプトの先頭にデバッグコードを追加
import sys
import json

try:
    payload = json.load(sys.stdin)
    # 受け取ったデータをファイルに書き込み
    with open('/tmp/debug_payload.json', 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print("データは /tmp/debug_payload.json に保存されました")
except Exception as e:
    print(f"データの読み取りに失敗しました: {e}")
```

#### 問題3：パラメータがスクリプトに渡されない ⚙️
**症状**：`params`が空または期待されるパラメータが不足
**チェック手順**：
1. スクリプト通知チャネル設定で、パラメータ識別子（`access_token`など）が追加されていることを確認
2. 通知ルール設定で、ユーザーが対応するパラメータの値を入力したことを確認
3. スクリプトでパラメータを出力して確認：
```python
params = payload.get('params', {})
print(f"受け取ったパラメータ: {params}")
```

#### 問題4：ネットワークリクエスト失敗 🌐
**症状**：スクリプトは正常に実行されるが、通知が送信されない
**調査方法**：
```python
import urllib.request
import json
from urllib.error import URLError, HTTPError
import socket

try:
    # リクエストデータを準備
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json;charset=utf-8'}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        response_data = response.read().decode('utf-8')
        print(f"HTTPステータスコード: {response.status}")
        print(f"応答内容: {response_data}")
        
        if response.status != 200:
            print("❌ APIアドレスとパラメータが正しいかチェックしてください")
            
except socket.timeout:
    print("❌ ネットワークリクエストがタイムアウトしました。ネットワーク接続をチェックしてください")
except HTTPError as e:
    print(f"❌ HTTPリクエストが失敗しました: {e.code} {e.reason}")
except URLError as e:
    print(f"❌ ターゲットサーバーに接続できません: {e.reason}")
```

### 🧪 スクリプトの手動テスト

以下のコマンドを使用してあなたのスクリプトを手動でテストしてください：

```bash
echo '{"event":{"rule_name":"テストアラート"},"tpl":{"title":"テストタイトル","content":"テスト内容"},"params":{"access_token":"your_token"},"sendtos":["テストユーザー"]}' | python3 /path/to/your/script.py
```

### 🆘 まだ解決できませんか？

上記の手順に従っても問題を解決できない場合は、以下の情報を収集してサポートを求めてください：

1. **スクリプトの内容**（トークンなどの機密情報を隠す）
2. **エラーログ**の完全な情報
3. **テストコマンド**の実行結果
4. **システム環境**情報（Pythonバージョン、オペレーティングシステムなど）

これにより、技術サポート担当者が問題をより迅速に特定し、解決することができます。