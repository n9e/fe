# Pushover

Pushes alerts to phones and desktops through [Pushover](https://pushover.net). The application's API token is set in the media type; the user key or group key that receives the notifications is filled in the notification rule.

## Before you start

1. Sign up at [pushover.net](https://pushover.net/signup) and verify your email address. **Applications cannot be created before the email is verified.**
2. Create an application at [pushover.net/apps/build](https://pushover.net/apps/build): enter a name (it is shown on the notifications), accept the terms and click **Create Application**. The **API Token/Key** (30 letters or digits) on the application page is the token for the media type. All applications of an account share a free quota of 10,000 messages per month.

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/vendor-create-app.png' />

3. Each recipient finds their **User Key** at the top right of the Pushover dashboard. To notify a whole team, create a **Delivery Group** and use its group key.
4. Recipients need at least one device signed in to Pushover: the iOS or Android app, or the [desktop client](https://pushover.net/clients/desktop) in a browser. Without a device nothing is received. The clients have a 30-day trial, then a one-time purchase per platform.

## Add the media type

Under **Alerts & Notifications → Media types**, pick **Pushover** on the left.

<img width='60%' src='/n9e-docs/notification-channel/pushover-request/types.en_US.png' />

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/form.en_US.png' />

- **API token**: the application's token; `{{.variable_name}}` references are supported.
- **Severity to priority**: Pushover priority for each Nightingale severity. Defaults: S1→High (1), S2/S3→Normal (0). High bypasses the recipient's quiet hours; Emergency (2) repeats until someone acknowledges it in the app.
- **Emergency repeat interval / duration**: used by Emergency only; the interval is at least 30 seconds and the duration at most 10800 seconds (3 hours).
- **Sound**: e.g. `siren` or `pushover`; leave empty to use each recipient's default.
- **Advanced settings**: API URL, proxy, timeout and retries.

## Test

Click **Test** and enter a user key. A real message is sent with the current form values; there is no need to save first.

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/test.en_US.png' />

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/test-result.en_US.png' />

## Use it in a notification rule

In a notification config of the rule, pick this media type and the Pushover message template:

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/rule.en_US.png' />

- **User Key / Group Key**: one or more keys separated by commas (up to 50); `{{.variable_name}}` is supported.
- **Name**: shown in notification records and used to reuse the key; without it, records show only the last 4 characters of the key.
- **Message template**: pick a Pushover template; the body key is `content`, plain text.

## What recipients see

The title is `[S1] Triggered: <rule name>`, the message is the rendered template (up to 1024 characters), and an **Event details** link opens the event. Below are an alert sent with Emergency priority and its recovery:

<img width='100%' src='/n9e-docs/notification-channel/pushover-request/vendor-delivered.png' />

Recovery notifications always use Normal priority. When an alert whose severity maps to Emergency recovers, Nightingale first cancels the emergency repeats of that alert and then sends the recovery notification.

## Troubleshooting

- `application token is invalid`: the API token in the media type is wrong.
- `user identifier is not a valid user, group, or subscribed user key`: the key in the rule is wrong.
- HTTP 429: the application has used up its monthly message limit. As Pushover requires, 4xx errors are not retried; server errors are retried at least 5 seconds apart.

References: [Pushover Message API](https://pushover.net/api), [receipts and cancellation](https://pushover.net/api/receipts).
