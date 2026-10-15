# Splunk On-Call

Sends alerts to Splunk On-Call (formerly VictorOps) through the REST endpoint integration to page the on-call team; when an alert recovers, its incident is resolved. The API key of the REST integration is set in the media type; the routing key is filled in the notification rule.

## Before you start

1. You need a Splunk On-Call account; a 14-day trial is available from [Splunk free trials](https://www.splunk.com/en_us/download/on-call.html).
2. Open **Integrations → 3rd Party Integrations → REST - Generic** and click **Enable Integration** if it is not enabled yet. The **URL to notify** looks like `https://alert.victorops.com/integrations/generic/20131114/alert/<API key>/$routing_key`; the part after `/alert/` is the **API key** (the eye icon reveals it, the copy icon copies the whole URL).

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/vendor-rest.png' />

3. Under **Settings → Routing Keys**, click **Add Key**, enter a key (e.g. `n9e`) and pick the escalation policy (the team on call) it routes to. Alerts that match no routing key go to the **Default Routing Policy**. Routing changes may take up to 10 minutes to propagate.

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/vendor-routing-key.png' />

## Add the media type

Under **Alerts & Notifications → Media types**, pick **Splunk On-Call** on the left.

<img width='60%' src='/n9e-docs/notification-channel/splunk_oncall-request/types.en_US.png' />

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/form.en_US.png' />

- **API key**: the REST integration key; `{{.variable_name}}` references are supported.
- **Severity to message type**: defaults S1→CRITICAL, S2/S3→WARNING. CRITICAL opens an incident; whether WARNING opens one depends on your Splunk On-Call settings; INFO only adds a timeline event.
- **Advanced settings**: API URL, proxy, timeout and retries. Pasting the full URL from the integration page into the API URL also works.

## Test

Click **Test**, enter a routing key and send. **Also test recovery (resolve the incident)** is checked by default: the same test incident is opened and then resolved, and the result lists both sends.

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/test.en_US.png' />

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/test-result.en_US.png' />

## Use it in a notification rule

<img width='100%' src='/n9e-docs/notification-channel/splunk_oncall-request/rule.en_US.png' />

- **Routing Key**: the key only; `{{.variable_name}}` is supported.
- **Name**: shown in notification records and used to reuse the key; without it, records show the routing key.
- **Message template**: pick a Splunk On-Call template; `title` is the incident's display name and `content` the detailed message.

## What the on-call team sees

Each alert uses its event hash as `entity_id`: the firing and repeated notifications land on the same incident, and on recovery a `RECOVERY` with the same `entity_id` resolves it (Resolved by SYSTEM). The incident carries an **Event details** annotation that links back to the event in Nightingale. The timeline below shows one alert from trigger to automatic resolution:

<img width='50%' src='/n9e-docs/notification-channel/splunk_oncall-request/vendor-incident.png' />

## Troubleshooting

- HTTP 404: the API key is wrong, or the key of the REST integration was revoked (Revoke API Key).
- Other 4xx: check the routing key in the rule and that the REST integration is enabled.
- `result: failure`: follow the message in the error.
- The alert reaches the wrong team: check the escalation policy bound to the routing key; new or changed routing keys take up to 10 minutes to apply.

Reference: [REST endpoint integration](https://help.splunk.com/en/splunk-observability-cloud/splunk-on-call/integrations-with-splunk-on-call/rest-endpoint-integration-for-splunk-on-call).
