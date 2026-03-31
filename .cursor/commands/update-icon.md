---
name: /update-icon
id: update-icon
category: Dev Tools
description: 下载指定 iconfont.js 并覆盖本仓库 public/font/iconfont.js
---

当用户输入 `/update-icon <iconfont.js URL>` 时，下载该 JS 文件并覆盖**当前所在仓库**内的：

- `public/font/iconfont.js`

> 规则：**在哪个仓库根目录执行，就只更新哪个仓库的 `public/font/iconfont.js`**。

## 使用方式

示例：

```bash
/update-icon "https://at.alicdn.com/t/c/font_2679575_k6kviqpznje.js?spm=a313x.manage_type_myprojects.i1.19.14b53a81VrTzqt&file=font_2679575_k6kviqpznje.js"
```

## 执行流程（严格按顺序）

### 1) 确认在仓库根目录 & 目标文件存在

```bash
pwd
test -f "package.json"
ls -la "public/font/iconfont.js"
```

### 2) 下载 iconfont.js 到临时文件

```bash
tmp="$(mktemp -t iconfont.XXXXXX.js)"
curl -fsSL -H "User-Agent: Mozilla/5.0" "<URL>" -o "$tmp"
```

若 `curl` 不可用，可改用：

```bash
tmp="$(mktemp -t iconfont.XXXXXX.js)"
wget -qO "$tmp" "<URL>"
```

### 3) 做最小校验（避免下载到 HTML/报错页）

```bash
wc -c "$tmp"
head -n 3 "$tmp"
grep -n "iconfont" "$tmp" | head -n 5 || true
```

如果 `head` 显示 HTML（如包含 `<html` / `<!DOCTYPE`）或文件大小异常小，停止并报告下载失败原因。

### 4) 覆盖写入目标文件

```bash
cp -f "$tmp" "public/font/iconfont.js"
```

### 5) 输出校验信息（可选）

```bash
shasum -a 256 "public/font/iconfont.js"
```

### 6) 清理临时文件

```bash
rm -f "$tmp"
```

