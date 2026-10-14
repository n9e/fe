# Microsoft Teams

Create a Teams workflow using **When a Teams webhook request is received**, allow **Anyone**, and configure the action that posts a card to a channel or chat. Copy the complete URL, including its query string. Nightingale sends an Adaptive Card without requiring a JSON body template.

## Media type

Proxy, timeout and retry settings are shared by all rules. Webhook URLs belong to notification rules so the same media type can reach different workflows. Assign suitable workflow owners or co-owners to keep the workflow available.

## Notification rule

- **Webhook URL**: complete signed URL; supports `{{.variable_name}}` references.
- **Name**: displayed in notification records and used to reuse the webhook.
- **Message template**: select Microsoft Teams. The editable `content` field contains notes and extra labels by default and continues to support Markdown.

The card supplies a tinted status header, rule title, target and trigger value, or duration on recovery. Times follow the Teams viewer's timezone. View alert, Silence 1h and View graph use separate buttons. Recovery hides Silence 1h; View graph appears only for Prometheus events. Buttons require a valid site URL.

## Testing

Enter a webhook URL in the test dialog and choose a firing or recovered event. Success acknowledges the webhook submission. Check Power Automate run history if no card appears in Teams.

Bodies longer than 4000 characters are truncated; the complete card must fit within 28 KB. Rate limits and temporary server failures are retried. Workflows requiring Microsoft Entra bearer tokens are not supported; use an Anyone workflow with a signed URL.

Sources: [Workflows webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook), [Adaptive Cards](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using).

## First-time setup shortcut

Open **Workflows** from the target channel's menu, select **Send webhook alerts to a channel**, confirm the team and channel, name and save the workflow, then use **Copy webhook link**. Sign in to the Teams connection if prompted.

If Sign in / Save remains unavailable and requests report `UserConsentMissing`, open [Power Automate](https://make.powerautomate.com), complete the account's first-use **Get started** step, then reopen the template in Teams.
