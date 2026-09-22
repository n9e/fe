# Slack Webhook setup guide

Send alerts through a Slack app's Incoming Webhook. A webhook URL points to one channel and is filled in the notification rule, so one Slack Webhook media type can post to any number of channels (same as DingTalk robots). A built-in media type named SlackWebhook already exists, so you usually do not need a new one.

## Create a webhook

1. Open https://api.slack.com/apps, click **Create an App** → **From scratch** (or **Blank app**), enter an app name and pick the workspace
2. In the app settings open **Incoming Webhooks** and turn on **Activate Incoming Webhooks**
3. Click **Add New Webhook**, pick the channel that should receive alerts and authorize (you must be a member of a private channel)
4. Copy the generated URL, which looks like `https://hooks.slack.com/services/T.../B.../...`

## Fill in the notification rule

| Field | Description |
|---|---|
| Webhook URL | The URL copied above. It is a credential and is masked in notification records. Click the field to pick a URL other rules already use (shown as name and masked URL); the whole group of params is filled in |
| Name | A recognizable name, ideally the channel name; notification records and the URL field's dropdown show it |

## Media type settings (optional)

Only proxy, timeout and retries. Webhooks of new Slack apps ignore name and icon overrides; messages show the app's name and icon, which you can change under **Basic Information → Display Information** in the app settings.

## FAQ

- **invalid_token**: the token in the URL is wrong, copy the URL again
- **no_service**: the webhook was removed or disabled, add a new one on the Incoming Webhooks page
- **channel_not_found / channel_is_archived**: the channel bound to the webhook was deleted or archived
- **action_prohibited**: a workspace admin restricted posting to this channel
- **Timeout**: Nightingale cannot reach Slack, set a proxy under the media type's Advanced settings
- **429**: rate limited (about 1 message per second per channel), retried automatically according to Retry-After
