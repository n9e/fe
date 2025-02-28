This document explains how to use HTTP configuration in alert notification channels. It covers how to send alert messages to DingTalk or other custom notification channels by configuring custom request URLs, headers, parameters, and bodies. It also explains how to use variables like `{{$event}}`, `{{$tpl}}`, `{{$params}}`, and `{{$sendto}}` in these configurations to send different notification content.

## I. Configuration Overview

When setting up HTTP notification channels, the main configuration items typically include:

1. **URL**
2. **Request Header**
3. **Query Parameters / Request Parameters**
4. **Request Body**

> All four configurations support the use of variables: `{{$event}}`, `{{$tpl}}`, `{{$params}}`, and `{{$sendto}}`.

Variable Explanations

1. $tpl
- Represents the rendered text template content, typically the final message text to be sent. Users can create templates in message template management, and the message template will first generate this text based on event content into the $tpl variable, which can then be referenced through $tpl.
- If using `{{$tpl.key}}` variables, the message template needs to be configured with corresponding key values. For example, in DingTalk robot message templates, you need to configure `title` and `content` key values, so you can use `{{$tpl.title}}` and `{{$tpl.content}}` in $tpl.

2. $params
- Represents custom parameters that can be used in certain configuration items, such as `{{$params.access_token}}`, `{{$params.token}}`, etc.
- These parameter values can be configured by users in notification rules and dynamically passed during actual sending. For example, a DingTalk notification channel can use different token values based on user configuration to enable sending through different DingTalk group robots.
- When using `{{$params.xxx}}`, you need to add the parameter identifier `xxx` in "Variable Configuration", and users will fill in the value of `xxx` in the notification rules. The user-configured `xxx` value will ultimately replace it in the URL.

3. $sendto
- Represents the target address or list for this notification, such as phone numbers, email addresses, personal IM tokens, etc.
- Can be used in request body, URL, request headers, or any position to distinguish different sending targets.
- When using `{{$sendto}}`, you need to configure user contact information in "Variable Configuration". The $sendto variable will ultimately be replaced with actual contact information based on user configuration.

4. $event
- Represents the alert event object, suitable for scenarios where you want to directly reference original event data or perform more flexible concatenation.

Additional configurations include:

- Request timeout, retry count, concurrency, retry interval, etc.
- Whether to skip certificate verification
- Proxy settings, etc.

When executing alert notifications, the system will make one or more HTTP calls based on these configurations to push alert information to third-party platforms.

## II. Detailed Configuration Explanation

### 1. URL

**Purpose**: Target notification interface address, supports dynamic variable replacement.  
**Configuration Example**

```text
https://oapi.dingtalk.com/robot/send?access_token={{$params.access_token}}
```

If using the variable `$params.access_token`, you need to add the parameter identifier `access_token` in "Variable Configuration", and users will fill in the `access_token` value in notification rules. The user-configured `access_token` value will ultimately replace it in the URL.

**Notes**

- Request URLs for different platforms or interfaces can be written here, such as DingTalk robots, WeCom robots, Slack Webhooks, etc.

### 2. Request Header

**Purpose**: Define HTTP request header information, such as authentication credentials, content type, etc.  
**Configuration Example**

| Parameter Name  | Parameter Value        |
| -------------- | --------------------- |
| `Content-Type` | `application/json`    |
| `Authorization`| `Bearer {{$params.token}}` |

**Notes**

- Some platforms require authentication information in headers or specific `Content-Type` settings.
- Additional fields can be added for custom headers.

### 3. Query Parameters / Request Parameters

**Purpose**: Pass lightweight data through URL parameters.  
**Configuration Example**

| Parameter Name | Parameter Value     |
| ------------- | ------------------ |
| `access_token`| `your-access-token`|

**Notes**

- Parameters attached to URL query strings (`?key=value`) can be configured here or written directly in the URL.
- To pass variables as query params, you can use either `{{$params.xxx}}` format or combine parts of `{{$event}}`, `{{$tpl}}`, `{{$sendto}}`.

### 4. Request Body

**Purpose**: Transfer structured notification content (such as alert details in JSON format).  
**Configuration Example**

```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "{{$tpl.title}}",
    "text": "{{$tpl.text}}"
  },
  "at": {
    "atMobiles": ["{{$params.ats}}"],
    "isAtAll": false
  }
}
```

**Notes**

- Send in JSON format (common in DingTalk, WeCom robots) or form format (application/x-www-form-urlencoded).
- Variables like $event, $tpl, $params, $sendto can be directly embedded in the request body for dynamic replacement.
- $tpl typically represents the text content after alert template rendering; $sendto can represent the target recipient (such as phone number, WeCom account, etc.).

## III. Example: Sending to DingTalk Robot

The following example demonstrates how to configure sending alert messages to a DingTalk group robot. The DingTalk robot's access_token and @ information for specific phone numbers are passed through configuration rules into the $params variable, then referenced in the request body using $params.access_token and $sendto variables.

1. Variable Configuration   
Add parameter identifiers `access_token` and `ats` in variable configuration

2. URL

```
https://oapi.dingtalk.com/robot/send?access_token={{$params.access_token}}
```

3. Request Header

| Parameter Name | Parameter Value     |
|---------------|-------------------|
| `Content-Type`| `application/json`|

4. Request Parameters
| Parameter Name | Parameter Value     |
|---------------|-------------------|
| `access_token`| `your-access-token`|

5. Request Body

```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "{{$tpl.title}}",
    "text": "{{$tpl.text}}"
  },
  "at": {
    "atMobiles": ["{{$params.ats}}"],
    "isAtAll": false
  }
}
```

In this example:

- {{$params.access_token}} is replaced with the actual DingTalk group robot access_token.
- {{$params.ats}} is replaced with the actual phone number to @ in the DingTalk group.
- {{$tpl.title}} will be the final alert message title after rendering, such as "CPU Usage Exceeds Threshold".
- {{$tpl.text}} will be the final alert message text after rendering, such as "CPU Usage Exceeds Threshold, Trigger Time: 2024-01-01 12:00:00".
