## 部署 categraf


## 开源用户
### 1. 下载并解压的安装包
> categraf 最新版本可以到 https://flashcat.cloud/download/categraf/ 获取

```bash
wget https://download.flashcat.cloud/categraf-v0.3.73-linux-amd64.tar.gz
tar zxvf categraf-v0.3.73-linux-amd64.tar.gz
```

### 2. 修改 conf/config.toml , 将下面的上报数据的地址修改为 n9e 的实际地址

```toml
[[writers]]  
url = "http://127.0.0.1:17000/prometheus/v1/write"

[heartbeat]
enable = true
# report os version cpu.util mem.util metadata
url = "http://127.0.0.1:17000/v1/n9e/heartbeat"
```

### 3. 启动 categraf 采集器

```bash
# 以service方式安装, 相当于添加service文件+systemctl daemon-reload
sudo ./categraf  --install

# 以service方式查看categraf，相当于systemctl status categraf
sudo ./categraf  --status
```

### 4. categraf 启动成功之后，会出现在机器列表页面，需要选中之后，将机器挂载到自己所在的业务组

<img width='100%' src='/docs/categraf/image01.png' />
