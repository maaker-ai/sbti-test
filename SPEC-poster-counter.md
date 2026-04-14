# SBTI 海报编号 + 访客计数器

## 背景

SBTI (https://maaker.cn/sbti) 是一个 parody 人格测试，Next.js 16 静态导出（`output: 'export'`），部署在 nginx 上，**目前无任何后端**。

上线后靠分享海报 + 二维码自然增长，**3 天独立访客 207 人**（2026-04-14 数据），增长曲线陡峭，需要尽快把"社交货币"机制接上。
目标：给每个测试者发一个**真实递增的编号**，打印在分享海报上，形成稀缺感和社交货币；同时给 landing 页加一个公开访客计数器，作为社交证明和月报数据源。

## 需求

### 1. 海报编号（双计数器 + 双位置）

每完成一次测试，发**两个编号**：
- **全局编号**：所有测试者共享一个递增计数器，从 **208** 开始
- **类型内编号**：26 个性格类型各自独立计数器，从 **1** 开始

海报上**两处显示**，分工承担不同叙事：

**位置 A · 顶部抬头**（替换现有 `SBTI 人格测试` 小 label）
> `SBTI Bullshit 病历档案 · No.0208`

- 用**全局编号**（4 位补零）
- 起"档案抬头"作用，让整张海报像一份病历
- "Bullshit" 是品牌梗（SBTI = Super **Bullshit** Type Indicator），集中在顶部打品牌

**位置 B · 右下角确诊印戳**（absolute 定位，不挤压现有元素）
> `第 12 位 BOSS型 患者`
> `2026.04.14 确诊`

- 用**类型内编号**
- 仿橡皮章样式：方框边框 + 轻微旋转 + 半透明 + theme accent 色
- 文案沿用原 SPEC "第 N 位 + 患者 + 确诊日期" 风格，加上类型作定语
- 位置在 footer QR 的对角空白处

**屏幕端结果页**：同样两处显示（顶部档案号 + 中段附近的印戳），与海报视觉一致

**老 badge 不动**：中段的 `匹配度 87% · 精准命中 11/15 维`（含 DRUNK / HHHH 兜底的特殊文案）原位保留，作为算法可信度信号

### 2. Landing 页访客计数器
- `/sbti` landing 页显示一行小字：`已有 XXX 人测过`
- 数字 = 海报顶部"全局编号"的当前值（共享同一全局计数器）
- 允许缓存，不要求实时；5 分钟 stale 可接受

### 3. 分享链接接收者
- 通过 `?d=...` 访问结果页的接收者**不发新编号**，不调用 `/api/complete`
- 海报顶部抬头与右下印戳**不渲染**（优雅降级，留白即可）
- 老 badge 仍正常显示

### 4. 月报数据
- 提供一个只读端点，返回当前总数 + 按日分布（最近 30 天）+ 按类型分布，供手动写月报时取数

## 技术方案

### 后端：复用国内自托管 Supabase

**直接接入服务器 `1.15.12.53` 上已有的自托管 Supabase**（对外域名 `https://api.maaker.cn`），不再单独起 Fastify+SQLite 服务。

理由：
- 该 Supabase 已经被其他生产业务（maker-cn 等）使用，是机器上的"共享后端基础设施"，监控/备份/重启策略已完备
- SBTI 这个需求仅是"一张计数器表 + 一张流水表 + 一个原子事务"，加表即可，零运维负担
- 域名已是国内 `*.maaker.cn`，**无海外依赖**，延迟可控
- 一致性事务用 PostgreSQL 函数实现，比 SQLite 的事务更标准

### 隔离策略
SBTI 的表全部前缀 `sbti_`，避免污染 `public` schema 里其他业务的表。也可以单独建 schema `sbti`，按现有项目惯例选（部署时确认 maker-cn 用的是哪种）。

### CORS / 路由
- 前端从 `https://maaker.cn/sbti` 调 `https://api.maaker.cn`，跨子域 → Supabase 默认 CORS 已开放，无需 nginx 改动
- 不需要在 maaker-cn 的 nginx 加 `/sbti/api/` 反代

### 数据存储（PostgreSQL，3 张表 + 1 个 RPC）

放在 `supabase/migrations/<timestamp>_sbti_counter_init.sql`：

```sql
-- 全局计数器
CREATE TABLE sbti_counter_global (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    value BIGINT NOT NULL
);
INSERT INTO sbti_counter_global (id, value) VALUES (1, 207);

-- 类型内计数器（26 个 type_code，按需 upsert）
CREATE TABLE sbti_counter_by_type (
    type_code TEXT PRIMARY KEY,
    value BIGINT NOT NULL DEFAULT 0
);

-- 完成流水
CREATE TABLE sbti_completions (
    id BIGSERIAL PRIMARY KEY,
    type_code TEXT NOT NULL,
    global_id BIGINT NOT NULL,
    type_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sbti_completions_type ON sbti_completions(type_code);
CREATE INDEX idx_sbti_completions_created ON sbti_completions(created_at);

-- 原子 RPC：一次调用拿到双编号
CREATE OR REPLACE FUNCTION sbti_complete(p_type_code TEXT)
RETURNS TABLE(global_id BIGINT, type_id BIGINT, type_code TEXT, date TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    g BIGINT;
    t BIGINT;
BEGIN
    UPDATE sbti_counter_global SET value = value + 1 WHERE id = 1 RETURNING value INTO g;

    INSERT INTO sbti_counter_by_type (type_code, value)
    VALUES (p_type_code, 1)
    ON CONFLICT (type_code) DO UPDATE SET value = sbti_counter_by_type.value + 1
    RETURNING value INTO t;

    INSERT INTO sbti_completions (type_code, global_id, type_id) VALUES (p_type_code, g, t);

    RETURN QUERY SELECT g, t, p_type_code, to_char(now() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD');
END;
$$;

-- 公开总数（供 landing 页读取，无需鉴权）
CREATE OR REPLACE VIEW sbti_total_count AS
SELECT value AS total FROM sbti_counter_global WHERE id = 1;

-- RLS：禁止直接读写表，只允许 anon 调用 sbti_complete + 读 view
ALTER TABLE sbti_counter_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbti_counter_by_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbti_completions ENABLE ROW LEVEL SECURITY;
GRANT EXECUTE ON FUNCTION sbti_complete(TEXT) TO anon;
GRANT SELECT ON sbti_total_count TO anon;
```

月报数据走 service_role（不开放给 anon）：直接 SELECT `sbti_completions` 做日聚合 + 类型聚合，或后续再写一个 `sbti_stats()` RPC。

### 环境隔离
**生产和 Staging 共用同一个 Supabase 实例**（`api.maaker.cn`），通过表前缀区分：
- 生产：`sbti_*` 系列表
- Staging：`sbti_staging_*` 系列表（migration 同步生成一份镜像表 + RPC `sbti_staging_complete`）
- 前端通过环境变量切换调用哪套 RPC：
  - prod build → `RPC sbti_complete` / view `sbti_total_count`
  - staging build → `RPC sbti_staging_complete` / view `sbti_staging_total_count`

理由：自托管 Supabase 单实例，建两个 project 不现实；用表前缀比建独立 schema 简单，向后兼容也好。

### 前端调用方式（Supabase JS Client）

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,    // https://api.maaker.cn
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 完成测试 → 拿双编号
const { data, error } = await supabase.rpc('sbti_complete', { p_type_code: 'BOSS' });
// data: [{ global_id: 208, type_id: 12, type_code: 'BOSS', date: '2026-04-14' }]

// landing 页 → 总数
const { data } = await supabase.from('sbti_total_count').select('total').single();
// data: { total: 420 }
```

环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=https://api.maaker.cn
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # 从 maker-cn/web-next/.env.local 复制
```

月报数据：本地用 service_role key 直接查 `sbti_completions` 即可，不开公开端点。

### 前端集成点（仓库：当前这个）

**`src/lib/supabase.ts`**（新文件）
- 初始化 supabase client，导出 `recordCompletion(typeCode)` 和 `getTotalCount()` 两个函数

**`src/app/sbti/test/page.tsx`**（测试页）
- 用户答完最后一题、跳转到 `/sbti/result` 之前：
  1. 本地用 `computeResult` 算出 `finalType.code`
  2. 调 `recordCompletion(typeCode)` → 拿到 `{ global_id, type_id, date }`
- 把返回值塞进 sessionStorage（或 URL query），传给 result 页
- 网络失败时**不要阻塞跳转**：用 `Promise.race` 加 800ms 超时，失败则 `globalId/typeId = null`，result 页渲染时跳过两处编号

**`src/app/sbti/result/page.tsx`**（结果页）
- 从 sessionStorage 读出 `{ global_id, type_id, date }`，传给 `SharePoster`
- 屏幕端也按"顶部抬头 + 印戳"渲染同样内容（视觉与海报一致）
- `from=share` 接收者：完全不读 sessionStorage，不渲染编号

**`src/components/SharePoster.tsx`**（分享海报）
- 新增 props：`globalId?: number`、`typeId?: number`、`diagnosedAt?: string`
- **顶部位置**：替换原 `SBTI 人格测试` 小 label，渲染 `SBTI Bullshit 病历档案 · No.{padStart(globalId,4,'0')}`；`globalId` 为空时回退到原文案
- **右下印戳**：absolute 定位 + 旋转 + 边框，渲染 `第 {typeId} 位 {finalType.code}型 患者` / `{date} 确诊`；`typeId` 为空时不渲染
- ⚠️ `html-to-image` 生成 PNG 对字体/图片加载敏感，改 DOM 后**必须手动测 iOS Safari 海报生成**（参考 commit `8f26d6e`, `f23e3f4`, `102d286` 的历史坑）。印戳的 `transform: rotate()` + `border` 是高风险点，iOS Safari 必测；崩了就降级到不旋转、纯方框

**`src/app/sbti/page.tsx`**（landing）
- 增加 `'use client'` 小组件 `<VisitorCount />`，mount 时调 `getTotalCount()`，显示 `已有 XXX 人测过`
- 失败时隐藏，不要显示"加载失败"

### 分享链接场景

通过 `?d=...` 参数访问结果页的**接收者**（不是测试者本人）：
- **不调用 `recordCompletion`**，不发新编号
- 海报顶部抬头与右下印戳**不渲染**（优雅降级，留白即可）
- 老 badge（"匹配度 87%"）正常显示
- **不**在分享 URL 里带 `id` / `dt`，避免污染 `decodeShareUrl` 的兼容面

## 验收标准

- [ ] 连测 3 次同一类型，类型内编号 +1 +1 +1，全局编号也 +1 +1 +1
- [ ] 两个浏览器同时完成测试（不同类型），全局编号无重复，类型内编号各自独立递增
- [ ] 断网测试 → 800ms 超时后跳转不被阻塞 → 海报顶部抬头 + 印戳优雅降级（不渲染、留白）
- [ ] iOS Safari（真机）生成海报 PNG，顶部抬头和右下印戳都正确显示、字体不糊、印戳旋转/边框正常
- [ ] landing 页刷新看到访客数，数字和 `sbti_total_count` view 返回一致
- [ ] 静态导出构建不报错（`npm run build` 通过）
- [ ] 分享链接接收者（`from=share`）不调 RPC，海报顶部抬头和印戳都不渲染
- [ ] Staging 测过再 deploy prod，prod 表和 staging 表数据完全隔离

## 不做的事（明确划边界）

- ❌ 不做用户账号 / 不做登录
- ❌ 不做"我的测试历史"
- ❌ 不做防刷限频（后期如果被刷再说）
- ❌ 不动 `encodeShareUrl` / `decodeShareUrl`（向后兼容是硬约束）
- ❌ 不改变现有纯静态导出的部署方式（前端还是 `out/` rsync 到 nginx；后端复用现有 Supabase）
- ❌ 不在仓库里跑独立后端服务（无 Fastify、无 systemd、无 nginx 改动）

## 工作量预估

- Supabase migration（建表 + RPC + RLS）+ 跑到 prod/staging: 0.5 天
- 前端 Supabase client 封装 + 三处集成 + 海报样式（顶部抬头 + 右下印戳）: 1 天
- iOS Safari 真机海报测试 + 修坑: 0.5 天
- 总计 2 天

## 服务器/后端访问

- **Supabase 实例**：`https://api.maaker.cn`（自托管，反代到 `1.15.12.53`）
- **anon key**：复用 `maker-cn/web-next/.env.local` 里的值，写进本仓库 `.env.local`
- **service_role key**：本地写 migration + 跑月报数据时用，从 maker-cn 服务器配置取（部署阶段登录确认）
- **服务器 SSH**：主机 `1.15.12.53`，用户 `xiaopang`，凭据 `obsidian:Server/maaker-cn-服务器凭据.md`
- **Migration 执行方式**：参考 `maker-cn/web-next/supabase/migrations/` 既有命名规范 `YYYYMMDDHHMMSS_xxx.sql`，用 supabase CLI push 或直接 psql 执行

## 相关文件路径

- 项目根：`/Users/martin/OpenSource/sbti-test`
- 新增文件：
  - `supabase/migrations/<timestamp>_sbti_counter_init.sql`
  - `src/lib/supabase.ts`
- 修改文件：
  - `src/app/sbti/test/page.tsx`
  - `src/app/sbti/result/page.tsx`
  - `src/app/sbti/page.tsx`（加 `<VisitorCount />`）
  - `src/components/SharePoster.tsx`
- 部署脚本：`scripts/deploy-prod.sh`（main 分支）、`scripts/deploy-staging.sh`（staging 分支）
- 架构说明：`CLAUDE.md`
