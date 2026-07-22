## 部署 Categraf

## 方式一：一鍵安裝（推薦）

在機器列表頁點擊「一鍵安裝 Categraf」，複製彈窗裡的命令，在目標機器上以 root 執行即可。命令形如：

```bash
curl -sSfL '{{server_addr}}/api/n9e/agents/categraf/install.sh' | sudo bash -s -- --server '{{server_addr}}'
```

腳本會自動完成下載、解壓、改寫上報地址、註冊並啟動 systemd 服務。

> 需要服務端版本支持該能力。若命令提示服務端未提供安裝腳本，請使用下面的手動安裝方式。

## 方式二：手動安裝

### 1. 下載並解壓安裝包

> 最新版本可以到 https://github.com/flashcatcloud/categraf/releases 獲取

```bash
wget https://github.com/flashcatcloud/categraf/releases/download/{{categraf_version}}/categraf-{{categraf_version}}-linux-amd64.tar.gz
tar zxvf categraf-{{categraf_version}}-linux-amd64.tar.gz
```

### 2. 修改 conf/config.toml，把上報地址改為夜鶯的實際地址

```toml
[[writers]]
url = "{{server_addr}}/prometheus/v1/write"

[heartbeat]
enable = true
# report os version cpu.util mem.util metadata
url = "{{server_addr}}/v1/n9e/heartbeat"
```

### 3. 啟動 categraf 採集器

```bash
# 以 service 方式安裝，相當於添加 service 文件 + systemctl daemon-reload
sudo ./categraf --install

# 以 service 方式查看 categraf，相當於 systemctl status categraf
sudo ./categraf --status
```

### 4. 啟動成功後會出現在機器列表頁，選中後將機器掛載到自己所在的業務組

<img width='100%' src='/n9e-docs/categraf/image01.png' />
