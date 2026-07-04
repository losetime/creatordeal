# LemonSqueezy 支付集成计划

## 概述

为 CreatorDeal 接入 LemonSqueezy 订阅支付，实现 Free/Pro/Team 三个定价方案。

## 为什么选 LemonSqueezy

- 个人可注册，不需要企业证件
- 自动处理全球税务（VAT/GST）作为 Merchant of Record
- 内置订阅管理、Customer Portal
- 费率：5% + 50¢ / 笔交易，无月费

## 需要的变更

### 1. 安装依赖
```bash
pnpm add lemonsqueezy
```

### 2. 环境变量
在 `.env.local` 中添加：
```
LEMONSQUEEZY_API_KEY=xxxxx（从 LemonSqueezy Dashboard 获取）
LEMONSQUEEZY_STORE_ID=xxxxx
LEMONSQUEEZY_WEBHOOK_SECRET=xxxxx（配置 webhook 后获取）
NEXT_PUBLIC_LEMONSQUEZY_CHECKOUT_URL=xxxxx（Checkout Link URL）
```

### 3. 实现方式
LemonSqueezy 的 SaaS 集成有两种方式：

**方式 A：Checkout Link（推荐，最简单）**
- 在 LemonSqueezy Dashboard 创建产品和价格
- 生成 Checkout Link URL
- 前端直接跳转到 LemonSqueezy 托管的结账页面
- 通过 Webhook 同步订阅状态到 profiles 表

**方式 B：API 集成（更复杂）**
- 通过 LemonSqueezy API 创建 Checkout Session
- 需要更多后端代码

**推荐方式 A**：最简单，不需要前端 SDK，LemonSqueezy 处理所有支付UI。

### 4. Webhook 处理
- `app/api/webhooks/lemonsqueezy/route.ts` — 接收 LemonSqueezy webhook
- 验证签名
- 处理事件：
  - `subscription_created` → 更新 profile: plan=pro, subscription_status=active
  - `subscription_updated` → 更新 subscription_status
  - `subscription_cancelled` → 重置 plan=free
  - `subscription_expired` → 重置 plan=free

### 5. 设置页面修复
- `app/(dashboard)/settings/page.tsx`：
  - "Upgrade to Pro" → 跳转 LemonSqueezy Checkout Link
  - "Manage Subscription" → 跳转 LemonSqueezy Customer Portal
  - 显示当前订阅状态

### 6. 落地页定价按钮
- `app/page.tsx`：Free/Pro/Team 的 CTA 按钮链接到 signup 或 checkout

### 7. 注册流程
- 新用户默认 plan=free
- 不需要在注册时创建 Stripe Customer

## 文件清单

| 文件 | 操作 |
|------|------|
| `package.json` | 添加 lemonsqueezy 依赖 |
| `.env.local` | 添加 LemonSqueezy 密钥 |
| `lib/lemonsqueezy.ts` | 新建 — LemonSqueezy 客户端 |
| `app/api/webhooks/lemonsqueezy/route.ts` | 新建 — Webhook 处理 |
| `app/(dashboard)/settings/page.tsx` | 修改 billing 部分 |
| `app/page.tsx` | 修改定价按钮 |

## 验证方案

1. 在 LemonSqueezy Dashboard 创建 Pro ($19/月) 和 Team ($49/月) 产品
2. 生成 Checkout Link
3. 点击 "Upgrade to Pro" → 跳转 LemonSqueezy Checkout → 完成支付
4. Webhook 触发 → profile.plan 更新为 "pro"
5. 点击 "Manage Subscription" → 跳转 Customer Portal
6. `npx tsc --noEmit` + `npx next build` 通过

## 注意事项

- LemonSqueezy Dashboard: https://app.lemonsqueezy.com
- 需要先创建 Store → Products → Prices → Checkout Links
- Webhook URL 格式: https://yourapp.com/api/webhooks/lemonsqueezy
- 测试时可以用 LemonSqueezy 的测试模式
