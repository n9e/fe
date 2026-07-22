## 部署 Categraf

## 方式一：一键安装（推荐）

在机器列表页点击「一键安装 Categraf」，复制弹窗里的命令，在目标机器上以 root 执行即可。命令形如：

```bash
curl -sSfL '{{server_addr}}/api/n9e/agents/categraf/install.sh' | sudo bash -s -- --server '{{server_addr}}'
```

脚本会自动完成下载、解压、改写上报地址、注册并启动 systemd 服务。

> 需要服务端版本支持该能力。若命令提示服务端未提供安装脚本，请使用下面的手动安装方式。

## 方式二：手动安装

### 1. 下载并解压安装包

> 最新版本可以到 https://github.com/flashcatcloud/categraf/releases 获取

```bash
wget https://github.com/flashcatcloud/categraf/releases/download/{{categraf_version}}/categraf-{{categraf_version}}-linux-amd64.tar.gz
tar zxvf categraf-{{categraf_version}}-linux-amd64.tar.gz
```

### 2. 修改 conf/config.toml，把上报地址改为夜莺的实际地址

```toml
[[writers]]
url = "{{server_addr}}/prometheus/v1/write"

[heartbeat]
enable = true
# report os version cpu.util mem.util metadata
url = "{{server_addr}}/v1/n9e/heartbeat"
```

### 3. 启动 categraf 采集器

```bash
# 以 service 方式安装，相当于添加 service 文件 + systemctl daemon-reload
sudo ./categraf --install

# 以 service 方式查看 categraf，相当于 systemctl status categraf
sudo ./categraf --status
```

### 4. 启动成功后会出现在机器列表页，选中后将机器挂载到自己所在的业务组

<img width='100%' src='/n9e-docs/categraf/image01.png' />
