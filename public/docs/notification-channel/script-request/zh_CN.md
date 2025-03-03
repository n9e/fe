# 脚本通知 配置指南
脚本通知是一种极其灵活的告警推送方式，如果夜莺平台提供的已有通知媒介不能满足您的需求，并且配置 HTTP发送的方式（通过自定义 URL, 请求头, 请求体等），不能对接您公司的通知通道，您可以考虑使用脚本发送类型。

### 工作原理
1. 夜莺产生告警事件
2. 夜莺将告警事件序列化为JSON格式
3. 夜莺调用您指定的通知脚本，并通过stdin传递JSON数据
4. 您的脚本处理这些数据并执行自定义逻辑

脚本通知方式可以复用夜莺内置的告警模板。JSON数据中不仅包含事件原始信息，还包含事件与通知模板渲染后的结果文本、自定义参数、发送目标等，无需在脚本中再处理模板渲染逻辑。

stdin 数据格式如下：

```json
{
    "event": {}, // 告警事件原始数据
    "events": [], // 如果是聚合告警，则包含多个事件，每个事件的结构与event相同
    "tpl": { // 消息模板渲染后的结果文本，用户在配置通知规则的时候，会关联一个通知模板
        "title": "告警标题",
        "text": "告警内容"
    },
    "params": { // 自定义参数
        "access_token": "xxx",
        "ats": "xxx"
    },
    "sendtos": ["xxx", "xxx"] // 发送目标列表
}
```

### 变量配置
用于配置脚本所需的认证信息或其他必要参数。
1. 参数配置 $params

- 表示自定义参数，可以在json数据中使用，例如 `params.access_token`、`params.token` 等。
- 这些参数的值可以在通知规则中由用户配置，然后在实际发送时动态传入。比如一个钉钉通知媒介，可以根据用户配置不同的 token 值，从而实现不同的钉钉群机器人发送。
- 使用 `params.xxx` 时，需要在 “变量配置” 中添加参数标识 `xxx`，然后用户会在通知规则中，填入 `xxx` 的值，最终用户配置的 `xxx` 值会替换到需要的地方中。

2. 联系方式 $sendtos

- 表示本次通知要发送到的目标地址或列表，如手机号、邮箱、IM 的个人 token 等。
- 使用 `sendtos` 时，需要在 “变量配置” 中配置用户联系方式，最终会根据用户配置的联系方式，将 `sendtos` 替换为实际的联系方式。

### 脚本配置

#### 超时时间
- 单位：毫秒
- 用途：设置脚本执行的最大允许时间
- 建议：根据脚本复杂度设置合理的超时时间，避免脚本执行时间过长

#### 脚本类型选择
提供两种方式来配置脚本：

- **使用脚本**：直接在界面编写或粘贴脚本内容
- **使用路径**：指定服务器上已存在的脚本文件路径


注意：如果选择"使用路径"方式，请确保：
1. 脚本文件已存在于指定路径
2. 脚本具有正确的执行权限
3. 运行服务的用户有权限访问该脚本

#### 脚本示例
1. 以下是一个 shell 脚本示例，用于处理告警事件并发送到飞书
```bash
#!/bin/bash

# 使用grep和sed提取JSON字段值的函数
get_json_value() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"$field\":[^,}]*" | sed -E 's/"[^"]*":"?([^",}]*)"?.*/\1/'
}

send_feishu() {
    # 从标准输入读取JSON
    payload=$(cat)
    
    # 提取token和content
    token=$(get_json_value "$(echo "$payload" | grep -o '"params":{[^}]*}')" "access_token")
    content=$(get_json_value "$(echo "$payload" | grep -o '"tpl":{[^}]*}')" "content")
    
    # 如果content为空，使用默认值
    if [ -z "$content" ]; then
        content="未找到告警内容"
    fi
    
    # 构建请求消息体
    message="{\"msg_type\": \"text\", \"content\": {\"text\": \"$content\"}}"
    
    if [ -n "$token" ]; then
        # 发送HTTP请求到飞书
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$message" \
            "https://open.feishu.cn/open-apis/bot/v2/hook/$token")
        
        echo "飞书通知结果: token=$token response=$response"
    else
        echo "未提供有效的飞书机器人access_token"
    fi
}

# 可选：保存输入数据用于调试
cat > .payload

# 处理告警消息
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
    发送飞书通知
    Args:
        payload: 包含告警信息的字典
    """
    try:
        event = payload.get('event', {})
        token = payload.get('params', {}).get('access_token')

        headers = {
            "Content-Type": "application/json;charset=utf-8"
        }

        # 构建消息内容
        message = {
            "msg_type": "text",
            "content": {
                "text": payload.get('tpl', {}).get('content', '未找到告警内容')
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
            print(f"飞书通知结果: token={token} status={response.status_code} response={response.text}")
        else:
            print("未提供有效的飞书机器人access_token")

    except Exception as e:
        print(f"发送飞书通知失败: {str(e)}")


def main():
    payload = json.load(sys.stdin)
    # 可选：将payload写入文件以便调试
    with open(".payload", 'w') as f:
        f.write(json.dumps(payload, indent=4))
    
    send_feishu(payload)

if __name__ == "__main__":
    main()
```     

### 故障排查

#### 常见问题及解决方案

1. **脚本执行超时**
   - 检查脚本超时时间设置是否合理
   - 优化脚本执行效率
   - 检查是否存在网络请求延迟

2. **脚本执行权限问题**
   - 确保脚本文件具有可执行权限（chmod +x）
   - 验证运行服务的用户对脚本文件有读取和执行权限
   - 检查脚本所在目录的访问权限

3. **数据格式问题**
   - 确保脚本能正确解析 JSON 输入
   - 检查 stdin 数据是否完整
   - 验证 JSON 数据格式是否符合预期

4. **调试方法**
   - 在脚本中添加日志输出
   - 将 stdin 数据保存到文件中分析
   - 使用以下命令手动测试脚本：   
```echo '{"event":{},"tpl":{"title":"测试","content":"内容"},"params":{"access_token":"xxx"}' | ./your_script.py```

5. **环境依赖问题**
   - 确保所需的第三方库已正确安装
   - 检查 Python 等解释器版本是否兼容
   - 验证系统环境变量配置是否正确

如遇到其他问题，请查看系统日志获取详细错误信息。
