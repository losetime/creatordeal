# 修复：菜单整理 + 订阅历史表 + Subscription 列表样式

## 用户要求

1. Billing 菜单只放品牌发票（删掉订阅状态卡片）
2. Subscription 菜单用列表样式（和 Billing History 一样的排版）显示订阅历史
3. 每条订阅记录显示：状态、金额、日期、收据下载按钮
4. 新建 subscriptions 表存储订阅历史

## 方案

### 1. 新建 subscriptions 表

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',  -- active/cancelled/expired
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  order_id TEXT,        -- Ko-fi 订单号
  provider TEXT DEFAULT 'kofi',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. 修改 settings 页面

- **Billing 菜单**：只保留品牌发票列表（删掉订阅状态卡片）
- **Subscription 菜单**：显示当前订阅状态 + 订阅历史列表 + 收据下载

### 3. 修改 admin 流程

- 确认付款时：写入 subscriptions 表 + 更新 profiles.plan
- 驳回付款时：删除/更新 subscriptions 记录 + 重置 profiles.plan

### 4. Migration

profiles 表的 subscription 相关字段保留（用于快速查询当前状态），但主要数据源改为 subscriptions 表。

## 待实现

1. 用户端 Billing 拆分：Billing（品牌发票）+ Subscription（订阅管理）
2. Subscription 页面：订阅状态 + 订阅历史 + 收据 PDF 下载
3. 确认弹窗时机：点击 "I've Paid" 时弹出，不是点击 "Subscribe" 时
4. Admin 页面：Pending Tab + All Members Tab
5. 收据 PDF 生成（用 @react-pdf/renderer）

## Sandbox 密钥

| 信息 | 值 |
|------|-----|
| API Key | `pdl_sdbx_apikey_xxxxx` |
| Client Token | `test_565c73175961e49f643932dbf5a` |
| Pro Price ID | `pri_01kwr5garymka97rqq9f7c5608` ($19/月) |
| Team Price ID | `pri_01kwr5k21vncrb7dp8gnahpzaj` ($49/月) |
