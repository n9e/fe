# 脚本通知 配置指南

## 📖 什么是脚本通知？

脚本通知是夜莺平台提供的一种**高度灵活**的告警推送方式。简单来说，当系统出现告警时，夜莺会自动调用您编写的脚本程序来发送通知。

## 🚀 新手快速开始

如果您是第一次使用脚本通知，建议按以下步骤操作：

### 第1步：确认是否需要脚本通知
脚本通知适用于以下场景：
- ✅ 公司使用的通知工具不在夜莺内置列表中（如企微、钉钉等已内置）
- ✅ 需要复杂的数据处理或格式转换
- ✅ 需要同时发送到多个不同渠道

### 第2步：准备测试环境
1. **先用简单脚本测试**（复制本文档中的"入门示例"）
2. **确认数据流通**（检查日志文件是否有内容）
3. **再改为实际通知**（修改为飞书/企微/内部 IM 等真实通知）

### 第3步：配置通知渠道
1. 在夜莺界面创建"脚本通知"类型的通知渠道
2. 配置必要的变量（如 `access_token`）
3. 选择脚本配置方式（建议新手选择"使用脚本"直接编写）

### 第4步：测试验证
1. 手动测试脚本（参考文档末尾的测试方法）
2. 创建测试告警规则关联该通知渠道
3. 触发告警验证通知是否正常

> 💡 **新手提示**：强烈建议先使用入门示例中的日志记录脚本进行测试，确认数据传递正常后，再修改为实际的通知逻辑。

## 🔄 工作原理

想象一下这个过程：

1. **监控系统发现问题** → 夜莺检测到告警事件（比如：服务器CPU使用率超过80%）
2. **打包告警信息** → 夜莺将这个告警的所有信息整理成一个JSON格式的"包裹"
3. **调用您的脚本** → 夜莺找到您指定的脚本程序，启动它
4. **传递数据** → 夜莺将JSON"包裹"通过标准输入（stdin）传给您的脚本
5. **脚本处理** → 您的脚本收到数据，按照您的逻辑发送通知（比如发到飞书群）

> 💡 **好处**：夜莺已经帮您处理好了告警模板的渲染，脚本收到的数据是格式化好的，您只需要专注于"怎么发送"这一步。

## 📦 您的脚本会收到什么数据？

夜莺会通过标准输入（stdin）向您的脚本传递一个JSON格式的数据包，包含以下信息：

```json
{
    "event": {
        "rule_name": "CPU使用率过高",
        // ... 更多告警事件的原始数据
    },
    "events": [
        // 如果是聚合告警（多个事件一起发送），这里会包含多个事件
        // 每个事件的结构与上面的event相同
    ],
    "tpl": {
        "title": "【告警】CPU使用率过高",
        "content": "服务器 web-01 的CPU使用率达到85.6%，已超过阈值80%，请及时处理！"
        // 这是夜莺根据告警模板渲染好的最终文本，直接可用
    },
    "params": {
        "access_token": "your_feishu_bot_token",
        "webhook_secret": "your_secret_key"
        // 您在界面配置的自定义参数
    },
    "sendtos": ["138321xxxx", "135321xxxx"]
    // 要发送给谁，这个列表是根据通知规则确定的
}
```

> 💡 **重点理解**：`tpl` 部分是夜莺已经渲染好的消息内容，您通常直接使用这个内容发送即可，无需再次处理模板。

## ⚙️ 变量配置详解

在创建脚本通知渠道时，您需要配置两种变量：

### 1️⃣ 自定义参数（$params）

**作用**：存储脚本运行时需要的配置信息，如API密钥、访问令牌等。

**举个例子**：
- 🎯 **场景**：您要发送飞书通知，需要飞书机器人的access_token
- 📝 **配置步骤**：
  1. 在"变量配置"中添加参数标识：`access_token`
  2. 用户在配置通知规则时，会看到需要填入`access_token`的值
  3. 用户填入实际的token：`cli_a12b34c56d78e90f`
  4. 脚本运行时，通过`params.access_token`就能获取到这个token

**实际应用**：
```python
# 在您的脚本中这样使用：
token = payload.get('params', {}).get('access_token')
url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
```

### 2️⃣ 发送目标（$sendtos）

**作用**：定义通知要发送给哪些人或群。

**举个例子**：
- 🎯 **场景**：根据不同告警发送给不同的人
- 📝 **配置原理**：
  1. 在通知规则中，管理员设置某个告警要通知"张三"和"运维群"
  2. 系统会根据用户配置的联系方式，将"张三"转换为他的手机号（根据变量配置中的联系方式来决定转换为什么）
  3. 脚本收到的`sendtos`数组就包含了这些实际的手机号

**实际应用**：
```python
# 在您的脚本中遍历发送目标：
for target in payload.get('sendtos', []):
    send_notification_to(target, message)
```

## 🛠️ 脚本配置指南

### ⏰ 超时时间设置
- **单位**：毫秒（1秒 = 1000毫秒）
- **作用**：防止脚本执行时间过长，避免系统卡死
- **建议值**：
  - 简单脚本：5000毫秒（5秒）
  - 复杂脚本：10000毫秒（10秒）
  - 有网络请求：15000毫秒（15秒）

### 📄 脚本配置方式

您可以选择两种方式来配置脚本：

#### 方式1：直接编写脚本（推荐新手使用）
- ✅ **优点**：在界面中直接编写，方便修改和调试
- ✅ **适用场景**：脚本内容较短，逻辑简单
- 📝 **操作**：选择"使用脚本"，在文本框中编写或粘贴您的脚本代码

#### 方式2：使用本地脚本文件
- ✅ **优点**：适合复杂脚本，可以使用IDE开发
- ✅ **适用场景**：脚本较大，需要引用多个文件
- 📝 **操作**：选择"使用路径"，填入脚本文件的完整路径

⚠️ **使用路径方式的注意事项**：
1. **文件存在**：确保脚本文件已保存到服务器指定位置
2. **执行权限**：运行 `chmod +x /path/to/your/script.py` 给脚本添加执行权限
3. **用户权限**：确保运行夜莺服务的用户能够访问这个文件
4. **路径正确**：使用绝对路径，如：`/opt/scripts/feishu_notify.py`

## 📝 脚本示例

### 🚀 入门示例：最简单的日志记录脚本

如果您是第一次使用脚本通知，建议先从这个简单例子开始：

```python
#!/usr/bin/env python3
# -*- coding: UTF-8 -*-
import sys
import json
from datetime import datetime

# 读取夜莺传入的数据
payload = json.load(sys.stdin)

# 获取告警信息
title = payload.get('tpl', {}).get('title', '未知告警')
content = payload.get('tpl', {}).get('content', '未知内容')
sendtos = payload.get('sendtos', [])

# 生成日志记录
timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
log_message = f"[{timestamp}] 告警通知：{title}\n内容：{content}\n发送目标：{', '.join(sendtos)}\n{'='*50}\n"

# 写入日志文件
with open('/tmp/alerts.log', 'a', encoding='utf-8') as f:
    f.write(log_message)

print(f"告警已记录到日志文件，标题：{title}")
```

**这个脚本的作用**：
- 📝 将每次告警记录到 `/tmp/alerts.log` 文件中
- 🎯 展示了如何读取和使用夜莺传入的数据
- ✅ 简单可靠，适合用来测试脚本通知是否正常工作

### 🎯 进阶示例：发送飞书通知

以下是一个更完整的Python脚本示例，用于处理告警事件并发送到飞书：

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
    发送飞书通知的核心函数（使用标准库，无需安装第三方库）
    """
    try:
        # 1. 获取必要信息
        token = payload.get('params', {}).get('access_token')
        title = payload.get('tpl', {}).get('title', '系统告警')
        content = payload.get('tpl', {}).get('content', '未知告警内容')
        
        # 2. 检查必要参数
        if not token:
            print("❌ 错误：未配置飞书机器人access_token")
            return False
            
        # 3. 构建飞书消息格式
        feishu_message = {
            "msg_type": "text",
            "content": {
                "text": f"🚨 {title}\n\n{content}"
            }
        }
        
        # 4. 准备HTTP请求
        url = f"https://open.feishu.cn/open-apis/bot/v2/hook/{token}"
        data = json.dumps(feishu_message).encode('utf-8')
        
        # 5. 创建请求对象
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json;charset=utf-8'}
        )
        
        # 6. 发送请求（设置10秒超时）
        with urllib.request.urlopen(req, timeout=10) as response:
            response_data = response.read().decode('utf-8')
            
            if response.status == 200:
                print("✅ 飞书通知发送成功")
                print(f"响应内容: {response_data}")
                return True
            else:
                print(f"❌ 飞书通知发送失败: HTTP {response.status}")
                print(f"响应内容: {response_data}")
                return False
                
    except socket.timeout:
        print("❌ 发送飞书通知超时")
        return False
    except HTTPError as e:
        print(f"❌ HTTP请求失败: {e.code} {e.reason}")
        return False
    except URLError as e:
        print(f"❌ 网络连接失败: {str(e.reason)}")
        return False
    except Exception as e:
        print(f"❌ 发送飞书通知时发生未知错误: {str(e)}")
        return False

def main():
    try:
        # 读取夜莺传入的数据
        payload = json.load(sys.stdin)
        
        # 可选：保存数据到文件供调试使用
        # with open('/tmp/nightingale_payload.json', 'w', encoding='utf-8') as f:
        #     json.dump(payload, f, indent=2, ensure_ascii=False)
        
        # 发送通知
        success = send_feishu_notification(payload)
        
        # 根据结果设置退出码
        sys.exit(0 if success else 1)
        
    except json.JSONDecodeError:
        print("❌ 错误：无法解析输入的JSON数据")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 脚本执行失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

**这个脚本的特点**：
- 🔧 **容错性好**：包含完整的错误处理逻辑
- 📝 **日志清晰**：使用表情符号和清晰的提示信息
- ⚡ **超时控制**：设置了10秒的网络请求超时
- 🔍 **便于调试**：可选择保存JSON数据到文件
- ✅ **返回状态码**：成功返回0，失败返回1
- 🚀 **零依赖**：只使用 Python 标准库，无需安装第三方包

**使用前准备**：
1. ✅ **无需安装额外依赖**：脚本只使用 Python 标准库
2. 在变量配置中添加参数：`access_token`
3. 用户在通知规则中填入飞书机器人的实际token     

## 🔧 故障排查指南

### 📋 快速检查清单

当脚本通知不工作时，按以下顺序检查：

1. **基础检查**
   - [ ] 脚本语法是否正确？
   - [ ] Python 版本是否支持？（建议 Python 3.6+）
   - [ ] 超时时间设置是否合理？

2. **权限检查**
   - [ ] 脚本是否有执行权限？
   - [ ] 夜莺服务是否能访问脚本文件？

3. **数据检查**
   - [ ] 变量配置是否正确？
   - [ ] 用户是否填写了必要的参数？

### 🐛 常见问题解决方案

#### 问题1：脚本执行超时 ⏰
**症状**：日志显示脚本执行超时
**原因**：
- 脚本执行时间超过了配置的超时限制
- 网络请求响应慢

**解决方案**：
```bash
# 1. 适当调整超时时间
# 在界面中将超时时间从 5000 调整为 15000（15秒）

# 2. 优化脚本中的网络请求超时
# 在 urllib.request.urlopen() 中设置超时
with urllib.request.urlopen(req, timeout=5) as response:  # 设置5秒超时
    pass
```

#### 问题2：脚本没有收到数据 📨
**症状**：脚本运行了，但没有处理任何数据
**调试方法**：
```python
# 在脚本开头添加调试代码
import sys
import json

try:
    payload = json.load(sys.stdin)
    # 将收到的数据写入文件
    with open('/tmp/debug_payload.json', 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print("数据已保存到 /tmp/debug_payload.json")
except Exception as e:
    print(f"读取数据失败: {e}")
```

#### 问题3：参数没有传递到脚本 ⚙️
**症状**：`params` 为空或缺少预期的参数
**检查步骤**：
1. 在脚本通知渠道配置中，确认已添加参数标识（如 `access_token`）
2. 在通知规则配置中，确认用户已填写对应参数的值
3. 在脚本中打印参数进行确认：
```python
params = payload.get('params', {})
print(f"收到的参数: {params}")
```

#### 问题4：网络请求失败 🌐
**症状**：脚本执行正常，但通知没有发出
**排查方法**：
```python
import urllib.request
import json
from urllib.error import URLError, HTTPError
import socket

try:
    # 准备请求数据
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json;charset=utf-8'}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        response_data = response.read().decode('utf-8')
        print(f"HTTP状态码: {response.status}")
        print(f"响应内容: {response_data}")
        
        if response.status != 200:
            print("❌ 请检查API地址和参数是否正确")
            
except socket.timeout:
    print("❌ 网络请求超时，请检查网络连接")
except HTTPError as e:
    print(f"❌ HTTP请求失败: {e.code} {e.reason}")
except URLError as e:
    print(f"❌ 无法连接到目标服务器: {e.reason}")
```

### 🧪 手动测试脚本

使用以下命令手动测试您的脚本：

```bash
echo '{"event":{"rule_name":"测试告警"},"tpl":{"title":"测试标题","content":"测试内容"},"params":{"access_token":"your_token"},"sendtos":["测试用户"]}' | python3 /path/to/your/script.py
```

### 🆘 仍然无法解决？

如果按照上述步骤仍然无法解决问题，请收集以下信息寻求帮助：

1. **脚本内容**（隐藏敏感信息如token）
2. **错误日志**的完整信息
3. **测试命令**的执行结果
4. **系统环境**信息（Python版本、操作系统等）

这样可以帮助技术支持人员更快地定位和解决问题。
