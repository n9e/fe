# Script Notification Configuration Guide

## 📖 What is Script Notification?

Script notification is a **highly flexible** alert delivery method provided by the Nightingale platform. Simply put, when the system triggers an alert, Nightingale will automatically call your custom script program to send notifications.

## 🚀 Beginner's Quick Start

If you are using script notification for the first time, we recommend following these steps:

### Step 1: Confirm if Script Notification is Needed
Script notification is suitable for the following scenarios:
- ✅ Your company uses notification tools not in Nightingale's built-in list (WeCom, DingTalk, etc. are already built-in)
- ✅ Complex data processing or format conversion is required
- ✅ Need to send to multiple different channels simultaneously

### Step 2: Prepare Testing Environment
1. **Test with simple script first** (copy the "Getting Started Example" from this document)
2. **Confirm data flow** (check if log file has content)
3. **Then modify for actual notifications** (change to Feishu/WeCom/internal IM, etc., for real notifications)

### Step 3: Configure Notification Channel
1. Create a "Script Notification" type notification channel in Nightingale interface
2. Configure necessary variables (like `access_token`)
3. Choose script configuration method (beginners should choose "Use Script" to write directly)

### Step 4: Test and Verify
1. Manually test the script (refer to testing methods at the end of this document)
2. Create test alert rules linked to this notification channel
3. Trigger alerts to verify if notifications work properly

> 💡 **Beginner Tip**: We strongly recommend first using the log recording script from the getting started example to test and confirm that data transfer is normal, then modify it to actual notification logic.

## 🔄 How It Works

Imagine this process:

1. **Monitoring System Detects Problem** → Nightingale detects alert event (e.g., server CPU usage exceeds 80%)
2. **Package Alert Information** → Nightingale organizes all information of this alert into a JSON format "package"
3. **Call Your Script** → Nightingale finds your specified script program and starts it
4. **Pass Data** → Nightingale passes the JSON "package" to your script through standard input (stdin)
5. **Script Processing** → Your script receives the data and sends notifications according to your logic (e.g., send to Feishu group)

> 💡 **Benefit**: Nightingale has already handled the rendering of alert templates. The data your script receives is already formatted, so you only need to focus on the "how to send" step.

## 📦 What Data Will Your Script Receive?

Nightingale will pass a JSON format data package to your script through standard input (stdin), containing the following information:

```json
{
    "event": {
        "rule_name": "High CPU Usage",
        // ... more raw data from alert events
    },
    "events": [
        // If it's aggregated alerts (multiple events sent together), multiple events will be included here
        // Each event has the same structure as the event above
    ],
    "tpl": {
        "title": "[Alert] High CPU Usage",
        "content": "Server web-01's CPU usage has reached 85.6%, exceeding the threshold of 80%. Please handle it promptly!"
        // This is the final text rendered by Nightingale based on alert templates, ready to use
    },
    "params": {
        "access_token": "your_feishu_bot_token",
        "webhook_secret": "your_secret_key"
        // Custom parameters you configured in the interface
    },
    "sendtos": ["138321xxxx", "135321xxxx"]
    // Who to send to, this list is determined by notification rules
}
```

> 💡 **Key Understanding**: The `tpl` section is the message content already rendered by Nightingale. You typically use this content directly for sending without needing to process templates again.

## ⚙️ Variable Configuration Details

When creating a script notification channel, you need to configure two types of variables:

### 1️⃣ Custom Parameters ($params)

**Purpose**: Store configuration information needed when the script runs, such as API keys, access tokens, etc.

**Example**:
- 🎯 **Scenario**: You want to send Feishu notifications and need the Feishu bot's access_token
- 📝 **Configuration Steps**:
  1. Add parameter identifier in "Variable Configuration": `access_token`
  2. When users configure notification rules, they will see they need to fill in the `access_token` value
  3. User enters the actual token: `cli_a12b34c56d78e90f`
  4. When the script runs, it can get this token through `params.access_token`

**Practical Application**:
```python
# Use this way in your script:
token = payload.get('params', {}).get('access_token')
url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
```

### 2️⃣ Send Targets ($sendtos)

**Purpose**: Define who or which groups the notification should be sent to.

**Example**:
- 🎯 **Scenario**: Send different alerts to different people
- 📝 **Configuration Logic**:
  1. In notification rules, administrator sets a certain alert to notify "John" and "Operations Group"
  2. System will convert "John" to his phone number based on user-configured contact methods (what to convert to is determined by contact methods in variable configuration)
  3. The `sendtos` array received by the script contains these actual phone numbers

**Practical Application**:
```python
# Iterate through send targets in your script:
for target in payload.get('sendtos', []):
    send_notification_to(target, message)
```

## 🛠️ Script Configuration Guide

### ⏰ Timeout Settings
- **Unit**: Milliseconds (1 second = 1000 milliseconds)
- **Purpose**: Prevent scripts from running too long and avoid system freezing
- **Recommended Values**:
  - Simple scripts: 5000 milliseconds (5 seconds)
  - Complex scripts: 10000 milliseconds (10 seconds)
  - With network requests: 15000 milliseconds (15 seconds)

### 📄 Script Configuration Methods

You can choose between two methods to configure scripts:

#### Method 1: Direct Script Writing (Recommended for Beginners)
- ✅ **Advantages**: Write directly in the interface, convenient for modification and debugging
- ✅ **Suitable for**: Short script content with simple logic
- 📝 **Operation**: Choose "Use Script", write or paste your script code in the text box

#### Method 2: Use Local Script Files
- ✅ **Advantages**: Suitable for complex scripts, can use IDE for development
- ✅ **Suitable for**: Large scripts that need to reference multiple files
- 📝 **Operation**: Choose "Use Path", enter the complete path of the script file

⚠️ **Notes for Using Path Method**:
1. **File Existence**: Ensure the script file is saved to the specified location on the server
2. **Execution Permission**: Run `chmod +x /path/to/your/script.py` to add execution permission to the script
3. **User Permission**: Ensure the user running Nightingale service can access this file
4. **Correct Path**: Use absolute paths, e.g.: `/opt/scripts/feishu_notify.py`

## 📝 Script Examples

### 🚀 Getting Started Example: Simplest Log Recording Script

If you are using script notification for the first time, we recommend starting with this simple example:

```python
#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
import sys
import json
from datetime import datetime

# Read data passed by Nightingale
payload = json.load(sys.stdin)

# Get alert information
title = payload.get('tpl', {}).get('title', 'Unknown Alert')
content = payload.get('tpl', {}).get('content', 'Unknown Content')
sendtos = payload.get('sendtos', [])

# Generate log record
timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
log_message = f"[{timestamp}] Alert Notification: {title}\nContent: {content}\nSend Targets: {', '.join(sendtos)}\n{'='*50}\n"

# Write to log file
with open('/tmp/alerts.log', 'a', encoding='utf-8') as f:
    f.write(log_message)

print(f"Alert has been recorded to log file, Title: {title}")
```

**What this script does**:
- 📝 Records each alert to `/tmp/alerts.log` file
- 🎯 Demonstrates how to read and use data passed by Nightingale
- ✅ Simple and reliable, suitable for testing if script notification works properly

### 🎯 Advanced Example: Send Feishu Notifications

Below is a more complete Python script example for processing alert events and sending to Feishu:

```python
#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
import sys
import json
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError
import socket

def send_feishu_notification(payload):
    """
    Core function for sending Feishu notifications (uses standard library, no third-party library installation needed)
    """
    try:
        # 1. Get necessary information
        token = payload.get('params', {}).get('access_token')
        title = payload.get('tpl', {}).get('title', 'System Alert')
        content = payload.get('tpl', {}).get('content', 'Unknown alert content')
        
        # 2. Check required parameters
        if not token:
            print("❌ Error: Feishu bot access_token not configured")
            return False
            
        # 3. Build Feishu message format
        feishu_message = {
            "msg_type": "text",
            "content": {
                "text": f"🚨 {title}\n\n{content}"
            }
        }
        
        # 4. Prepare HTTP request
        url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
        data = json.dumps(feishu_message).encode('utf-8')
        
        # 5. Create request object
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json;charset=utf-8'}
        )
        
        # 6. Send request (set 10-second timeout)
        with urllib.request.urlopen(req, timeout=10) as response:
            response_data = response.read().decode('utf-8')
            
            if response.status == 200:
                print("✅ Feishu notification sent successfully")
                print(f"Response content: {response_data}")
                return True
            else:
                print(f"❌ Feishu notification sending failed: HTTP {response.status}")
                print(f"Response content: {response_data}")
                return False
                
    except socket.timeout:
        print("❌ Feishu notification sending timed out")
        return False
    except HTTPError as e:
        print(f"❌ HTTP request failed: {e.code} {e.reason}")
        return False
    except URLError as e:
        print(f"❌ Network connection failed: {str(e.reason)}")
        return False
    except Exception as e:
        print(f"❌ Unknown error occurred while sending Feishu notification: {str(e)}")
        return False

def main():
    try:
        # Read data passed by Nightingale
        payload = json.load(sys.stdin)
        
        # Optional: Save data to file for debugging
        # with open('/tmp/nightingale_payload.json', 'w', encoding='utf-8') as f:
        #     json.dump(payload, f, indent=2, ensure_ascii=False)
        
        # Send notification
        success = send_feishu_notification(payload)
        
        # Set exit code based on result
        sys.exit(0 if success else 1)
        
    except json.JSONDecodeError:
        print("❌ Error: Unable to parse input JSON data")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Script execution failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

**Features of this script**:
- 🔧 **Good fault tolerance**: Contains complete error handling logic
- 📝 **Clear logging**: Uses emojis and clear prompt messages
- ⚡ **Timeout control**: Sets 10-second network request timeout
- 🔍 **Easy debugging**: Optional to save JSON data to file
- ✅ **Returns status code**: Returns 0 on success, 1 on failure
- 🚀 **Zero dependencies**: Uses only Python standard library, no third-party package installation needed

**Pre-use preparation**:
1. ✅ **No need to install additional dependencies**: Script uses only Python standard library
2. Add parameter in variable configuration: `access_token`
3. User fills in actual Feishu bot token in notification rules     

## 🔧 Troubleshooting Guide

### 📋 Quick Checklist

When script notification is not working, check in the following order:

1. **Basic Checks**
   - [ ] Is the script syntax correct?
   - [ ] Is the Python version supported? (Python 3.6+ recommended)
   - [ ] Is the timeout setting reasonable?

2. **Permission Checks**
   - [ ] Does the script have execution permissions?
   - [ ] Can Nightingale service access the script file?

3. **Data Checks**
   - [ ] Is the variable configuration correct?
   - [ ] Have users filled in necessary parameters?

### 🐛 Common Problem Solutions

#### Problem 1: Script Execution Timeout ⏰
**Symptoms**: Logs show script execution timeout
**Causes**:
- Script execution time exceeds configured timeout limit
- Network request response is slow

**Solutions**:
```bash
# 1. Appropriately adjust timeout duration
# In the interface, adjust timeout from 5000 to 15000 (15 seconds)

# 2. Optimize network request timeout in script
# Set timeout in urllib.request.urlopen()
with urllib.request.urlopen(req, timeout=5) as response:  # Set 5-second timeout
    pass
```

#### Problem 2: Script Doesn't Receive Data 📨
**Symptoms**: Script runs but doesn't process any data
**Debugging method**:
```python
# Add debugging code at the beginning of script
import sys
import json

try:
    payload = json.load(sys.stdin)
    # Write received data to file
    with open('/tmp/debug_payload.json', 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print("Data has been saved to /tmp/debug_payload.json")
except Exception as e:
    print(f"Failed to read data: {e}")
```

#### Problem 3: Parameters Not Passed to Script ⚙️
**Symptoms**: `params` is empty or missing expected parameters
**Check steps**:
1. In script notification channel configuration, confirm that parameter identifier (like `access_token`) has been added
2. In notification rule configuration, confirm that user has filled in corresponding parameter values
3. Print parameters in script for confirmation:
```python
params = payload.get('params', {})
print(f"Received parameters: {params}")
```

#### Problem 4: Network Request Failure 🌐
**Symptoms**: Script executes normally but notification is not sent
**Investigation method**:
```python
import urllib.request
import json
from urllib.error import URLError, HTTPError
import socket

try:
    # Prepare request data
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json;charset=utf-8'}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        response_data = response.read().decode('utf-8')
        print(f"HTTP status code: {response.status}")
        print(f"Response content: {response_data}")
        
        if response.status != 200:
            print("❌ Please check if API address and parameters are correct")
            
except socket.timeout:
    print("❌ Network request timed out, please check network connection")
except HTTPError as e:
    print(f"❌ HTTP request failed: {e.code} {e.reason}")
except URLError as e:
    print(f"❌ Unable to connect to target server: {e.reason}")
```

### 🧪 Manual Script Testing

Use the following command to manually test your script:

```bash
echo '{"event":{"rule_name":"Test Alert"},"tpl":{"title":"Test Title","content":"Test Content"},"params":{"access_token":"your_token"},"sendtos":["Test User"]}' | python3 /path/to/your/script.py
```

### 🆘 Still Can't Resolve?

If you still cannot resolve the issue following the above steps, please collect the following information for help:

1. **Script content** (hide sensitive information like tokens)
2. **Complete error log** information
3. **Test command** execution results
4. **System environment** information (Python version, operating system, etc.)

This will help technical support personnel locate and resolve the issue more quickly.