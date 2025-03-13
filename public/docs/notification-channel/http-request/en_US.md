This document explains how to use HTTP configuration in alert notification channels to send alert messages to DingTalk or other custom notification channels through customized request URLs, headers, parameters, and bodies. It also demonstrates how to use variables such as `{{$event}}`, `{{$tpl}}`, `{{$params}}`, `{{$sendtos}}`, and `{{$sendto}}` in these configurations to achieve different notification content.

## I. Configuration Overview

When setting up HTTP notification channels, the main configuration items typically include:

1. **URL**
2. **Request Header**
3. **Query Parameters / Request Parameters**
4. **Request Body**

> All four configurations support the use of variables: `{{$event}}`, `{{$tpl}}`, `{{$params}}`, `{{$sendto}}`, `{{$sendto}}`.

Variable Descriptions:

1. $tpl
- Represents the rendered text template content, which is typically the final message text to be sent. Users can create templates in message template management, and the message template will first generate this text based on event content and write it to the $tpl variable, which can then be referenced through $tpl.
- If using `{{$tpl.key}}` variables, corresponding key values need to be configured in the message template. For example, in DingTalk robot message templates, `title` and `content` key values need to be configured, allowing the use of `{{$tpl.title}}` and `{{$tpl.content}}` in $tpl.

2. $params
- Represents custom parameters that can be used in various configuration items, such as `{{$params.access_token}}`, `{{$params.token}}`, etc.
- These parameter values can be configured by users in notification rules and dynamically passed during actual sending. For example, a DingTalk notification channel can use different token values configured by users to enable sending through different DingTalk group robots.
- When using `{{$params.xxx}}`, you need to add the parameter identifier `xxx` in "Variable Configuration". Users will then fill in the value for `xxx` in the notification rules, and the user-configured `xxx` value will be replaced in the URL.

3. $sendto
- Represents the target address or list for this notification, such as phone numbers, email addresses, or personal IM tokens.
- Can be used in request body, URL, request headers, or any other location to distinguish different sending targets.
- When using `{{$sendto}}`, user contact information needs to be configured in "Variable Configuration". The $sendto variable will ultimately be replaced with the actual contact information based on user configuration.

4. $sendtos
In some notification API channels that support multiple contact methods in a single request, such as Tencent SMS notification supporting multiple phone numbers like `"PhoneNumberSet": ["+8618501234444","+8618501234445"]`, we can configure it as follows to achieve sending to multiple phone numbers at once:
   ```json
   {
       "PhoneNumberSet": {{batchContactsJsonMarshal $sendtos}},
       "SignName": "",
       "SmsSdkAppId": "",
       "TemplateId": "",
       "TemplateParamSet": [
          "{{$tpl.content}}"
       ]
   }
   ```
5. $event
- Represents the alert event object, suitable for scenarios where direct reference to original event data or more flexible concatenation is needed.
Additional configurations include:

- Request timeout, retry count, concurrency, and retry interval
- SSL certificate verification skip option
- Proxy settings, etc.

When executing alert notifications, the system will make one or more HTTP calls based on these configurations to push alert information to third-party platforms.

## I. Detailed Configuration Explanation
### 1. URL
Purpose : Target notification interface address, supporting dynamic variable replacement. Configuration Example

```text
https://oapi.dingtalk.com/robot/send?access_token={{$params.access_token}}
```

If using the $params.access_token variable, you need to add the parameter identifier access_token in "Variable Configuration". Users will then fill in the access_token value in notification rules, and the user-configured access_token value will be replaced in the URL.

Notes

- Request addresses for different platforms or interfaces can be written here, such as DingTalk robots, WeChat Work robots, Slack Webhooks, etc.

### 2. Request Header
Purpose : Define HTTP request header information, such as authentication credentials, content type, etc. Configuration Example
 Parameter Name Parameter Value Content-Type

application/json Authorization

Bearer {{$params.token}}
Notes

- Some platforms require authentication information in headers or specific Content-Type specifications.
- Additional fields can be added for custom headers.
### 3. Query Parameters / Request Parameters
**Purpose**: Pass lightweight data through URL parameters.  
**Configuration Example**

| Parameters     | Values              |
| -------------- | ------------------- |
| `access_token` | `your-access-token` |

- Parameters to be appended to URL query strings ( ?key=value ) can be configured here or written directly in the URL.
- Variables can be passed as query parameters using the {{$params.xxx}} format.

### 4. Request Body
Purpose : Pass structured notification content (such as JSON format alert details). 
Configuration Example
```json
{
    "msgtype": "markdown",
    "markdown": {
        "title": "{{$tpl.title}}",
        "text": "{{$tpl.content}}\n{{batchContactsAts $sendtos}}"
    },
    "at": {
        "atMobiles": {{batchContactsJsonMarshal $sendtos}}
    }
}
```

**Notes**
- Body is sent in JSON format (commonly seen in DingTalk, WeChat Work robots).
- Variables like $event, $tpl, $params, $sendto, $sendtos can be directly embedded in the request body for dynamic replacement.
- $tpl typically represents the rendered alert template text content; $sendto can represent the notification target (such as phone numbers, WeChat Work accounts, etc.).

## III. Example: Sending to DingTalk Robot
The following example demonstrates how to configure sending alert messages to a DingTalk group robot. The DingTalk robot's access_token and @ phone number information are passed to the $params variable through rule configuration, and then referenced in the request body using $params.access_token and $sendto variables.

1. Variable Configuration Add parameter identifiers access_token and bot_name in variable configuration

```
https://oapi.dingtalk.com/robot/send
```

3. Request Header

| Parameter Name | Parameter Value |
|---------------|--------------------|
| `Content-Type` | `application/json` |

4. Request Parameters

| Parameter Name | Parameter Value |
|--------------|---------------------|
| `access_token` | `{{$params.access_token}}` |

5.Request Body

```json
{
    "msgtype": "markdown",
    "markdown": {
        "title": "{{$tpl.title}}",
        "text": "{{$tpl.content}}\n{{batchContactsAts $sendtos}}"
    },
    "at": {
        "atMobiles": {{batchContactsJsonMarshal $sendtos}}
    }
}
```

In this example:
- {{$params.access_token}} will be replaced with the actual DingTalk group robot access_token.
- {{$tpl.title}} renders to the final alert message title, e.g., "CPU Usage Exceeds Threshold".
- {{$tpl.text}} renders to the final alert message text, e.g., "CPU Usage Exceeds Threshold, Trigger Time: 2024-01-01 12:00:00".
- {{batchContactsAts $sendtos}} renders to add @ before phone numbers, e.g., "@12312312311 @12312312312".
- {{batchContactsJsonMarshal $sendtos}} renders to string array format ["12312312311","12312312312"].
