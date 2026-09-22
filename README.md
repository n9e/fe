# n9e-fe

This is the web project for N9E

## Usage

The built pub folder can work in the [n9e](https://github.com/ccfos/nightingale/).

you can deploy the front-end code independently, just replace the pub with the new release.

## Dependencies

```
node: 16.15.0 (the version pinned by CI, see .github/workflows/package.yml)
npm: 8.x
```

## Installation

```
npm install
```

## Start

```
npm run dev
```

The back-end api proxy config is in [vite.config.ts](./vite.config.ts#L110). It targets `http://localhost:8080` by default and can be overridden with `PROXY` (or `PROXY_PRO` / `PROXY_ENT`) in `.env`.

> **💡 Dev locale switching**  
> To speed up the dev server, only **English (en_US)** locale files are loaded by default in development mode; other languages are replaced with empty objects to reduce unnecessary module requests.  
> To switch to another language, create a `.env` file in the project root and set the `VITE_DEV_LOCALE` environment variable:
>
> ```bash
> # .env
> VITE_DEV_LOCALE=zh_CN
> ```
>
> Or specify it inline when starting the dev server:
>
> ```bash
> VITE_DEV_LOCALE=zh_CN npm run dev
> ```
>
> Supported locales: `zh_CN`, `en_US`, `zh_HK`, `ru_RU`, `ja_JP`, `pt_BR`, `es_ES`, `id_ID`, `ko_KR`, `fr_FR`.  
> To load **all** locales (so you can switch languages freely in the UI, at the cost of more module requests), set it to `all`:
>
> ```bash
> VITE_DEV_LOCALE=all npm run dev
> ```
>
> This optimization only applies to the `serve` phase; production builds are unaffected.

## Build

```
npm run build
```

## Nginx Server

```
server {
    listen       8765;
    server_name  _;

    add_header Access-Control-Allow-Origin *;
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    root   front-end/page/path;    # e.g. /root/n9e/pub;

    location / {
        root front-end/page/path;    # e.g. /root/n9e/pub;
        try_files $uri /index.html;
    }
   location /api/ {
        proxy_pass http://n9e.api.server;   # e.g. 127.0.0.1:18000
    }
}
```

## Notice

- `vite.config.ts` and `tsconfig.json` should both configure the alias (`@/*` → `src/*`) so it works in both the dev server and the type checker
- Add `"css.validate": false` in vscode setting.json to ignore the css warning
- Install the Prettier plugin in vscode and set the format on save
