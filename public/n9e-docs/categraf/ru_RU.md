## Установка Categraf

## Вариант 1: установка одной командой (рекомендуется)

На странице со списком машин нажмите «Установить Categraf», скопируйте команду из диалога и выполните её на целевом хосте с правами root:

```bash
curl -sSfL '{{server_addr}}/api/n9e/agents/categraf/install.sh' | sudo bash -s -- --server '{{server_addr}}'
```

Скрипт сам скачает и распакует пакет, пропишет адрес отправки данных, зарегистрирует и запустит systemd-сервис.

> Требуется версия сервера с поддержкой этой возможности. Если команда сообщает, что сервер не отдаёт скрипт установки, используйте ручной способ ниже.

## Вариант 2: ручная установка

### 1. Скачайте и распакуйте пакет

> Актуальная версия доступна на https://github.com/flashcatcloud/categraf/releases

```bash
wget https://github.com/flashcatcloud/categraf/releases/download/{{categraf_version}}/categraf-{{categraf_version}}-linux-amd64.tar.gz
tar zxvf categraf-{{categraf_version}}-linux-amd64.tar.gz
```

### 2. Отредактируйте conf/config.toml и укажите адрес вашего nightingale

```toml
[[writers]]
url = "{{server_addr}}/prometheus/v1/write"

[heartbeat]
enable = true
# report os version cpu.util mem.util metadata
url = "{{server_addr}}/v1/n9e/heartbeat"
```

### 3. Запустите коллектор categraf

```bash
# Установка как сервиса: добавляет unit-файл + systemctl daemon-reload
sudo ./categraf --install

# Проверка статуса, аналог systemctl status categraf
sudo ./categraf --status
```

### 4. После запуска хост появится в списке машин; выберите его, чтобы назначить бизнес-группе

<img width='100%' src='/n9e-docs/categraf/image01.png' />
