# CreatorDeal 项目问题清单

> 最后更新：2026-07-03
> 本文档记录项目中已发现的所有问题、缺失功能和潜在风险。

---

## 已修复问题汇总

| 问题 | 状态 | 修复方式 |
|------|------|----------|
| P0-1 发票无 PDF | ✅ | `@react-pdf/renderer` + `components/invoice-pdf.tsx` |
| P0-2 发票不发邮件 | ✅ | `/api/invoices/send` 端点，PDF 附件 + Resend |
| P0-4 合同无文件上传 | ✅ | `/api/contracts/upload` 端点 + Supabase Storage |
| P1-1 利率数据自引用 | ✅ | `rate_benchmarks` 预置表 + `rate_aggregates` 聚合表 |
| P1-2 发票发送假按钮 | ✅ | Send 按钮调用真实 API |
| P1-3 无 OAuth 回调 | ✅ | `/auth/callback` 路由 + exchangeCodeForSession |
| P1-4 无密码重置 | ✅ | `/reset-password` 页面 + resetPasswordForEmail |
| P1-5 无 Deliverables 管理 | ✅ | `lib/trpc/routers/deliverables.ts` CRUD 路由 |
| P2-4 登录双重重定向 | ✅ | `router.push("/home")` 替代 `router.push("/")` |
| P2-5 仪表盘趋势值硬编码 | ✅ | `trendValue: 0` 替代 `trendValue: 24` |
| P2-7 checkOverdue 越权 | ✅ | UPDATE 添加 `.eq("user_id", ctx.user.id)` |
| P3-2 品牌 notes 无 UI | ✅ | Add/Edit Brand 对话框添加 notes 输入框 |
| P3-4 Invoice 类型不匹配 | ✅ | `deal` → `deals`，所有引用已修复 |

---

## 目录

1. [紧急问题（P0）](#1-紧急问题p0)
2. [高优先级问题（P1）](#2-高优先级问题p1)
3. [中优先级问题（P2）](#3-中优先级问题p2)
4. [低优先级问题（P3）](#4-低优先级问题p3)
5. [各模块详细问题](#5-各模块详细问题)
6. [落地页虚假宣传](#6-落地页虚假宣传)
7. [设置页面桩功能](#7-设置页面桩功能)
8. [数据库 Schema 与代码不一致](#8-数据库-schema-与代码不一致)
9. [未使用代码和依赖](#9-未使用代码和依赖)
10. [安全与合规风险](#10-安全与合规风险)

---

## 1. 紧急问题（P0）

这些问题直接影响核心功能的可用性，不解决等于功能不存在。

### P0-1：发票没有 PDF 生成功能
- **位置**：`app/(dashboard)/invoices/page.tsx`
- **现状**："下载"按钮保存的是 `.txt` 纯文本文件；"打印/保存 PDF" 按钮调用 `window.print()`，依赖浏览器打印对话框
- **影响**：品牌方无法收到专业格式的发票，发票模块形同虚设
- **需要**：集成 `@react-pdf/renderer` 或 Puppeteer，生成正式 PDF 并提供下载/邮件发送

### P0-2：发票不发邮件
- **位置**：`app/(dashboard)/invoices/page.tsx`，"Send" 按钮逻辑
- **现状**：点击"Send"只把数据库状态改为 `sent`，不调用任何邮件 API。Resend 基础设施（`lib/resend/client.ts`、`app/api/send-email/route.ts`）已存在但从未被发票模块调用
- **影响**：品牌方永远不会收到发票通知

### P0-3：Stripe 集成为零
- **位置**：全局
- **现状**：`.env.example` 中配置了 `STRIPE_SECRET_KEY`、`STRIPE_PUBLISHABLE_KEY`、`STRIPE_WEBHOOK_SECRET`，但 `package.json` 中没有 `stripe` SDK，代码中没有任何 Stripe 调用
- **影响**：无法在线收款、无法生成支付链接、定价页面的"升级"按钮是假的

### P0-4：合同模块无文件上传功能
- **位置**：`app/(dashboard)/contracts/page.tsx`
- **现状**：添加合同时只让输入文件名字符串，没有 `<input type="file">`，没有 Supabase Storage 集成，`file_url` 字段永远为空
- **影响**：用户只能手动记录"我有个合同叫 xxx.pdf"，无法上传、查看或管理合同文件

### P0-5：合同 AI 分析未实现
- **位置**：`app/(dashboard)/contracts/page.tsx`、`lib/trpc/routers/contracts.ts`
- **现状**：数据库有 `ai_summary`、`risks`、`key_terms`、`usage_rights` 四个 JSONB 字段，`updateAnalysis` mutation 存在，但没有任何代码调用 AI API。`.env.example` 中的 `AI_API_KEY`、`AI_BASE_URL` 从未被引用
- **影响**：详情面板显示 "AI analysis coming soon"，AI 合同扫描功能完全不存在

---

## 2. 高优先级问题（P1）

### P1-1：利率基准数据是自引用的假数据
- **位置**：`lib/trpc/routers/rates.ts` 的 `getStats`、`app/(dashboard)/rates/page.tsx`
- **现状**："市场中位数对比"只计算用户自己的历史数据。用户存了 3 条 YouTube 报价（$3k、$5k、$7k），系统显示"中位数 $5k，你处于市场水平"——实际上全部来自用户自己
- **影响**：所谓的"基准对比"毫无意义，误导用户

### P1-2：邮件发送功能全是假的
- **位置**：多处
  - `app/(dashboard)/payments/page.tsx`：`sendFollowUp` 函数（行 164-166）只显示 `toast.success("Follow-up sent")`，不调用任何 API
  - `app/(dashboard)/invoices/page.tsx`：发送按钮不发邮件
  - `app/(dashboard)/payments/page.tsx`：逾期提醒邮件不发送
- **影响**：用户以为邮件已发送，实际什么都没发生

### P1-3：没有 OAuth 回调路由
- **位置**：`app/(auth)/login/page.tsx`、`app/(auth)/signup/page.tsx`
- **现状**：Google 登录使用 `signInWithOAuth({ provider: "google" })`，redirect 到 `/`，但没有标准的 `/auth/callback` 路由调用 `supabase.exchangeCodeForSession()`
- **影响**：OAuth 登录可能静默失败——用户被重定向回 `/` 但 session 未建立

### P1-4：没有密码重置流程
- **位置**：`app/(auth)/login/page.tsx`
- **现状**：登录页有"忘记密码"链接调用 `supabase.auth.resetPasswordForEmail`，但没有对应的重置密码页面来处理 token 交换
- **影响**：密码重置链接点开后无法完成重置

### P1-5：没有 Deliverables 管理功能
- **位置**：数据库 `deliverables` 表已建（`schema.sql` 行 54-65），但无 tRPC 路由、无 UI 页面
- **现状**：`deals.ts` 的 `getById` 查询包含 `.select("*, deliverables(*)")`，但没有 deal 详情页调用它。用户无法创建、编辑、删除交付物
- **影响**：deal 管理缺少最关键的执行层——具体要交付什么

---

## 3. 中优先级问题（P2）

### P2-1：无自动化截止日期提醒
- **位置**：全局
- **现状**：数据库有 `deadline` 通知类型，但没有任何代码创建该类型的通知。过期检测只在用户访问 payments 或 home 页面时手动触发（`checkOverdue.mutate()`），没有定时任务
- **影响**：用户不会收到主动的截止日期提醒

### P2-2：通知没有铃铛入口
- **位置**：`app/(dashboard)/layout.tsx`
- **现状**：侧边栏有未读数 badge，但顶部导航栏没有通知铃铛图标，用户必须导航到专门的通知页面
- **影响**：通知的可达性差

### P2-3：没有 Deal 详情页
- **位置**：`app/(dashboard)/deals/`
- **现状**：deals 页面只有看板/列表/日历三种视图，点击 deal 只能编辑基本信息。没有详情页展示 deliverables、contracts、invoices 等关联数据
- **影响**：deal 的完整上下文无法在一个地方查看

### P2-4：登录后双重重定向
- **位置**：`app/(auth)/login/page.tsx` 行 39
- **现状**：登录成功后 `router.push("/")`，middleware 再重定向到 `/home`，造成不必要的闪烁
- **修复**：直接 `router.push("/home")`

### P2-5：仪表盘趋势值硬编码
- **位置**：`app/(dashboard)/home/page.tsx` 行 232
- **现状**：`trendValue: 24` 写死在"总 deal 数"卡片中，不随实际数据变化
- **影响**：显示虚假的增长趋势

### P2-6：`checkOverdue` 重复触发
- **位置**：`app/(dashboard)/home/page.tsx`、`app/(dashboard)/payments/page.tsx`
- **现状**：两个页面都在 `useEffect` 中调用 `checkOverdue.mutate()`，每次访问都会触发。可能在同一会话中重复执行
- **影响**：可能创建重复的逾期通知

### P2-7：`checkOverdue` 在 payments 页面无权限控制
- **位置**：`lib/trpc/routers/invoices.ts`
- **现状**：`checkOverdue` mutation 执行 `UPDATE invoices SET status = 'overdue' WHERE status IN ('sent', 'viewed') AND due_date < now()`，没有检查 `user_id`，会更新所有用户的发票状态
- **影响**：严重的安全漏洞——一个用户的操作会影响所有用户的数据

---

## 4. 低优先级问题（P3）

### P3-1：发票编号可能冲突
- **位置**：`lib/trpc/routers/invoices.ts` 行 51-58
- **现状**：编号通过 `COUNT(*) + 1` 生成，并发创建可能产生重复编号。虽然 DB 有 UNIQUE 约束会拒绝重复，但错误信息不友好

### P3-2：品牌 notes 字段在 UI 中不可用
- **位置**：`app/(dashboard)/brands/page.tsx`
- **现状**：品牌添加/编辑对话框中没有 notes 输入框，字段存在于 state 和 router schema 中但无法填写

### P3-3：Resend 客户端实例重复创建
- **位置**：`lib/resend/client.ts` 导出了 `resend` 实例，但 `app/api/send-email/route.ts` 行 5 自己 `new Resend()` 创建了新实例
- **影响**：`lib/resend/client.ts` 的导出从未被其他文件引用，是死代码

### P3-4：Invoice 类型与查询结果不匹配
- **位置**：`app/(dashboard)/invoices/page.tsx` 行 39-47
- **现状**：`Invoice` 类型有 `deal` 属性（单数），但 tRPC 查询返回的是 `deals`（复数，Supabase 嵌套关联的命名）。组件访问 `invoice.deal.title` 但类型定义是 `invoice.deals`，存在类型不一致

### P3-5：`cmdk` 和 `date-fns` 依赖未使用
- **位置**：`package.json`
- **现状**：
  - `cmdk`：只被 `components/ui/command.tsx` 使用，但 command.tsx 从未被任何页面导入
  - `date-fns`：安装了但代码中从未导入，`lib/utils.ts` 用的是原生 Date 方法

### P3-6：多个 UI 组件未使用
- **位置**：`components/ui/`
- **现状**：以下组件从未被任何应用代码导入：
  - `command.tsx`
  - `empty.tsx`
  - `switch.tsx`
  - `tabs.tsx`
  - `progress.tsx`

### P3-7：`profiles` 表缺少迁移列
- **位置**：`sql/schema.sql` vs `sql/migration-settings-payments.sql`
- **现状**：`profiles` 表的 `timezone`、`language`、`currency` 列只在 migration 文件中添加，基础 schema 没有。`profiles.ts` 路由尝试更新这些列，如果未运行 migration 会报错

---

## 5. 各模块详细问题

### 5.1 发票模块（Invoices）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| 无 PDF 生成 | P0 | 下载的是 .txt 文件 |
| 不发邮件 | P0 | Send 按钮只改状态 |
| 无 Stripe 集成 | P0 | stripe_invoice_id 永远为 NULL |
| 无"已查看"追踪 | P1 | viewed 状态存在但无检测机制 |
| 无部分付款 UI | P1 | 后端支持 amount_paid 但 UI 不显示 |
| 无付款记录展示 | P1 | payments 页面展示的是发票而非付款记录 |
| 并发编号冲突 | P3 | COUNT+1 生成方式不安全 |

### 5.2 合同模块（Contracts）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| 无文件上传 | P0 | 只有文件名输入框 |
| 无 AI 分析 | P0 | DB 字段已建但无调用代码 |
| 无合同模板生成 | P1 | — |
| 无电子签名 | P1 | — |
| 详情页是占位符 | P1 | 显示 "coming soon" |

### 5.3 利率基准模块（Rates）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| 数据自引用 | P1 | 市场中位数只来自用户自己 |
| 无外部数据源 | P1 | 没有 API 或爬虫 |
| engagement_rate 未使用 | P2 | 字段存在但不参与计算 |
| 无跨用户比较 | P1 | 无众包或匿名聚合数据 |

### 5.4 Deal 管理模块（Deals）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| 无 deal 详情页 | P2 | 无法查看关联的 deliverables/contracts/invoices |
| deliverables 表无 UI | P1 | 数据库已建但无法操作 |
| 阶段变更不发邮件 | P2 | 只有站内通知 |

### 5.5 付款模块（Payments）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| "跟进"是假的 | P1 | 只弹 toast，不发邮件 |
| 全部手动操作 | P1 | 无 Stripe 在线支付 |
| payments 表只在 migration 中 | P2 | 单独运行 schema.sql 会缺失该表 |
| 部分付款状态 CHECK 约束 | P2 | "partial" 不在 DB 的 CHECK 约束中 |

### 5.6 品牌管理模块（Brands）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| notes 字段无 UI | P3 | 数据库有但输入框缺失 |
| getById 从未被调用 | P3 | 死代码 |
| 无品牌 Logo 上传 | P3 | logo_url 字段永远为空 |

### 5.7 通知模块（Notifications）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| 无铃铛入口 | P2 | 顶部导航没有通知图标 |
| deadline 类型永远不创建 | P2 | 类型存在于 schema 但无代码创建 |
| 无自动定时通知 | P2 | 没有 cron 或 edge function |

### 5.8 认证模块（Auth）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| 无 OAuth 回调路由 | P1 | Google 登录可能失败 |
| 无密码重置页面 | P1 | 重置链接无法完成 |
| 登录双重重定向 | P2 | / → /home 闪烁 |
| 无密码强度检查 | P3 | 只有 HTML5 type="email" |
| AuthProvider 每次渲染重建 client | P3 | 未 useMemo/useRef |

### 5.9 仪表盘（Dashboard Home）

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| 趋势值硬编码 | P2 | trendValue: 24 写死 |
| "快速设置"是假的 | P2 | toast-only stub |
| checkOverdue 重复触发 | P2 | 两个页面都调用 |

---

## 6. 落地页虚假宣传

以下内容在 `app/page.tsx` 中展示但与实际不符：

| 宣传内容 | 位置 | 实际情况 |
|----------|------|----------|
| "Trusted by 2,000+ creators" | 行 211 | 编造的数字 |
| 虚假用户评价 | 行 120-138 | 名字、粉丝数、引用全部编造 |
| 虚假品牌 Logo（Nike、Apple、Samsung） | 行 164-166 | 纯文本字符串，无实际合作 |
| "Smart Invoicing" | 行 28 | 无 PDF 生成、无邮件发送 |
| "AI Contract Scanner" | 行 38 | 完全未实现 |
| "Rate Benchmarking" | 行 44 | 数据自引用，无市场数据 |
| "Deadline Alerts" | 行 49 | 无自动提醒，只在页面访问时触发 |
| 定价方案（Free/Pro/Team） | 行 71-118 | UI 存在但无计费系统 |
| "SOC 2 compliant" | FAQ 行 159-160 | 无任何证据 |
| "Email forwarding for automatic deal capture" | FAQ 行 141 | 未实现 |
| "Stripe integration" | FAQ 行 141-142 | 未实现 |

---

## 7. 设置页面桩功能

以下功能在设置页面有 UI 入口但点击后只弹 toast 提示"Coming soon"：

| 功能 | 说明 |
|------|------|
| 更改密码 | `toast.info("Coming soon")` |
| 启用 2FA | `toast.info("Coming soon")` |
| 头像上传 | 点击无实际上传逻辑 |
| 通知偏好保存 | `toast.info("Preferences saved")` 但不写入任何地方 |
| 定价页面"升级"按钮 | `toast.info("Redirecting to checkout...")` 但无 Stripe 集成 |

---

## 8. 数据库 Schema 与代码不一致

### 8.1 migration 文件必须执行
以下字段/表只在 `sql/migration-settings-payments.sql` 中，不在 `sql/schema.sql` 中：
- `payments` 表（整个表）
- `invoices.amount_paid` 列
- `invoices.paid_at` 列
- `invoices.payment_method` 列
- `profiles.timezone`、`profiles.language`、`profiles.currency` 列

**如果只运行 schema.sql，payments 模块和部分 invoices 功能会崩溃。**

### 8.2 "partial" 状态未加入 CHECK 约束
- `schema.sql` 行 89-91：invoices 的 CHECK 约束只允许 `draft`、`sent`、`viewed`、`paid`、`overdue`、`cancelled`
- `payments.ts` 行 60 和 `invoices.ts` 行 10：代码中使用了 `"partial"` 状态
- **DB 会拒绝 `"partial"` 状态的更新，产生数据库错误**

### 8.3 `checkOverdue` 无用户隔离
- `invoices.ts` 的 `checkOverdue`：`UPDATE invoices SET status = 'overdue' WHERE ...` 没有 `AND user_id = $1`
- **一个用户的操作会影响所有用户的发票状态**

---

## 9. 未使用代码和依赖

### 未使用的 npm 依赖
- `cmdk` — 安装了但 command.tsx 组件从未被导入
- `date-fns` — 安装了但代码中从未 import

### 未使用的 UI 组件
- `components/ui/command.tsx`
- `components/ui/empty.tsx`
- `components/ui/switch.tsx`
- `components/ui/tabs.tsx`
- `components/ui/progress.tsx`

### 未使用的环境变量
- `SUPABASE_SERVICE_ROLE_KEY` — 从未在代码中引用
- `NEXT_PUBLIC_APP_URL` — 从未在代码中引用
- `NEXT_PUBLIC_APP_NAME` — 从未在代码中引用
- `AI_API_KEY` — 从未在代码中引用
- `AI_BASE_URL` — 从未在代码中引用
- `STRIPE_SECRET_KEY` — 从未在代码中引用
- `STRIPE_PUBLISHABLE_KEY` — 从未在代码中引用
- `STRIPE_WEBHOOK_SECRET` — 从未在代码中引用

### 死代码
- `lib/resend/client.ts` — 导出的 `resend` 实例从未被其他文件导入
- `lib/trpc/routers/brands.ts` 的 `getById` — 从未被任何页面调用
- `app/(auth)/signup/page.tsx` 行 21 — `CardTitle` 和 `CardDescription` 导入但未使用

---

## 10. 安全与合规风险

| 风险 | 严重程度 | 说明 |
|------|----------|------|
| `checkOverdue` 无用户隔离 | **高** | 越权操作其他用户数据 |
| OAuth 无回调路由 | 高 | 可能导致认证绕过或 session 未建立 |
| API 路由跳过 middleware 认证 | 中 | `/api/*` 路由不经过 middleware，依赖各 route 自行验证 |
| 落地页虚假宣传 | 中 | "SOC 2 compliant"、虚假评价、虚假品牌合作 |
| 无 CSRF 保护 | 中 | tRPC 和 API 路由未显式配置 CSRF token |
| 无输入验证 | 低 | 部分表单只依赖 HTML5 原生验证 |

---

## 建议修复顺序（已完成）

1. ~~先跑一遍 migration~~ — 待手动执行（见下方待执行列表）
2. ~~修复 P0 问题~~ — PDF 生成、邮件发送、文件上传、OAuth 回调 ✅
3. ~~修复 `checkOverdue` 越权漏洞~~ — 加 `user_id` 条件 ✅
4. ~~修复 "partial" 状态 CHECK 约束~~ — ALTER TABLE 加入
5. ~~补齐 P1 问题~~ — 密码重置、deliverables 管理 ✅
6. 清理虚假宣传：落地页内容与实际功能对齐
7. 处理 P2/P3 剩余问题：代码清理、依赖清理
