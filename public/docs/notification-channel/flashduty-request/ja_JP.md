# Flashduty 設定ガイド

Flashdutyは、企業向けのオールインワンアラート対応プラットフォームで、webhookを通じてアラートイベントを受信・処理することができます。本文では、Flashdutyでアラート通知を受信するための設定方法について説明します。

## 前提条件

- Flashdutyアカウントを登録し、ワークスペースを作成していること
- Nightingaleシステムがapi.flashcat.cloudドメインにアクセスできること

## 設定手順

### 1. 統合プッシュURLの取得

以下の手順で統合プッシュURLを取得できます：
1. "統合センター => [統合リスト](https://console.flashcat.cloud/settings/source/alert)"に移動
2. "アラートイベント"タブを選択
3. "Nightingale"統合を追加してクリックし、設定
4. 保存後、プッシュURLを取得します。URLの形式は https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx となります

### 2. プッシュURLの設定
取得したプッシュURLをFlashduty URLに設定します。
- URL：取得したプッシュURLを入力
- Proxy：プロキシ経由でFlashdutyにアクセスする必要がある場合、プロキシアドレスを入力

## よくある問題のトラブルシューティング

アラート通知が受信できない場合は、以下の手順で確認してください：

1. プッシュURLが正しく設定されているか確認
2. ネットワーク接続を確認し、api.flashcat.cloudにアクセスできることを確認

問題が解決しない場合は、[テクニカルサポート](https://flashcat.cloud/contact/)にお問い合わせください。