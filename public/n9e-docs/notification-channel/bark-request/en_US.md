# Bark

[Bark](https://github.com/Finb/Bark) is an iOS push app: once installed it generates a device key, and anything pushed with that key arrives on that iPhone. The server and its authentication are set in the media type; a device key belongs to one phone, so like a phone number it belongs to a person and each recipient fills it in their profile.

## Before you start

- Install Bark on the iPhone. The app shows a URL like `https://api.day.app/<device key>/your-message`; the middle part is the device key.
- Public server `https://api.day.app`: no sign-up needed, leave the media type empty.
- Self-hosted: deploy [bark-server](https://github.com/Finb/bark-server) and add your server in the Bark app. If basic authentication is on (`--user` / `--password`), fill in the username and password in the media type.

## Filling in the device key

Each recipient adds **Bark Device Key** in **Profile → Contacts**, entering only the key, not the whole URL. This contact is built in, so admins do not need to add it in the contact settings first; they can hide it there.

## Add the media type

Nightingale ships a built-in Bark media type: edit it in **Alert notification → Media types**, or select **Bark** on the left to create another one (for example one for the public server and one for a self-hosted server).

- **Contact**: defaults to Bark Device Key and rarely needs changing.
- **Server URL**: root address of a self-hosted server such as `https://bark.example.com`, without the device key; empty means `https://api.day.app`.
- **Username / Password**: fill in both when the self-hosted server uses basic authentication.
- **Sound**: a Bark sound name such as `alarm`; empty uses the sound chosen in the app.
- **Group**: groups the pushes in Notification Center.
- **Advanced settings**: proxy, timeout and retries; turn on "skip certificate verification" for a self-hosted server with a self-signed certificate.

## Test

Click **Test**, pick users or teams and send, then check the iPhones. Team members without a device key are listed in the result while the others still get the push.

## Use it in a notification rule

Select the Bark media type, pick users or teams, and choose the Bark message template (key `content`, plain text). Each recipient with a device key gets one push; duplicate keys are pushed once.

## What recipients see

Levels are fixed and need no configuration:

| Nightingale | Bark level | Effect |
| --- | --- | --- |
| S1 | timeSensitive | Time-sensitive, breaks through Focus |
| S2, S3 | active | Normal notification |
| Recovery | passive | Delivered silently, no sound or screen wake |

critical, which rings even when the phone is muted or in Do Not Disturb, is not used. The title is `[S1] Triggered: <rule name>`, the body is the rendered template (cut to fit Apple's 4 KB push limit), and tapping the notification opens the event details.

## Troubleshooting

- `no Bark device key in the profile of: ...`: the listed users have not filled in their Bark Device Key.
- `invalid Bark device key`: the whole URL or spaces were entered; keep only the device key.
- `400 failed to get device token`: the key is wrong or not registered on this server (for example the app uses the public server while the media type points at a self-hosted one).
- `418` / `401`: the self-hosted server requires authentication; check the username and password.
- `500 push failed: BadDeviceToken` / `Unregistered`: Apple no longer accepts the key; open the Bark app on the iPhone and copy it again.
- `429`: rate limited by the Bark server; it was retried, try again later.
- Notification records, errors and logs mask device keys: only the last 4 characters are shown, and keys shorter than 12 characters are hidden entirely.

Reference: [bark-server push API](https://github.com/Finb/bark-server/blob/master/docs/API_V2.md).
