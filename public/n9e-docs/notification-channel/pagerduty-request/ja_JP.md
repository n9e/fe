# PagerDuty 設定ガイド

AI を活用した次世代のインシデント管理

## 前提条件
PagerDuty アカウントを登録し、API キーを取得していること
Nightingale システムが api.pagerduty.com ドメインにアクセスできることを確認すること

## 設定手順

1. ユーザーまたはアカウントの API キーを取得する
   - PagerDuty コンソールにサインイン
   - 右上のアバターをクリックし、My Profile > User Settings > API Access を選択
   - 「管理者 (Administrator)」または「スケジュール管理者 (Scheduling Administrator)」ロールのユーザーを作成し、そのユーザーの API キーを統合に使用することを推奨します。特に要件がなければ読み取り専用の API キーを作成しても構いませんが、必要なリソースにアクセスする権限があることを確認してください。

参照：

https://support.pagerduty.com/main/docs/api-access-keys#section-generating-a-general-access-rest-api-key