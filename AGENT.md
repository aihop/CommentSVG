# Project: GitHub Discussions SVG Comments for Markdown

## Background

I am building a memoir project called "Reconstruct" hosted on GitHub.

Each chapter is written as a Markdown file:

```text
01-kicked-out-for-300.md
02-experimental-class-list.md
03-four-hundred-ducks.md
```

I want readers to discuss each chapter using GitHub Discussions.

However, GitHub Markdown files cannot execute JavaScript and cannot render dynamic comment widgets.

My goal is:

* Readers comment in GitHub Discussions
* Cloudflare Worker fetches comments
* Worker renders comments as SVG
* Markdown embeds the SVG image
* Comments appear directly inside GitHub-rendered Markdown

Example:

```md
## 💬 Reader Notes

![](https://comments.aihop.io/reconstruct/01.svg)

👉 Join Discussion:
https://github.com/aihop/Refactoring-the-Self/reconstruct/discussions/1
```

The SVG should update automatically whenever new comments are added.

No database required.

GitHub Discussions should be the source of truth.

---

## Technical Stack

Use:

* Cloudflare Workers
* TypeScript
* GitHub GraphQL API
* SVG generation
* Cloudflare KV cache (optional)
* Wrangler

Do NOT use React.

Do NOT use Canvas.

Do NOT generate PNG files.

Return pure SVG.

---

## API Design

Route:

```text
GET /reconstruct/:chapter.svg
```

Examples:

```text
/reconstruct/01.svg
/reconstruct/02.svg
/reconstruct/03.svg
```

Map each chapter to a GitHub Discussion.

Possible mapping:

```ts
const chapterMap = {
  "01": 1,
  "02": 2,
  "03": 3
}
```

Or support JSON configuration.

---

## GitHub Integration

Fetch:

* Discussion title
* Latest comments
* Comment author
* Avatar URL
* Created time
* Reactions count

Use GitHub GraphQL API.

Authentication:

```text
GITHUB_TOKEN
```

Stored as Worker Secret.

---

## SVG Layout Requirements

The SVG should look like a premium reading experience.

Style inspiration:

* GitHub
* Linear
* Vercel
* Notion

Avoid flashy colors.

White background.

Subtle borders.

Rounded corners.

Typography focused.

---

Example Layout

```text
────────────────────────

💬 Reader Notes

@xiaoming

That bun story reminded me of my childhood.

❤️ 42

────────────────────────

@laowang

I cried when the mother followed behind.

❤️ 18

────────────────────────

View all comments →
```

---

## Visual Design

Width:

```text
800px
```

Height:

Auto based on comments.

Use:

```text
font-family:
Inter,
system-ui,
sans-serif
```

Colors:

```text
#18181b
#52525b
#71717a
#e4e4e7
```

Card radius:

```text
16px
```

Padding:

```text
24px
```

---

## Comment Rules

Display:

* latest 3 comments

If more comments exist:

```text
+12 more comments...
```

Display:

* avatar
* username
* content
* likes

Truncate long comments.

Maximum:

```text
140 chars
```

---

## Cache Strategy

Use Cloudflare Cache API.

Cache:

```text
10 minutes
```

Optional:

Use KV.

Store:

```text
discussion_id -> rendered svg
```

TTL:

```text
600 seconds
```

---

## Output

Return:

```http
Content-Type: image/svg+xml
```

SVG must work directly inside:

* GitHub Markdown
* GitHub README
* GitHub Pages
* Static blogs

---

## Bonus Features

Support:

```text
/reconstruct/01.svg?theme=light
/reconstruct/01.svg?theme=dark
```

Support:

```text
/reconstruct/01.svg?comments=5
```

Support:

```text
/reconstruct/01.svg?compact=true
```

Support:

```text
/reconstruct/01.svg?lang=zh
```

---

## Deliverables

Generate:

1. Complete Cloudflare Worker project
2. Folder structure
3. TypeScript source code
4. GitHub GraphQL integration
5. SVG renderer
6. Wrangler configuration
7. Environment variable setup
8. Deployment guide
9. README
10. Example Markdown integration

The code should be production-ready.
