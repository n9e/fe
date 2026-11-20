# 夜莺子路径部署指南

下面以 `http://monitor.example.com/flashcat/` 为例。Nginx 提供前端静态文件，并将浏览器发往 `/flashcat/api/` 的请求转发到夜莺后端的 `/api/`。示例假设后端监听 `127.0.0.1:17000`，实际部署时换成 Nginx 能访问的后端地址。

## 构建前端

在前端项目根目录运行以下命令。Node.js 版本要求见 `package.json` 的 `engines.node`。

```bash
npm ci
VITE_PREFIX=/flashcat npm run build
```

使用 Pro 或企业版本时，先准备好 `src/plus/` 和对应版本的构建配置。沿用该版本的构建命令并在命令前设置 `VITE_PREFIX=/flashcat`，如下面的 `build:prefix_advanced` 命令。

```bash
VITE_PREFIX=/flashcat npm run build:prefix_advanced
```

`VITE_PREFIX` 以 `/` 开头，末尾省略 `/`。这个值在构建时写入静态资源地址、页面路由和 API 请求路径。改用 `/monitor` 等前缀时，需要重新构建并同步调整 Nginx 的路径和静态文件目录。

构建产物位于 `pub/`。将整个目录的内容复制到 Nginx 服务器的 `/srv/www/flashcat/`，入口文件应位于 `/srv/www/flashcat/index.html`。

```bash
# 在 Nginx 服务器上执行，当前目录包含构建产物 pub/
sudo mkdir -p /srv/www/flashcat
sudo cp -a pub/. /srv/www/flashcat/
```

## 配置 Nginx

在 Nginx 中配置以下 `server`。如果域名已有 `server`，将这些 `location` 加到现有站点配置里。主配置的 `http` 块应已加载 `mime.types`，以便正确返回 JavaScript、CSS 等静态文件的类型。

```nginx
server {
    listen 80;
    server_name monitor.example.com;

    location = /flashcat {
        absolute_redirect off;
        return 308 /flashcat/$is_args$args;
    }

    location ^~ /flashcat/api/ {
        proxy_pass http://127.0.0.1:17000/api/;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 让 SSE 等流式响应及时送达浏览器
        proxy_buffering off;
    }

    location ^~ /flashcat/assets/ {
        root /srv/www;
        try_files $uri =404;
    }

    location ^~ /flashcat/ {
        root /srv/www;
        try_files $uri /flashcat/index.html =404;
    }
}
```

- `proxy_pass` 地址末尾的 `/api/` 将匹配到的 `/flashcat/api/` 替换为 `/api/`。例如，`/flashcat/api/n9e/version` 会转发到后端的 `/api/n9e/version`，查询参数也会保留。已有 API 网关的环境可以将上游地址改成网关地址。 [Nginx `proxy_pass` 文档](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- `root /srv/www` 会将请求路径拼在目录之后，因此 `/flashcat/assets/app.js` 对应 `/srv/www/flashcat/assets/app.js`。页面路径找不到文件时由 `index.html` 接管，支持刷新或直接打开应用内页面。缺失的 `/flashcat/assets/` 文件直接返回 `404`。 [Nginx `try_files` 文档](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)

检查并重载 Nginx 配置。

```bash
sudo nginx -t && sudo nginx -s reload
```

## 验证部署

```bash
curl -i 'http://monitor.example.com/flashcat?from=check'
curl -i 'http://monitor.example.com/flashcat/login'
curl -i 'http://monitor.example.com/flashcat/api/n9e/version'
```

1. 第一条请求应重定向到 `/flashcat/?from=check`，第二条应返回前端 HTML，第三条应返回后端版本号。
2. 在浏览器访问 `/flashcat/` 并登录。打开一个应用内页面并刷新，在开发者工具的 Network 面板检查静态资源和 API 请求是否成功，且应用内请求带有 `/flashcat/` 前缀。
3. 如果启用了单点登录，将夜莺和身份提供方中配置的回调 URL 更新为实际对外地址，例如 `https://monitor.example.com/flashcat/callback/feishu`，再验证登录回跳。

| 现象                                   | 检查项                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| 首屏空白，资源请求发到了 `/assets/`    | 检查 `pub/index.html` 中的资源地址是否带 `/flashcat/`，并确认 Nginx 上的文件来自本次构建。 |
| 首页能打开，刷新应用内页面时返回 `404` | 检查页面 `location` 的 `try_files` 和 `/srv/www/flashcat/index.html` 的读取权限。          |
| API 返回 `404` 或前端 HTML             | 检查 API `location` 是否匹配，以及 `proxy_pass` 的 `/api/` 路径和上游地址。                |
