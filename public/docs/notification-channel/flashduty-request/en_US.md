# Flashduty Configuration Guide

Flashduty is an all-in-one alert response platform for enterprises that can receive and process alert events via webhook. This article will guide you through configuring Flashduty to receive alert notifications.

## Prerequisites

- Have registered a Flashduty account and created a workspace
- Ensure the Nightingale system can access the api.flashcat.cloud domain

## Configuration Steps

### 1. Get Integration Push URL

You can obtain the integration push URL through the following steps:
1. Go to "Integration Center => [Integration List](https://console.flashcat.cloud/settings/source/alert)"
2. Select the "Alert Events" tab
3. Click to add "Nightingale" integration and configure it
4. After saving, get the push URL, which follows the format: https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx

### 2. Configure Push URL
Configure the obtained push URL in the Flashduty URL field.
- URL: Enter the obtained push URL
- Proxy: Enter the proxy address if you need to access Flashduty through a proxy

## Troubleshooting Common Issues

If you haven't received alert notifications, please check the following:

1. Verify if the push URL is correctly configured
2. Check network connectivity to ensure access to api.flashcat.cloud

If the issue persists, please contact [Technical Support](https://flashcat.cloud/contact/) for assistance.
