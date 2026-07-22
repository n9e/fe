## Deploy Categraf

## Option 1: one-click install (recommended)

On the machine list page, click "Install Categraf", copy the command from the dialog and run it on the target host as root. It looks like this:

```bash
curl -sSfL '{{server_addr}}/api/n9e/agents/categraf/install.sh' | sudo bash -s -- --server '{{server_addr}}'
```

The script downloads and unpacks the package, rewrites the reporting address, then registers and starts the systemd service.

> Requires a server version that supports this. If the command reports that the server does not provide an install script, use the manual steps below.

## Option 2: manual install

### 1. Download and unpack the package

> The latest version is available at https://github.com/flashcatcloud/categraf/releases

```bash
wget https://github.com/flashcatcloud/categraf/releases/download/{{categraf_version}}/categraf-{{categraf_version}}-linux-amd64.tar.gz
tar zxvf categraf-{{categraf_version}}-linux-amd64.tar.gz
```

### 2. Edit conf/config.toml and point the reporting address at your nightingale

```toml
[[writers]]
url = "{{server_addr}}/prometheus/v1/write"

[heartbeat]
enable = true
# report os version cpu.util mem.util metadata
url = "{{server_addr}}/v1/n9e/heartbeat"
```

### 3. Start the categraf collector

```bash
# Install as a service, equivalent to adding a service file + systemctl daemon-reload
sudo ./categraf --install

# Check the service, equivalent to systemctl status categraf
sudo ./categraf --status
```

### 4. Once started, the host appears on the machine list page; select it to assign it to a business group

<img width='100%' src='/n9e-docs/categraf/image01.png' />
