# 个人站 · 蒋东邕

零依赖静态站：17 个 HTML + 1 份 CSS + 1 份 JS + 1 份 JSON。
没有构建步骤，没有 `npm install`，没有外部字体、CDN 或统计脚本。打开任何一个页面，浏览器只会请求本站自己的文件（信息源条目的外链是用户点击后才出去的）。

---

## 本地预览

**必须走 HTTP**，不要双击 HTML：

```bash
cd personal-site
python -m http.server 8142
# 打开 http://127.0.0.1:8142/
```

用 `file://` 直接打开也能看版式，但信息源列表会停在「加载中」——`fetch('data/sources.json')` 在 file 协议下被 CORS 拦截，页面会给出提示文案，不会白屏。

---

## 目录结构

```
personal-site/
├── index.html                首页（hero + 简介 + 精选信息源 + 作品 + 最近文章 + 联系）
├── about.html                关于（经历、技能、工作方式）
├── now.html                  现在（在做什么、开放机会、时间轴）
├── sources.html              信息源（22 条，搜索 + 分组筛选）
├── works.html                作品列表（4 张卡，标签筛选）
├── writing.html              文章列表（4 篇）
├── contact.html              联系（QQ 邮箱，点击显示，源码无明文）
├── 404.html                  404
├── works/
│   ├── dsh-mnemon.html       dsh-mnemon 详情
│   ├── dsh-plugins.html      dsh 插件工具箱详情
│   ├── qq-bot.html           QQ 机器人后端详情
│   └── knowledge-base.html   知识库详情
├── writing/
│   ├── memory-thin.html                  把 Agent 的记忆做薄，而不是做大
│   ├── teaching-to-engineering.html      教学经历如何迁移成工程方法
│   ├── windows-python-toolchain.html     Windows 上把 Python 工具链调到顺手
│   └── static-site-limits.html           免费静态站的边界在哪里
├── assets/
│   ├── styles.css            全部样式（含浅色/深色两套令牌、6 组断点）
│   ├── app.js                全部交互（导航、主题、筛选、搜索、邮箱、滚动动效）
│   ├── og.png                分享卡 1200×630（社交平台预览图）
│   └── og-card.html          og.png 的源文件，改完重新截图
├── data/
│   └── sources.json          22 条信息源，页面唯一数据源
├── previews/                 26 张验收截图（桌面 1440 / 移动 390@2x）
├── robots.txt
├── sitemap.xml               15 个 <loc>
├── feed.xml                  RSS 2.0，4 篇完整文章
├── _headers                  Cloudflare Pages 缓存与安全响应头
└── .backup-archive-v1/       旧版「纸本档案」风（仅存档，不参与部署）
```

---

## 页面清单

| 文件 | 用途 | 主要内容 |
| --- | --- | --- |
| `index.html` | 首页 | h1 + 定位语、4 个数字指标、关于摘要、6 条精选信息源、4 个作品、3 篇最近文章、联系方式 |
| `about.html` | 关于 | 履历时间轴、技能表、工作方式、常用工具 |
| `now.html` | 现在 | 当下在学/在做、开放实习的时间窗、近况时间轴 |
| `sources.html` | 信息源 | 22 条外链，关键词搜索 + 5 个分组 chips + 计数 |
| `works.html` | 作品 | 4 张卡，按 Agent / Python / Bot / 笔记筛选 |
| `writing.html` | 文章 | 4 行，点进 `writing/*.html` |
| `contact.html` | 联系 | 邮箱点击显示 + 复制，GitHub / RSS 入口 |
| `404.html` | 404 | 单屏兜底，含返回首页 |

作品详情与文章页共用 `works.html` / `writing.html` 的页头样式，正文用 `.prose`（表格自动包 `.tbl-wrap`，移动端内滚不撑破页面）。

---

## 改内容去哪改

| 想改什么 | 位置 |
| --- | --- |
| 姓名 / handle | 全站 `蒋东邕` 与 `@jiangdongyong`（sed 批量替换） |
| 首页大标题、定位语 | `index.html` 的 `.hero h1` 与 `.hero-desc` |
| 首页数字指标 | `index.html` 的 `.stats` |
| 信息源 | `data/sources.json`（见下节） |
| 作品卡 | `works.html` 的 `#proj-grid`，每张 `<a class="project" href="works/<slug>.html">` |
| 作品正文 | `works/<slug>.html` 的 `article.prose` |
| 文章 | 新建 `writing/<slug>.html`（复制现有页最省事），再在 `writing.html` 和 `index.html` 的「最近文章」各加一行 `<li class="art-row">` |
| 联系方式 | `contact.html`（邮箱用 `data-mail`，见下节） |
| 颜色 | `assets/styles.css` 顶部 `:root` 与 `:root[data-theme="dark"]` |
| 首屏山景 | `index.html` 里的 `<svg class="hero-bg">` |
| 分享卡 | `assets/og-card.html` 改完重新截图成 `assets/og.png` |

---

## 信息源：`data/sources.json`

```json
{
  "updated": "2026-11-25",
  "items": [
    {
      "name": "MDN Web Docs",
      "url": "https://developer.mozilla.org/zh-CN/",
      "group": "工程与前端",
      "note": "一句话说明为什么值得读",
      "tags": ["文档", "前端"]
    }
  ]
}
```

- `group` 只有五个取值：`工程与前端` / `AI / Agent` / `Python` / `长期阅读` / `工具`。筛选 chips 由数据里出现过的 group 自动生成，加新分组不用改 JS。
- `note` 是列表里那行灰字，移动端也保留——它是「为什么值得读」的全部信息。
- `updated` 会显示成「数据更新于 …」，改完数据记得改它。
- 页面上没有内嵌副本，**只认这个文件**，所以不会出现「改了 JSON 却看到旧列表」。

---

## 主题与交互（`assets/app.js`）

- 主题：跟随 `prefers-color-scheme`，手动切换后写 `localStorage`，并在首帧渲染前应用，不会闪白。
- 导航：≤560px 收成横向可滚动菜单，品牌 handle 隐藏；≤340px 进一步隐藏「首页」。
- 作品筛选：`#tabs button[data-filter]` 与 `.project[data-tag]` 对应。
- 信息源：搜索框 `#src-q` 对 name/note/tags 做包含匹配，chips 走 `#src-chips`，空结果由 `#src-empty` 兜底，fetch 失败由 `#src-error` + `#src-retry` 兜底。
- 邮箱：`app.js` 里以 charCode 数组存放，运行时拼出地址，源码里不出现明文；`data-mail="reveal"` 点击显示并可再点复制，`data-mail="link"` 直接是 `mailto:`。
- 动效：`.reveal` 进入视口加 `.in`；`prefers-reduced-motion` 下全部关闭。

---

## SEO 与分享

- 每个页面都有完整 `<head>`：`description` / `canonical` / `og:*` / `twitter:card` / 双 `theme-color`。
- `sitemap.xml` 15 个 `<loc>`（8 个主页面 + 4 个作品 + 4 篇文章，减去 404），`lastmod` 2026-11-26。
- `feed.xml` 4 条 item，`link` 与 `guid` 都指向真实文章页，带 `atom:link rel="self"`。
- `_headers` 让 HTML 与 JSON 每次回源校验（`max-age=0, must-revalidate`），只有 `og.png` 缓存一周。改内容立刻生效，不用等缓存过期。

⚠️ **路径前提**：全站有 24 处根绝对路径（23 处 `href="/feed.xml"` + 1 处 `href="/"`）。这要求站点部署在**域名根目录**。Cloudflare Pages、Vercel、Netlify 都满足；**GitHub Pages 的项目站（`user.github.io/repo/`）不满足**，那些链接会 404——用 GH Pages 就必须配自定义域或建 `user.github.io` 仓库。

---

## 部署（Cloudflare Pages）

1. 把 `personal-site/` 推到 GitHub 仓库。
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git，选中该仓库。
3. 构建配置：Framework preset = **None**，Build command **留空**，Build output directory = `/`（如果仓库根就是网站根）或 `personal-site`。
4. Deploy。首次构建约 30 秒，之后每次 push 自动重建。
5. 想要短域名就在 Pages 里加 Custom domain，DNS 由 Cloudflare 托管时自动配好。

不需要服务器、数据库、备案（境外接入）、SSL 证书（自动签发并续期）、CDN（本身就是边缘网络）。

---

## 预览图

`previews/` 共 26 张，全部在本轮改名后用 headless Chrome 重拍：

- 桌面 1440：`hub-light` `hub-dark` `hub-full` `about-page` `now-*` `sources-list` `sources-dark` `works-list` `works-detail-top` `works-detail-body` `writing-list` `art-top` `art-table` `art-pager` `contact-shown` `404-page`
- 移动 390（@2x，780×1688）：`m-hub` `m-works` `m-detail` `m-contact` `m-sources` `m-writing-list` `m-art-top` `m-art-table` `m-art-pre` `m-art-pager` `m-work-table`

图片是验收证据，不参与站点运行。

---

## 上线检查清单

- [x] 姓名、handle、GitHub 链接已换成真实值
- [x] 邮箱可点击显示，源码无明文
- [x] 22 条信息源全部可点击，`target="_blank" rel="noopener noreferrer"`
- [x] 1440 / 1120 / 1024 / 900 / 768 / 700 / 561 / 560 / 430 / 390 / 360 / 320 十二档无横向溢出
- [x] 390 下表格内滚、代码块换行、导航 7 项全部可见
- [x] 主题切换持久化，刷新不闪白
- [ ] 域名确定为 `toska1226.github.io` 之外的值时，全站替换该串（`grep -rl toska1226.github.io .`）
- [ ] 若换邮箱：改 `assets/app.js` 里的 charCode 数组，别直接写明文
