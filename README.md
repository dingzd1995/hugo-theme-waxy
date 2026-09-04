# Waxy Theme

从 `hugo-waxy` 拆出来的独立 Hugo 主题，不含站点内容。

## 包含

- `layouts/`、`static/{css,icon,img,js}`、`archetypes/`、`data/icons.yaml`
- `package.json`（记录 `pagefind` 构建依赖）

## 不包含（需要消费站点自己提供）

- `content/`、`hugo.yaml`：站点内容和配置
- `static/usr/`：用户上传的图片/视频，跟主题无关，体积也大（原站点里 333M）
- `deploy/`：nginx 重定向规则等部署脚本，是站点级别的东西

## 接入方式

1. 作为 `themes/waxy-theme` 放进站点仓库（或 git submodule / Hugo Module 引入）
2. 站点 `hugo.yaml` 里设置 `theme: waxy-theme`
3. 构建命令必须是 `hugo --minify && pagefind --site public`（先 hugo 再跑 pagefind 索引，见 `package.json` 的 `build` 脚本），否则搜索页打不出结果
4. 首页文章列表按 `Section == "blog"` 过滤（见 `layouts/index.html`），内容需要放在 `content/blog/` 下

## 已知耦合

`static/icon/` 下的 `avatar_150.webp`、`logo*.png/webp` 是 idzd.top 这个站点自己的头像和 logo，换站点用的话需要替换。
