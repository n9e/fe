# Mattermost Webhook setup guide

Send alerts through a Mattermost Incoming Webhook. A webhook URL points to one channel and is filled in the notification rule, so one Mattermost Webhook media type can post to any number of channels (same as DingTalk robots). A built-in media type named MattermostWebhook already exists, so you usually do not need a new one.

## Create a webhook

1. Make sure an admin has turned on **Enable incoming webhooks** under **System Console → Integrations → Integration Management** (on by default)
2. In Mattermost open the top-left menu → **Integrations** → **Incoming Webhooks** → **Add Incoming Webhook**
3. Enter a title, pick the channel that should receive alerts and save
4. Copy the generated URL, which looks like `https://mattermost.example.com/hooks/<id>`

## Fill in the notification rule

| Field | Description |
|---|---|
| Webhook URL | The URL copied above. It is a credential and is masked in notification records. Click the field to pick a URL other rules already use (shown as name and masked URL); the whole group of params is filled in |
| Name | A recognizable name, ideally the channel name; notification records and the URL field's dropdown show it |

## Media type settings (optional)

- **Display name** and **Icon**: override the sender name and avatar; the icon is an image URL or an emoji code such as `:bell:`. An admin must turn on **Enable integrations to override usernames** and **Enable integrations to override profile picture icons** in System Console, otherwise they are ignored
- **Advanced settings**: proxy, timeout and retries. Turn on **Skip certificate verification** for a self-hosted Mattermost with a self-signed certificate

## FAQ

- **web.incoming_webhook.invalid.app_error**: the webhook URL is wrong or the webhook was deleted
- **web.incoming_webhook.disabled.app_error**: an admin turned off incoming webhooks
- **Certificate error (x509)**: the server uses a self-signed certificate, turn on skip certificate verification in the media type's Advanced settings
- **Timeout**: Nightingale cannot reach Mattermost, check the network or set a proxy under the media type's Advanced settings
