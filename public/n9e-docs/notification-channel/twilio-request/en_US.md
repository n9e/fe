# Twilio SMS and voice calls

Choose SMS or voice in the media type. To send both, create two Twilio media types with different modes and reference both in the notification rule.

## Configuration

- **Account SID / Auth token**: Twilio account credentials; support `{{.variable_name}}` references.
- **SMS**: supply a Twilio sender number, alphanumeric sender ID or Messaging Service SID. This integration sends SMS to phone numbers, not WhatsApp or other channels.
- **Voice**: supply a Twilio From number in E.164 format. Nightingale sends inline TwiML with `<Say>`; no externally hosted TwiML is required.
- **Voice / Language**: default to `woman` and `en-US`. For other languages, select a matching voice and language from the Twilio supported list and update both fields.
- **Network settings**: proxy, timeout and rate limit retry settings. Zero retries disables retries.

## Recipients and templates

Select users or teams in the notification rule. Their profile phone numbers must use E.164 format, such as `+14155552671`. All numbers are validated before sending; duplicate numbers are sent only once.

Select the Twilio template with a plain-text `content` field. The default includes severity, firing/recovery status, rule, target and value. Content must contain 1–1600 characters; XML-escaped voice TwiML must fit within 4000 characters. Keep SMS short to limit segmentation and charges.

## Testing and results

The test dialog uses selected users or teams and the chosen firing/recovery event. Running it submits real SMS or call requests.

Success means Twilio accepted the request and includes its Message SID or Call SID. Check the Twilio console for final delivery or call status. Other recipients are still attempted after an individual failure, with accepted results preserved.

Only explicit HTTP 429 rejections are retried. Timeouts, 5xx responses and incomplete responses are not automatically retried because the original request may already have created a billable message or call. Configure account permissions, verified recipients for trial accounts and destination permissions in Twilio as appropriate.

Sources: [Message API](https://www.twilio.com/docs/messaging/api/message-resource), [Call API](https://www.twilio.com/docs/voice/api/call-resource), [Say voices and languages](https://www.twilio.com/docs/voice/twiml/say).

New trial accounts can restrict SMS bodies to Twilio-provided examples. Testing complete alert texts requires an account that permits custom SMS bodies. Voice trials support `<Say>` but still enforce destination, recipient and API restrictions. See [Twilio trial restrictions](https://www.twilio.com/docs/usage/trials).
