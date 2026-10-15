# ntfy

[ntfy](https://ntfy.sh) is an open-source push service: use the public ntfy.sh server or host your own. The server and authentication are set in the media type; the topic is filled in the notification rule.

## Before you start

- With the public ntfy.sh server no account is needed; just pick a topic name. **On a public server anyone who knows the topic can read it**, so use a name that is hard to guess (e.g. `ops-alerts-7f3k9q`).
- To host your own server, see the [ntfy installation guide](https://docs.ntfy.sh/install/); if it requires authentication, create a user or an access token (starting with `tk_`) on the server.
- Recipients subscribe to the same topic in the ntfy [Android / iOS app](https://docs.ntfy.sh/subscribe/phone/) or in the web app (e.g. `https://ntfy.sh/<topic>`).

## Add the media type

Nightingale ships with a built-in ntfy media type; edit it from the list under **Alerts & Notifications → Media types**, or pick **ntfy** on the left to add another one (for example one for the public server and one for your own).

<img width='60%' src='/n9e-docs/notification-channel/ntfy-request/types.en_US.png' />

<img width='100%' src='/n9e-docs/notification-channel/ntfy-request/form.en_US.png' />

The built-in media type works with every field left empty: it publishes to `https://ntfy.sh` without authentication.

- **Server URL**: root URL of a self-hosted server, e.g. `https://ntfy.example.com`, without the topic.
- **Access token**: created in the ntfy account settings, starts with `tk_`.
- **Username / Password**: an alternative to the access token.
- **Advanced settings**: proxy, timeout and retries; enable "Skip TLS certificate verification" for a self-hosted server with a self-signed certificate.

## Test

Click **Test**, enter a topic and send, then check the app or web page subscribed to that topic.

<img width='100%' src='/n9e-docs/notification-channel/ntfy-request/test.en_US.png' />

<img width='100%' src='/n9e-docs/notification-channel/ntfy-request/test-result.en_US.png' />

## Use it in a notification rule

<img width='100%' src='/n9e-docs/notification-channel/ntfy-request/rule.en_US.png' />

- **Topic**: the topic name only (1 to 64 letters, digits, underscores or dashes), not the full URL; `{{.variable_name}}` is supported.
- **Name**: shown in notification records and used to reuse the topic; without it, records show only the last 4 characters of the topic.
- **Message template**: pick an ntfy template; the body key is `content`, plain text.

## What recipients see

Priorities are fixed: S1→Max (5), S2→High (4), S3→Default (3), and recovery→Default (3). No severity mapping needs to be configured. Sound, vibration and do-not-disturb behavior depend on the recipient's client settings.

The title is `[S1] Triggered: <rule name>` with a severity icon. Tapping the notification or the **Event details** button opens the event; firing alerts also get a **Silence 1h** button. Content longer than 4096 bytes is truncated (ntfy turns longer messages into attachments). Below are an alert and its recovery in the ntfy web app:

<img width='80%' src='/n9e-docs/notification-channel/ntfy-request/vendor-delivered.png' />

## Troubleshooting

- `40101 unauthorized`: the server requires authentication; check the access token or the username and password.
- `40301 forbidden`: the user may not publish to this topic, or the topic is reserved by someone else.
- `42901` / `42908`: rate limited, or the daily message quota is used up.
- Certificate errors with a self-hosted server: enable "Skip TLS certificate verification" in the advanced settings.

Reference: [publishing to ntfy](https://docs.ntfy.sh/publish/).
