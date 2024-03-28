```yml
# download
mkdir -p /opt/prometheus
cd /opt/prometheus
wget download.flashcat.cloud/prometheus-2.50.1.linux-amd64.tar.gz

# start
cat <<EOF >/etc/systemd/system/prometheus.service
[Unit]
Description="prometheus"
Documentation=https://prometheus.io/
After=network.target

[Service]
Type=simple

ExecStart=/opt/prometheus/prometheus --config.file=/opt/prometheus/prometheus.yml --storage.tsdb.path=/opt/prometheus/data --web.enable-lifecycle --web.enable-remote-write-receiver

Restart=on-failure
SuccessExitStatus=0
LimitNOFILE=65536
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=prometheus


[Install]
WantedBy=multi-user.target
EOF

systemctl enable prometheus
systemctl restart prometheus
systemctl status prometheus
```
