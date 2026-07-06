# 发票模块问题记录与改进方案

> 最后更新：2026-07-03

---

## 一、当前发票是如何生成的

### 数据流程

1. **创建发票**（`lib/trpc/routers/invoices.ts` 行 40-82）：
   - 用户选择一个 deal，填写金额、截止日期、备注
   - 系统用 `COUNT(*) + 1` 生成编号 `INV-YYYY-NNNNN`（如 `INV-2026-00001`）
   - 插入 `invoices` 表，状态为 `draft`
   - 创建一条站内通知

2. **发票预览**（`app/(dashboard)/invoices/page.tsx` 行 74-139）：
   - 一个纯 React 组件 `InvoicePreview`，渲染在 Dialog 中
   - 展示：From（用户姓名+邮箱）、To（品牌名）、发票号、Deal 标题、截止日期、金额
   - 仅在浏览器中可见，不是独立文件

3. **"下载"**（`app/(dashboard)/invoices/page.tsx` 行 223-244）：
   - 把发票内容拼接成纯文本字符串
   - 创建 `Blob`，保存为 `.txt` 文件
   - **不是 PDF**

4. **"打印/保存 PDF"**（`app/(dashboard)/invoices/page.tsx` 行 246-248）：
   - 直接调 `window.print()`
   - 依赖浏览器打印对话框，用户需要手动选"保存为 PDF"
   - **不是服务端 PDF 生成**

5. **"发送"**（`app/(dashboard)/invoices/page.tsx` 行 219-221）：
   - 只执行 `updateInvoice.mutate({ id, status: "sent" })`
   - **不调用邮件 API**，品牌方收不到任何通知

### 发票包含的信息

| 字段 | 值 | 来源 |
|------|-----|------|
| 发票编号 | `INV-2026-00001` | 自动生成 |
| From 姓名 | `profile.full_name` | 用户资料 |
| From 邮箱 | `profile.email` | 用户资料 |
| To 名称 | `deal.brand.name` | 品牌表 |
| To 邮箱 | 硬编码 `contact@{brand}.com` | **猜的，不是真实邮箱** |
| Deal 标题 | `deal.title` | deal 表 |
| 金额 | `invoice.amount` | 用户输入 |
| 截止日期 | `invoice.due_date` | 用户输入 |
| 备注 | `invoice.notes` | 用户输入（可选） |

### 缺失的关键信息

以下字段在合法发票中通常需要，但当前完全缺失：

| 缺失字段 | 重要性 | 说明 |
|----------|--------|------|
| 发票 Issuer 地址 | 必须 | 法律要求的开票方地址 |
| 发票 Issuer 税号 | 必须（视地区） | 美国 SSN/EIN，中国纳税人识别号 |
| 收款方地址 | 品牌方地址 | 品牌表中没有 address 字段 |
| 收款方税号 | 视情况 | B2B 发票通常需要 |
| 税率/税额 | 必须（视地区） | 没有任何税务计算逻辑 |
| 付款方式/银行信息 | 建议 | 用户无法设置收款账户 |
| 行项目明细 | 建议 | 目前只有一行 Deal 标题 |
| 开票日期 | 必须 | 当前发票没有独立的开票日期字段 |
| 付款条款 | 建议 | Net 15/30/60 等 |

---

## 二、生成的发票能用吗？

### 结论：不能用。原因如下：

**1. 格式问题**
- 下载的是 `.txt` 纯文本文件，不是 PDF
- 品牌方的财务部门不会接受 `.txt` 文件作为正式发票
- 没有公司 Logo、没有专业排版、没有印章/签名区域

**2. 内容问题**
- 缺少开票方地址和税号（法律要求）
- 缺少税率/税额信息
- 收款方邮箱是硬编码猜测（`contact@{brand}.com`），不是真实邮箱
- 没有付款条款（Net 15/30 等）
- 没有行项目明细（只有一行 Deal 标题）

**3. 流程问题**
- "发送"按钮不发邮件，品牌方不知道发票存在
- 没有在线查看链接，品牌方无法在线确认
- 没有支付入口，品牌方只能线下转账
- 没有逾期自动提醒

**4. 法律效力问题**
- 没有数字签名或时间戳
- 没有不可篡改的记录（数据库可以被修改）
- 对于税务申报来说，这不构成有效的凭证

---

## 三、法规约束

### 美国（主要目标市场）

美国对发票的法规要求相对宽松，但有以下关键点：

**1. 无联邦统一发票格式**
- 美国没有像欧盟 VAT 发票那样的统一格式要求
- 但 IRS 要求保留完整的交易记录用于报税

**2. 自雇创作者（1099）相关**
- 品牌方支付给创作者 $600+ 时，需要向 IRS 提交 1099-NEC 表格
- 创作者需要向品牌方提供 W-9 表格（包含 SSN 或 EIN）
- 发票本身不是 IRS 的法定要求，但它是 **证明收入和支出的最常用工具**
- 发票必须包含：开票方名称/地址、收款方名称/地址、金额、日期、付款条款

**3. 独立承包商 vs 员工**
- 创作者通常是独立承包商（Independent Contractor）
- 独立承包商需要自己报税，发票是重要的收入凭证
- 没有有效发票，创作者在审计时可能无法证明收入

**4. 州级销售税**
- 部分州对数字服务征收销售税（如科罗拉多州、宾夕法尼亚州等）
- 如果创作者所在州有销售税，发票可能需要包含销售税信息
- 平台需要根据创作者和品牌方的位置决定是否适用销售税

### 欧盟（如果未来拓展）

**1. VAT 发票要求严格**
- 必须包含：双方 VAT 号、发票日期、付款条款、商品/服务描述、税率、税额
- 必须有唯一的发票编号（不能重复）
- 必须可追溯、不可篡改
- 电子发票需要符合 eInvoicing 标准（如 XRechnung、Factur-X）

**2. 反向征收机制（Reverse Charge）**
- 跨境 B2B 交易中，由买方（品牌方）负责缴纳 VAT
- 发票上需要注明 "Reverse Charge" 并包含双方 VAT 号

### 中国（如果面向中国创作者）

**1. 增值税普通发票/专用发票**
- 个人创作者通常只能开具增值税普通发票
- 需要通过税务局或授权平台开具
- 电子发票需要有税务 UKey 或通过第三方平台

**2. 平台代扣代缴**
- 如果平台作为中介，可能需要代扣代缴个人所得税
- 创作者收入超过一定额度需要自行申报

### 国际通用最佳实践

无论哪个国家，一份专业发票应包含：

1. **"Invoice" 字样**（明确这是发票而非报价或收据）
2. **唯一发票编号**
3. **开票日期**
4. **开票方信息**：名称、地址、联系方式、税号
5. **收款方信息**：名称、地址、联系方式
6. **行项目明细**：描述、数量、单价、小计
7. **小计、税额、总计**
8. **付款条款**：付款期限、付款方式
9. **币种**
10. **备注**

---

## 四、邮件发送流程设计

### 当前状态
- Resend API 端点已存在（`app/api/send-email/route.ts`），支持 invoice 和 reminder 两种邮件类型
- 发票 HTML 模板已有基本样式
- 但 invoices 页面从未调用此 API，"Send" 按钮只改数据库状态

### 改进方案

#### 1. 邮件触发链路

```
用户点击 Send Invoice
  ↓
验证品牌方邮箱存在（brand.contact_email）
  ↓
服务端生成 PDF（@react-pdf/renderer）
  ↓
上传 PDF 到 Supabase Storage，获取公开 URL
  ↓
生成在线查看 token（JWT 或一次性链接）
  ↓
调用 /api/send-email：
  - type: "invoice"
  - to: brand.contact_email
  - 附件: PDF 文件
  - HTML 中嵌入 "View Invoice" 按钮链接
  ↓
更新 invoice 状态 → sent
  ↓
创建站内通知
```

#### 2. 关键技术选型

**PDF 生成方案对比：**

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| `@react-pdf/renderer` | 用 React 组件写 PDF 模板，类型安全 | 包体积大（~2MB），学习曲线 | 首选 |
| `jspdf` + `jspdf-autotable` | 轻量（~300KB），API 简单 | 复杂布局困难，无 React 集成 | 备选 |
| Puppeteer 服务端渲染 | 精确还原 HTML 样式 | 需要 Headless Chrome，部署复杂 | 不推荐 |
| `react-pdf` (pdf-lib) | 底层控制强 | API 低级，开发慢 | 不推荐 |

**推荐：`@react-pdf/renderer`**
- 用 JSX 写 PDF 模板，和项目 React 技术栈一致
- 支持字体、表格、图片、条形码
- 服务端和客户端都能渲染

#### 3. 在线查看链接

品牌方无需登录即可查看发票：
- 创建 `/api/invoices/view/[token]` 端点
- Token 包含 invoice ID + 过期时间（7天）
- 返回只读 HTML 页面，展示发票内容
- 页面底部有 "Download PDF" 和 "Mark as Paid" 按钮

#### 4. 邮件模板升级

当前模板只有发票号、Deal、日期、金额。需要增加：

```html
<!-- 增强版邮件内容 -->
From: {创作者名称}
      {创作者地址}
      
To: {品牌名称}

Invoice #: INV-2026-00001
Date: July 3, 2026
Due Date: July 18, 2026 (Net 15)

Description                    Amount
─────────────────────────────────────
YouTube Sponsored Video         $5,000.00
─────────────────────────────────────
                              Total: $5,000.00

Payment Terms: Bank Transfer
Bank: [用户银行信息]

[View Invoice Online]  [Download PDF]
```

#### 5. 自动提醒机制

当前 `checkOverdue` 只在用户访问页面时触发。改进：
- 使用 Vercel Cron Jobs 或 Supabase Edge Functions
- 每天检查一次逾期发票
- 自动发送提醒邮件（调用 reminder 类型）
- 创建 deadline 类型的通知

---

## 五、法规合规方案

### 数据库字段补充

#### profiles 表新增字段
```sql
ALTER TABLE profiles ADD COLUMN address TEXT;
ALTER TABLE profiles ADD COLUMN city TEXT;
ALTER TABLE profiles ADD COLUMN state TEXT;
ALTER TABLE profiles ADD COLUMN country TEXT DEFAULT 'US';
ALTER TABLE profiles ADD COLUMN zip_code TEXT;
ALTER TABLE profiles ADD COLUMN tax_id TEXT;  -- SSN/EIN/VAT 号
ALTER TABLE profiles ADD COLUMN business_type TEXT;  -- individual/llc/corp
ALTER TABLE profiles ADD COLUMN bank_name TEXT;
ALTER TABLE profiles ADD COLUMN bank_account TEXT;
ALTER TABLE profiles ADD COLUMN bank_routing TEXT;
ALTER TABLE profiles ADD COLUMN paypal_email TEXT;
```

#### brands 表新增字段
```sql
ALTER TABLE brands ADD COLUMN address TEXT;
ALTER TABLE brands ADD COLUMN city TEXT;
ALTER TABLE brands ADD COLUMN country TEXT;
ALTER TABLE brands ADD COLUMN tax_id TEXT;  -- VAT 号（欧盟）
```

#### invoices 表新增字段
```sql
ALTER TABLE invoices ADD COLUMN invoice_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE invoices ADD COLUMN payment_terms TEXT DEFAULT 'Net 30';
ALTER TABLE invoices ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN subtotal DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN issuer_address TEXT;
ALTER TABLE invoices ADD COLUMN recipient_address TEXT;
ALTER TABLE invoices ADD COLUMN view_token TEXT;  -- 在线查看 token
ALTER TABLE invoices ADD COLUMN pdf_url TEXT;  -- PDF 文件 URL
ALTER TABLE invoices ADD COLUMN sent_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN viewed_at TIMESTAMPTZ;
```

### 各地区合规策略

#### 美国（默认）
- 发票需包含：双方名称/地址、发票号、日期、金额、付款条款
- 建议显示 EIN（如用户填写）
- 州销售税：根据 `profiles.state` 判断，科罗拉多等州自动加税
- 1099 提醒：年收入 $600+ 的品牌方，提示创作者收集 W-9

#### 欧盟（可选模板）
- 强制字段：双方 VAT 号、税率分列、Reverse Charge 标注
- 模板切换：用户在设置中选择 "EU VAT Invoice" 模板
- 发票编号不可重复（当前已保证 UNIQUE 约束）

#### 中国（可选模板）
- 提示用户通过税务局开具正式发票
- 平台发票仅作为收据/对账单
- 如涉及代扣代缴，显示税率和扣缴说明

### 审计日志

发票状态变更需记录完整审计轨迹：
```sql
CREATE TABLE invoice_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  action TEXT NOT NULL,  -- created/sent/viewed/paid/overdue
  actor_id UUID REFERENCES profiles(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- 发票一旦 sent，不可回退到 draft
- 每次状态变更自动插入审计记录
- PDF 生成后上传到 Storage，不可删除

---

## 六、实施优先级

### Phase 1：让发票能用（2-3天）
1. 安装 `@react-pdf/renderer`
2. 创建 PDF 模板组件
3. profiles 表补充地址字段（设置页增加输入）
4. brands 表补充邮箱和地址字段
5. "Send" 按钮接通邮件 API + PDF 附件

### Phase 2：在线体验（1-2天）
1. 创建在线查看页面 `/invoices/view/[token]`
2. 生成 view_token 并存入数据库
3. 邮件中嵌入在线查看链接

### Phase 3：合规化（2-3天）
1. invoices 表补充税务相关字段
2. 根据用户地区自动计算税率
3. 创建审计日志表
4. 欧盟 VAT 模板（可选）

### Phase 4：自动化（1-2天）
1. 配置 Vercel Cron 每日检查逾期
2. 自动发送逾期提醒邮件
3. Deal 完成后自动提示创建发票

---

## 七、验证方案

1. **PDF 生成测试**：创建发票 → 下载 PDF → 检查格式和内容
2. **邮件发送测试**：发送发票 → 检查收件箱 → 点击在线链接 → 下载附件
3. **合规测试**：填写完整地址/税号 → 生成 PDF → 检查必填字段
4. **流程测试**：创建 → 发送 → 查看 → 标记已付 → 检查审计日志
5. **构建验证**：`npx tsc --noEmit` + `npx next build` 通过
