# Discord configuration guide

Alerts are posted through a Discord channel webhook. One webhook URL posts to one channel and the URL is filled in the notification rule, so a single Discord media type can post to any number of channels (the same way DingTalk robots work). A built-in media type named Discord already exists, so you usually do not need to create one.

## Create a webhook

1. In Discord open **Server Settings** → **Integrations** → **Webhooks** (requires the **Manage Webhooks** permission)
2. Click **New Webhook** and pick the channel that should receive alerts
3. Click **Copy Webhook URL** to get an address like `https://discord.com/api/webhooks/<id>/<token>`

## Fill in the notification rule

| Field | Description |
|---|---|
| Webhook URL | The URL copied above. It is a credential and is masked in notification records. Click the field to pick a URL other rules already use (shown as name and masked URL); the whole group of params is filled in |
| Name | A recognizable name; notification records and the URL field's dropdown show it |
| Send to | "Channel" for a normal channel. For a forum channel choose "New forum post" (one post per notification) or "Existing thread / forum post" |

## Media type settings (optional)

Display name, avatar URL and silent push are defaults for all rules; set a proxy under Advanced settings if Discord can only be reached through one.

## FAQ

- **10015 Unknown Webhook**: the webhook was deleted, create a new one
- **50027 Invalid Webhook Token**: the URL is incomplete or the webhook was reset
- **220001**: this is a forum channel, choose New forum post or Existing thread as the target
- **429**: rate limited, retried automatically according to Retry-After
