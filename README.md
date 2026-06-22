# CommentSVG

Render GitHub Discussions comments as SVG for embedding in Markdown files.

将 GitHub Discussions 评论渲染为 SVG，嵌入 Markdown 文件中。

---

## 项目背景 / Background

### 中文

将 GitHub Discussions 的评论渲染成 SVG 图片，可以直接嵌入 GitHub Markdown / README / Pages 中。评论数据实时从 GitHub API 获取，无需数据库。

### English

Render GitHub Discussions comments as SVG images that can be directly embedded in GitHub Markdown / README / Pages. Comments are fetched live from the GitHub API — no database required.

---

## 使用方式 / Usage

### 中文

#### 1. 配置章节映射

编辑 [src/config.ts](src/config.ts)，将你的章节编号映射到 GitHub Discussion 编号：

```ts
export const chapterMap = {
  "01-kicked-out-for-300": 2,  // 01 章 → Discussion #2
};

export const repoConfig = {
  owner: "aihop",               // GitHub 用户名
  name: "Refactoring-the-Self", // 仓库名
};
```

#### 2. 设置 GitHub Token

生成一个 GitHub Personal Access Token，需要 `metadata` 和 `read:discussion` 权限：

- 生成地址：https://github.com/settings/tokens
- 设置为 Worker Secret（不要写在代码里）：

```bash
npx wrangler secret put GITHUB_TOKEN
```

#### 3. 部署到 Cloudflare

```bash
# 安装依赖
npm install

# 部署
npx wrangler deploy

# 本地开发
npx wrangler dev
```

#### 4. 在 Markdown 中嵌入

部署后，你会得到一个 Worker URL。

在 GitHub Markdown 文件中嵌入评论（以本项目的 `reconstruct/01-kicked-out-for-300.svg` 为例）：

```md
## 💬 读者笔记

![](https://commentsvg.coller.workers.dev/reconstruct/01-kicked-out-for-300.svg)

👉 [参与讨论](https://github.com/aihop/Refactoring-the-Self/discussions/2)
```

#### 5. 查询参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `light` / `dark` | `light` | 主题配色 |
| `comments` | 数字 | `3` | 显示的评论数（最大 20） |
| `compact` | `true` / `false` | `false` | 紧凑模式，更小的头像和间距 |
| `lang` | `en` / `zh` | `en` | 界面语言 |

示例：

```md
![](https://commentsvg.coller.workers.dev/reconstruct/01-kicked-out-for-300.svg?theme=dark&comments=5&compact=true&lang=zh)
```

---

### English

#### 1. Configure Chapter Mapping

Edit [src/config.ts](src/config.ts) to map your chapter identifiers to GitHub Discussion numbers:

```ts
export const chapterMap = {
  "01-kicked-out-for-300": 2,  // Chapter 01 → Discussion #2
};

export const repoConfig = {
  owner: "aihop",
  name: "Refactoring-the-Self",
};
```

#### 2. Set Up GitHub Token

Generate a GitHub Personal Access Token with `metadata` and `read:discussion` scopes:

- Generate at: https://github.com/settings/tokens
- Set it as a Worker Secret (never hardcode it):

```bash
npx wrangler secret put GITHUB_TOKEN
```

#### 3. Deploy to Cloudflare

```bash
# Install dependencies
npm install

# Deploy
npx wrangler deploy

# Local development
npx wrangler dev
```

#### 4. Embed in Markdown

After deployment, you'll get a Worker URL.

Embed comments in your GitHub Markdown files (using this project's `reconstruct/01-kicked-out-for-300.svg` as example):

```md
## 💬 Reader Notes

![](https://commentsvg.coller.workers.dev/reconstruct/01-kicked-out-for-300.svg)

👉 [Join Discussion](https://github.com/aihop/Refactoring-the-Self/discussions/1)
```

#### 5. Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `theme` | `light` / `dark` | `light` | Color theme |
| `comments` | number | `3` | Number of comments to show (max 20) |
| `compact` | `true` / `false` | `false` | Compact mode with smaller avatars and spacing |
| `lang` | `en` / `zh` | `en` | Interface language |

Example:

```md
![](https://commentsvg.your-subdomain.workers.dev/reconstruct/01.svg?theme=dark&comments=5&compact=true&lang=zh)
```

---

## 开发命令 / Commands

```bash
npm run dev          # 本地开发 / Local development
npm run deploy       # 部署 / Deploy to production
npm run typecheck    # 类型检查 / Type check
```

---

## 技术栈 / Tech Stack

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **API**: GitHub GraphQL API
- **Rendering**: Pure SVG (no React, no Canvas)
- **Cache**: Cloudflare Cache API (10 min TTL)
- **Optional**: Cloudflare KV

---

## 许可证 / License

MIT
