# SBTI · Super Bullshit Type Indicator

> 15 个维度 · 26 种人格 · 30 道题 — 用最离谱的方式揭示你最真实的人格画像

**[在线测试 · maaker.cn/sbti](https://maaker.cn/sbti)**

SBTI 是对 MBTI 的一次恶搞。它不打算把你塞进严肃心理学的盒子里，而是用 30 道题，在 15 个维度上量你一下，然后送给你一个足够自嘲、但又有点准的人格标签。

---

## 致敬

本项目完全建立在别人的成果之上，先把来龙去脉摆清楚：

- **创意原作者**：B 站 [@蛆肉儿串儿](https://space.bilibili.com/) — "SBTI" 这个恶搞概念的发明者，所有灵感源头
- **前置开源实现**：[UnluckyNinja/SBTI-test](https://github.com/UnluckyNinja/SBTI-test) — 最早把这个玩法做成可用网页的开源实现，demo 见 [sbti.unun.dev](https://sbti.unun.dev)

本仓库是 [Maaker.AI](https://maaker.cn) 用 **Next.js 16 + React 19 + Tailwind v4** 重写的版本，在前人基础上补齐了：

- 完整 SEO（metadata / OG / Twitter Card / sitemap.xml / JSON-LD Schema.org Quiz）
- 可分享的长图海报（`html-to-image` + iOS Safari 兼容性处理）
- 静态导出，可以扔到任何 CDN
- 26 种人格的视觉与文案扩展、隐藏彩蛋人格

原作的创意归原作者，这里只是把它用一套更现代的前端栈再做了一遍。

---

## 特性

- 15 维度 LMH 打分 + 曼哈顿距离匹配 26 种标准人格
- 隐藏 DRUNK 人格（触发条件：第 2 题特定选项）
- HHHH 兜底人格（匹配度 <60% 时强制分配）
- 分享海报生成（`html-to-image`），支持长图下载与二维码
- iOS Safari 全兼容（包括隐藏容器截图、图片 base64 预加载等若干小黑魔法）
- 完整 SEO：OG / Twitter Card / sitemap.xml / robots.txt / JSON-LD (Schema.org Quiz + WebSite)
- Next.js 16 静态导出，零运行时依赖，部署成本约等于零

## 本地运行

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 输出到 out/（静态导出）
```

## 技术栈

- **Next.js 16.2.3**（App Router，静态导出）
- **React 19**
- **Tailwind v4**（通过 `@tailwindcss/postcss`）
- **html-to-image**（分享海报生成）
- **qrcode**（分享二维码）

## 打分算法

测试逻辑是纯函数，都在 `src/data/scoring.ts` 里：

1. 30 题按维度分组求和 → 每维度得 L / M / H（低/中/高）
2. 对每种标准人格，计算用户 L/M/H 向量与目标人格 pattern 的曼哈顿距离
3. 按距离 → 精准命中数 → 相似度排序
4. 特殊路径：DRUNK 彩蛋 / HHHH 兜底

具体实现看 `computeResult` 函数，很短，一眼看懂。

## 目录结构

```
src/
├── app/
│   ├── page.tsx             # 首页 → redirect /sbti
│   └── sbti/
│       ├── page.tsx         # Landing
│       ├── test/            # 测试页
│       ├── result/          # 结果页
│       └── types/           # 人格库浏览
├── components/
│   ├── RadarChart.tsx       # 15 维度雷达图
│   ├── SharePoster.tsx      # 分享海报
│   ├── PatternViz.tsx
│   └── Footer.tsx
└── data/
    ├── questions.ts         # 30 道题
    ├── dimensions.ts        # 15 维度元数据
    ├── types.ts             # 26 种人格（文案 / 图片 / 分组）
    └── scoring.ts           # 打分 + 分享 URL 编解码
```

## 贡献

欢迎 PR，尤其是：

- 新增人格类型（需要好的文案，不要 AI 味）
- 多语言翻译（目前只有中文）
- 新维度设计与打分算法优化

## License

MIT © [Maaker.AI](https://maaker.cn)

---

## English (brief)

**SBTI (Super Bullshit Type Indicator)** is a Chinese-internet parody of MBTI — instead of serious psychology labels, it gives you one of 26 absurdly self-deprecating personality types through 30 questions across 15 dimensions.

**Credits**: The concept comes from Bilibili creator [@蛆肉儿串儿](https://space.bilibili.com/). The first open-source web implementation is [UnluckyNinja/SBTI-test](https://github.com/UnluckyNinja/SBTI-test) (demo: [sbti.unun.dev](https://sbti.unun.dev)). This repository is a Next.js 16 rewrite by [Maaker.AI](https://maaker.cn), adding full SEO, shareable poster generation, static export, and extended personality content.

Built with Next.js 16, React 19, Tailwind v4. Deployed as a static export at [maaker.cn/sbti](https://maaker.cn/sbti).
