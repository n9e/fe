# Jira configuration guide

When an alert fires, an issue is created in a Jira project; when it recovers, the same issue gets a comment and is closed automatically. While an alert is firing there is only one issue for it: repeated notifications never create duplicates.

## Prerequisites

- A Jira Cloud site (an address like `https://your-domain.atlassian.net`)
- Nightingale can reach the site, and also `api.atlassian.com` when using a scoped token

## Steps

### 1. Create a service account and a token (recommended)

1. Open admin.atlassian.com → **Directory** → **Service accounts**, create a service account and give it the **User** role for Jira
2. On the service account page open **Credentials** and create an **API token**, granting `read:jira-work` and `write:jira-work` (`read:jira-user` is optional and only used to show the account name)
3. Copy the token (it is shown only once) and note the service account's email (like `xxx@serviceaccount.atlassian.com`)

A personal account also works: create a token at https://id.atlassian.com/manage-profile/security/api-tokens. Jira Cloud API tokens expire after at most 1 year; notifications fail once the token expires.

### 2. Fill in the media type

| Field | Description |
|---|---|
| Site URL | The address you open Jira with in the browser, without `/rest/api` |
| Token type | Service-account tokens and tokens created with **Create API token with scopes**: choose "Scoped API token". Tokens created with **Create API token**: choose "Classic API token" |
| Email / API token | Email of the account that owns the token, and the token |
| Cloud ID | Usually leave empty: it is fetched from the site URL automatically |

Then click **Check credentials** to see whether the credentials, account, deployment type and permissions are all fine. Missing permissions are listed there.

### 3. Pick the project in a notification rule

Select this media type in a notification rule, then:

- **Project** and **Issue type**: pick from the dropdowns; any existing issue type of the project works
- **On recovery**: defaults to "Close issue", i.e. comment and move the issue to a Done status automatically, no transition name needed
- **Advanced**: reopen, priority mapping, labels, custom fields and so on, as needed

**Test** in the rule creates a real issue and, by default, tests the recovery too.

## FAQ

- **401**: check that you entered the email (not a user name), that the token has not expired, and that the token type matches the token
- **403**: the account lacks Browse projects, Create issues, Add comments or Transition issues in the project
- **400 + a field name**: the issue type has a required field, fill it in the rule's Custom fields; or the issue type screen has no priority field, clear the priority mapping
- **Commented but not closed**: the workflow has no transition straight to Done; set a close transition in the rule
