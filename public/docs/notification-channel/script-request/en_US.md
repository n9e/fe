# Script Notification Configuration Guide
Script notification is an extremely flexible alert delivery method. If the existing notification channels provided by the Nightingale platform cannot meet your requirements, and configuring HTTP delivery methods (through custom URLs, request headers, request bodies, etc.) cannot connect to your company's notification channels, you may consider using script-based notification.

### How It Works
1. Nightingale generates an alert event
2. Nightingale serializes the alert event into JSON format
3. Nightingale calls your specified notification script and passes the JSON data via stdin
4. Your script processes this data and executes custom logic

Script notification can reuse Nightingale's built-in alert templates. The JSON data not only contains the original event information but also includes the rendered text results from the event and notification template, custom parameters, delivery targets, etc., eliminating the need to process template rendering logic in your script.

stdin data format is as follows:

```json
{
    "event": {}, // Original alert event data
    "events": [], // For aggregated alerts, contains multiple events, each with the same structure as event
    "tpl": { // Rendered message template results, users associate a notification template when configuring notification rules
        "title": "Alert title",
        "text": "Alert content"
    },
    "params": { // Custom parameters
        "access_token": "xxx",
        "ats": "xxx"
    },
    "sendtos": ["xxx", "xxx"] // List of delivery targets
}
```

### Variable Configuration
Used to configure authentication information or other necessary parameters required by the script.
1. Parameter Configuration $params

- Represents custom parameters that can be used in JSON data, such as `params.access_token`, `params.token`, etc.
- These parameter values can be configured by users in notification rules and then dynamically passed in during actual delivery. For example, a DingTalk notification channel can use different token values configured by users to send messages to different DingTalk group robots.
- When using `params.xxx`, you need to add the parameter identifier `xxx` in the "Variable Configuration", then users will fill in the value of `xxx` in the notification rule, and finally the user-configured `xxx` value will be replaced in the required places.

2. Contact Method $sendtos

- Represents the target address or list to which this notification will be sent, such as phone numbers, emails, personal tokens for IM, etc.
- When using `sendtos`, you need to configure user contact methods in the "Variable Configuration", and finally `sendtos` will be replaced with actual contact methods based on user-configured contact information.

### Script Configuration

#### Timeout
- Unit: milliseconds
- Purpose: Sets the maximum allowed execution time for the script
- Recommendation: Set a reasonable timeout based on script complexity to avoid excessive execution time

#### Script Type Selection
Two methods are provided to configure scripts:

- **Use Script**: Write or paste script content directly in the interface
- **Use Path**: Specify the path of an existing script file on the server

Note: If you choose the "Use Path" method, please ensure:
1. The script file exists at the specified path
2. The script has the correct execution permissions
3. The user running the service has permission to access the script

#### Script Examples
1. Below is a shell script example for processing alert events and sending them to Feishu
```bash
#!/bin/bash

# Function to extract JSON field values using grep and sed
get_json_value() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"$field\":[^,}]*" | sed -E 's/"[^"]*":"?([^",}]*)"?.*/\1/'
}

send_feishu() {
    # Read JSON from standard input
    payload=$(cat)
    
    # Extract token and content
    token=$(get_json_value "$(echo "$payload" | grep -o '"params":{[^}]*}')" "access_token")
    content=$(get_json_value "$(echo "$payload" | grep -o '"tpl":{[^}]*}')" "content")
    
    # If content is empty, use default value
    if [ -z "$content" ]; then
        content="No alert content found"
    fi
    
    # Build request message body
    message="{\"msg_type\": \"text\", \"content\": {\"text\": \"$content\"}}"
    
    if [ -n "$token" ]; then
        # Send HTTP request to Feishu
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$message" \
            "https://open.feishu.cn/open-apis/bot/v2/hook/$token")
        
        echo "Feishu notification result: token=$token response=$response"
    else
        echo "No valid Feishu robot access_token provided"
    fi
}

# Optional: Save input data for debugging
cat > .payload

# Process alert message
cat .payload | send_feishu
```     

2. 以下是一个Python脚本示例，用于处理告警事件并发送到飞书
```python
#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import sys
import json
import requests

def send_feishu(payload) -> None:
    """
    Send Feishu notification
    Args:
        payload: Dictionary containing alert information
    """
    try:
        event = payload.get('event', {})
        token = payload.get('params', {}).get('access_token')

        headers = {
            "Content-Type": "application/json;charset=utf-8"
        }

        # Build message content
        message = {
            "msg_type": "text",
            "content": {
                "text": payload.get('tpl', {}).get('content', 'No alert content found')
            }
        }

        if token:
            url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
            response = requests.post(
                url, 
                headers=headers, 
                json=message,
                timeout=5
            )
            print(f"Feishu notification result: token={token} status={response.status_code} response={response.text}")
        else:
            print("No valid Feishu robot access_token provided")

    except Exception as e:
        print(f"Failed to send Feishu notification: {str(e)}")


def main():
    payload = json.load(sys.stdin)
    # Optional: Write payload to file for debugging
    with open(".payload", 'w') as f:
        f.write(json.dumps(payload, indent=4))
    
    send_feishu(payload)

if __name__ == "__main__":
    main()
```     

### Troubleshooting

#### Common Issues and Solutions

1. **Script Execution Timeout**
   - Check if the script timeout setting is reasonable
   - Optimize script execution efficiency
   - Check for network request delays

2. **Script Permission Issues**
   - Ensure the script file has executable permissions (chmod +x)
   - Verify that the user running the service has read and execute permissions for the script file
   - Check access permissions for the directory containing the script

3. **Data Format Issues**
   - Ensure the script can correctly parse JSON input
   - Check if stdin data is complete
   - Verify that the JSON data format meets expectations

4. **Debugging Methods**
   - Add log outputs in the script
   - Save stdin data to a file for analysis
   - Use the following command to manually test the script:
    ```bash
     echo '{"event":{},"tpl":{"title":"test","content":"content"},"params":{"access_token":"xxx"}' | ./your_script.py
    ```

5. **Environment Dependency Issues**
   - Ensure required third-party libraries are properly installed
   - Check if the Python or other interpreter versions are compatible
   - Verify that system environment variables are correctly configured

If you encounter other issues, please check the system logs for detailed error information.
