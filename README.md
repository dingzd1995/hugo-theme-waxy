# Hugo Theme Waxy

一个简洁、轻量的中文博客主题，由 Typecho 主题 [typecho-theme-waxy](https://github.com/dingzd1995/typecho-theme-waxy) 迁移到 Hugo。

- 演示站点：<https://test.706x.com/>
- 作者主页：<https://www.idzd.top/>

## 特性

- 响应式布局，支持深色模式
- 文章列表支持「摘要卡片」与「全文」两种模式
- 基于 [Pagefind](https://pagefind.app/) 的纯静态站内搜索
- 文章封面自动解析：front matter `img` → 正文首图 → 随机图池 → canvas 气泡装饰背景
- 侧边栏组件：关于卡片、分类、标签、最新文章、归档
- 置顶 / 推荐文章、文章目录（TOC）、图片灯箱与懒加载
- 独立页面模板：归档、时间线、友情链接、搜索、Hero 落地页
- 丰富的短代码：提示框、折叠块、高亮文本、音视频等
- 内置 SEO / Open Graph 元信息

## 环境要求

- Hugo **extended** `>= 0.165.0`
- Node.js（用于运行 Pagefind 生成搜索索引）

## 安装

在站点根目录下，以 git submodule 方式引入：

```bash
git submodule add https://github.com/dingzd1995/hugo-theme-waxy.git themes/waxy-theme
```

然后在 `hugo.yaml` 中启用：

```yaml
theme: waxy-theme
```

安装 Pagefind：

```bash
npm install -D pagefind
```

## 构建

搜索功能依赖构建后的 Pagefind 索引，**必须先 hugo 再 pagefind**：

```bash
hugo --minify && npx pagefind --site public
```

本地预览：`hugo server -D`（开发模式下搜索页没有索引，属正常现象；如需调试搜索，先完整构建一次再预览 `public/`）。

## 内容约定

- 文章放在 `content/blog/` 下，首页列表按 `Section == "blog"` 过滤
- 分类法使用单数形式 `category` / `tag`
- 内容根目录下的独立页面（如 `about.md`）会自动出现在导航栏，分类也会平铺到导航栏
- 搜索页需自行创建 `content/search.md`

推荐的站点配置：

```yaml
taxonomies:
  category: category
  tag: tag

permalinks:
  blog: /archives/:slug/

markup:
  goldmark:
    renderer:
      unsafe: true
    parser:
      autoHeadingID: true
  highlight:
    style: base16-snazzy
    noClasses: true
    lineNos: true
    lineNumbersInTable: false
    codeFences: true
```

## 配置参数

所有参数写在 `hugo.yaml` 的 `params` 下。完整的带注释配置见 [`exampleSite/hugo.yaml`](exampleSite/hugo.yaml)，可直接复制到站点根目录使用。

```yaml
params:
  # 基础信息
  logoUrl: "/icon/logo.webp"
  faviconUrl: "/icon/favicon.ico"
  siteDescription: "站点描述，用于 SEO"
  authorName: "Waxy"               # 文章作者署名
  startTime: "2019-11-23 13:55:00" # 建站时间，用于显示运行天数
  ICP: ""                          # 备案号，留空则不显示

  # 侧边栏关于卡片
  cardBg: "/usr/cover/background.webp"
  cardImg: "/icon/avatar.webp"
  cardName: "Waxy"
  cardDescription: "轻量高效，悦于书写"
  # 社交图标，每行一个：图标名,链接
  # 可用图标：rss github facebook twitter telegram email discord weibo wechat
  cardlinks: |
    github,https://github.com/yourname
    email,mailto:you@example.com

  # 侧边栏组件及顺序
  # 可选：ShowAbouts ShowCategory ShowTags ShowRecentPosts ShowArchive
  sidebarBlock: ["ShowAbouts", "ShowCategory", "ShowTags", "ShowRecentPosts", "ShowArchive"]

  # 文章列表
  articlesList: 0        # 0 = 摘要模式，1 = 全文模式
  sticky: ["2668"]       # 置顶文章的 slug 列表
  toptext: ""            # 顶部公告，支持 HTML，留空不显示

  # 封面与装饰背景
  findFirstImage: true   # 无 img 字段时取正文第一张图做封面
  firstImage:            # 无封面时的随机图池，文件放在站点 assets/covers/ 下
    - header_bg_1.jpg
    - header_bg_2.jpg
  # hybrid：优先用图池/cardBg，未配置时回退 canvas 气泡（默认）
  # css：   始终使用 canvas 气泡
  # off：   关闭装饰背景
  decorBgMode: "hybrid"

  # 页面功能
  loadHtml: true         # 页面加载动画
  showToc: true          # 文章目录
  navbarSearch: true     # 导航栏搜索框
  picAlign: "center"     # 正文图片对齐：center / left
  fancyboxs: true        # 图片灯箱
  jqlazyload: true       # 图片懒加载

  # 友情链接，每行一个：名称,链接,图标,描述
  links: |
    IDZD,https://www.idzd.top/,https://www.idzd.top/favicon.ico,乐于探索
```

## 文章 Front Matter

```yaml
---
title: "文章标题"
date: 2026-01-01T12:00:00+08:00
slug: "hello-world"
category: ["note"]
tag: ["hugo"]
img: "/usr/cover/xxx.webp"  # 可选，指定封面图
hideCover: false            # 可选，不显示封面
star: false                 # 可选，标记为推荐文章
---
```

## 页面模板

在内容文件的 front matter 中通过 `layout` 指定：

| layout     | 用途       | 示例 |
|------------|------------|------|
| `archive`  | 文章归档   | `content/archive.md` |
| `timeline` | 时间线     | 正文写成列表即可 |
| `links`    | 友情链接   | 数据来自 `params.links` |
| `search`   | 搜索结果页 | `url: /search/` |
| `hero`     | 落地页     | 见下方 |

搜索页示例：

```yaml
---
title: "搜索"
url: /search/
layout: search
---
```

Hero 落地页示例：

```yaml
---
title: "hero"
layout: hero
hero_title: "大标题"
hero_subtitle: "副标题"
hero_btn_text: "按钮文字"
hero_btn_link: "https://example.com/"
---
```

## 短代码

```markdown
{{% alert style="info" %}}提示框，style 可选 success / info / warning / danger，加 close="true" 可关闭{{% /alert %}}

{{% info %}}信息提示{{% /info %}}
{{% warning %}}警告提示{{% /warning %}}
{{% danger %}}错误提示{{% /danger %}}

{{% shrinks title="点击展开" checked="false" %}}折叠内容{{% /shrinks %}}

{{< hi >}}高亮文字{{< /hi >}}
{{% em %}}强调块{{% /em %}}
{{% lo %}}弱化块{{% /lo %}}

{{< check >}} 已完成   {{< uncheck >}} 未完成

{{< video src="/usr/video.mp4" poster="/usr/poster.jpg" >}}
{{< audio src="/usr/music.mp3" >}}
```

## 自定义

`static/icon/` 下的头像与 logo（`avatar_150.webp`、`logo*.png/webp`、`favicon*.ico`）为作者站点所用，使用时请在站点的 `static/icon/` 下放置同名文件覆盖，或通过 `logoUrl`、`faviconUrl`、`cardImg` 指向自己的图片。

## 许可证

[MIT](LICENSE)
