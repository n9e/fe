# LINE

Sends alerts to users, group chats or multi-person chats from a LINE Official Account through the Messaging API. LINE Notify was shut down in March 2025, so the Messaging API is the only option. The channel access token is set in the media type; the recipient ID is filled in the notification rule.

## Before you start

1. Sign up for a [LINE Business ID](https://account.line.biz/signup) with an email address or a LINE account, and register as a developer in the [LINE Developers Console](https://developers.line.biz/console/).
2. Create a LINE Official Account. Messaging API channels can no longer be created directly in the Developers Console; create the official account in [LINE Official Account Manager](https://manager.line.biz/) first. **Creating an official account with a new Business ID requires SMS verification with a phone number.**
3. In Official Account Manager, open the account's **Settings → Messaging API**, click **Enable Messaging API** and choose a provider. The matching channel then appears in the Developers Console.
4. In the Developers Console, open the channel's **Messaging API** tab and issue a **Channel access token (long-lived)**.
5. Have recipients scan the QR code on the **Messaging API** tab with the LINE app to add the official account as a friend. To post to a group, invite the official account (allow it to join groups in the account settings).
6. Get the recipient ID: your own user ID is under the channel's **Basic settings → Your user ID**; IDs of other users and groups come from `source.userId` / `source.groupId` in webhook events. An ID starts with `U` (user), `C` (group chat) or `R` (multi-person chat) followed by 32 hexadecimal characters. It is **not** the LINE ID shown in the app.

## Add the media type

Under **Alerts & Notifications → Media types**, pick **LINE** on the left.

<img width='60%' src='/n9e-docs/notification-channel/line-request/types.en_US.png' />

<img width='100%' src='/n9e-docs/notification-channel/line-request/form.en_US.png' />

- **Channel access token**: `{{.variable_name}}` references are supported.
- **Advanced settings**: API URL, proxy, timeout and retries. If Nightingale cannot reach `api.line.me` directly, set a proxy here; the media type only uses the proxy configured here and ignores environment variables such as `https_proxy`.

Before saving you can click **Test** and enter a recipient ID to send a real message.

## Use it in a notification rule

<img width='100%' src='/n9e-docs/notification-channel/line-request/rule.en_US.png' />

- **Recipient ID**: a user, group or multi-person chat ID; `{{.variable_name}}` is supported.
- **Name**: shown in notification records and used to reuse the ID; without it, records show only the last 4 characters.
- **Message template**: pick a LINE template; the body key is `content`, plain text.

## What recipients see

The message is one text: a title with a severity symbol, the rendered template and a link to the event. Beyond 5000 characters the content is truncated and the link is kept. Every notification carries a retry key, so a retry after a timeout or server error is not delivered twice.

## Troubleshooting

- 401 `Authentication failed`: the channel access token is wrong or expired; issue a new one.
- `Failed to send messages`: the recipient ID is wrong, the user has not added the official account as a friend, or the official account is not in that group.
- `You have reached your monthly limit.`: the official account has used up its monthly message quota (push messages count against it; the free quota depends on region and plan).
- Timeouts or "cannot reach LINE": check the network and set a proxy in the advanced settings if needed.

References: [send push message](https://developers.line.biz/en/reference/messaging-api/#send-push-message), [get user IDs](https://developers.line.biz/en/docs/messaging-api/getting-user-ids/).
