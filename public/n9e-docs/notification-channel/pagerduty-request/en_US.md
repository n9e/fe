# PagerDuty Configuration Guide

Next-level Incident Management powered by AI

## Prerequisites
- Registered PagerDuty account and obtained an API Key
- Ensure the Nightingale system can access the api.pagerduty.com domain

## Configuration Steps
1. Obtain a user or account API Key
   - Sign in to the PagerDuty console
   - Click the avatar in the top-right corner, then go to My Profile > User Settings > API Access
   - It is recommended to create a user with the "Administrator" or "Scheduling Administrator" role and use that user's API Key for the integration. If there are no special requirements, you may create a read-only API Key, but ensure the key has permissions to access the required resources.

Reference:

https://support.pagerduty.com/main/docs/api-access-keys#section-generating-a-general-access-rest-api-key