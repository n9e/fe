## 部署 categraf

### 1. 下载并解压的安装包

```bash
wget https://download.flashcat.cloud/categraf_ent-v0.3.94-linux-amd64.tar.gz
tar zxvf categraf_ent-v0.3.94-linux-amd64.tar.gz
```

### 2. 修改 conf/config.toml , 将 providers 改为 [“local”,“http”] ，修改 [http_provider], 配置参考如下

```toml
providers = ["local","http"]

[http_provider]
# 将 ${n9e_ip} 替换为 n9e 的实际地址
remote_url = "http://${n9e_ip}:17000/v1/n9e-plus/collects"
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
