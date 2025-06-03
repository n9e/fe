## Развертывание catgraf

### 1. Скачайте и распакуйте пакет установки

```bash
wget https://download.flashcat.cloud/categraf_ent-v0.3.94-linux-amd64.tar.gz
tar zxvf categraf_ent-v0.3.94-linux-amd64.tar.gz
```

### 2. Измените conf/config.toml, измените провайдеров на ["local","http"], измените [http_provider], пример конфигурации следующий

```toml
providers = ["local","http"]

[http_provider]
# Замените ${n9e_ip} на фактический адрес n9e
remote_url = "http://${n9e_ip}:17000/v1/n9e-plus/collects"
```

### 3. Запустите коллектор catgraf

```bash
# Установите в режиме сервиса, эквивалентно добавлению файла сервиса+systemctl daemon-reload
sudo ./categraf --install

# Просмотрите catgraf в режиме сервиса, эквивалентно systemctl status categraf
sudo ./categraf --status
```

### 4. После успешного запуска catgraf он появится на странице списка машин. Вам нужно выбрать его и присоединить машину к вашей бизнес-группе.

<img width='100%' src='/docs/categraf/image01.png' />
