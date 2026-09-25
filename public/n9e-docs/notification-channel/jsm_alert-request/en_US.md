# JSM Alert configuration guide

Sends alerts to Jira Service Management (JSM) Operations (formerly Opsgenie): an alert is created in JSM when the alert fires and closed automatically on recovery. While the alert is not recovered, repeated notifications only increase the count of the same JSM alert instead of creating new ones. A built-in media type named JSM Alert already exists, so you usually do not need to create one.

## Create an API integration

1. In JSM open the team that should receive alerts (Teams → team → Operations)
2. Choose **Integrations** → **Add integration**, search for and select **API**
3. Give it a name (e.g. Nightingale), save, copy the **API Key** and make sure the integration is turned on

An API integration belongs to one team and its key decides who gets the alert, so the key is filled in the notification rule: one JSM media type can send to any number of teams.

## Fill in the notification rule

| Field | Description |
|---|---|
| API Key | The key copied above. It is a credential and is masked in notification records. Click the field to pick a key other rules already use (shown as name and last 4 characters); the whole group of params is filled in |
| Name | A recognizable name (e.g. the team name); notification records and the key field's dropdown show it |

The alert message comes from the template field `title` (max 130 characters) and the description from `content`; alert labels become JSM tags, and labels plus annotations go into details.

## Media type settings (optional)

**Severity to priority**: the JSM priority for each Nightingale severity, default S1→P1, S2→P2, S3→P3. JSM priorities are the same across the site, so this is set once on the media type for all rules.

The API URL defaults to `https://api.atlassian.com` and rarely needs changing; set a proxy under Advanced settings if Atlassian can only be reached through one.

## FAQ

- **401 / 403**: wrong API key
- **Integration is disabled**: the API integration is turned off in JSM. JSM still accepts the request but creates no alert; Nightingale reads the processing result and records the send as failed. Turn the integration on in the team's Integrations
- **422**: JSM rejected a field; the error names it
- **Test sends** wait until JSM has processed the request and show the alert id; by default the recovery is tested too, i.e. the alert is created and then closed
