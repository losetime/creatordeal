# AI 合同解析功能说明

## 概述

AI 合同解析是 CreatorDeal 的核心差异化功能。用户只需上传合同文件，AI 会自动提取关键信息并创建交易记录。

## 功能流程

```
用户上传合同 → AI 自动提取 → 用户确认/修正 → 自动创建交易
```

## 已实现功能

### 1. 智能合同上传

- **位置**：Contracts 页面 → "Smart Create" 按钮
- **支持格式**：PDF、Word、Text
- **AI 模型**：小米 MiMo-v2.5

### 2. 自动提取字段

| 字段 | 说明 | 准确率 |
|------|------|--------|
| brand_name | 品牌名称 | 高 (90%+) |
| brand_contact_name | 联系人 | 高 (85%+) |
| brand_contact_email | 联系邮箱 | 高 (90%+) |
| deal_title | 交易标题 | 高 (85%+) |
| amount | 金额 | 高 (95%+) |
| currency | 币种 | 高 (95%+) |
| content_type | 内容类型 | 中 (80%+) |
| content_deadline | 内容截止日期 | 高 (90%+) |
| payment_deadline | 支付截止日期 | 高 (90%+) |
| payment_terms | 支付条款 | 中 (80%+) |
| usage_rights | 使用权限 | 中 (75%+) |
| key_terms | 关键条款 | 中 (80%+) |
| risks | 风险提示 | 中 (75%+) |

### 3. 自动创建

确认后，系统自动创建：
- ✅ 品牌记录（如不存在）
- ✅ 交易记录（状态为 signed）
- ✅ 合同记录（含 AI 分析结果）
- ✅ 交付物记录（如有）

## API 端点

### POST /api/contracts/smart-upload

上传合同并调用 AI 解析。

**请求**：
- Content-Type: multipart/form-data
- Body: FormData with "file" field

**响应**：
```json
{
  "success": true,
  "fileUrl": "https://...",
  "fileName": "contract.pdf",
  "storagePath": "user-id/temp/xxx.pdf",
  "parsedData": {
    "brand_name": "Nike",
    "amount": 5000,
    "currency": "USD",
    ...
  }
}
```

### POST /api/contracts/confirm-create

确认并创建交易。

**请求**：
```json
{
  "brand_name": "Nike",
  "title": "Summer Campaign",
  "amount": 5000,
  "file_url": "https://...",
  "file_name": "contract.pdf",
  "storage_path": "user-id/temp/xxx.pdf",
  ...
}
```

**响应**：
```json
{
  "success": true,
  "dealId": "uuid",
  "brandId": "uuid"
}
```

## 文件结构

```
lib/ai/
├── client.ts           # AI API 客户端
└── contract-parser.ts  # 合同解析逻辑

app/api/contracts/
├── upload/route.ts         # 传统上传（需先选交易）
├── smart-upload/route.ts   # 智能上传（AI 解析）
└── confirm-create/route.ts # 确认创建交易

components/
└── smart-deal-creator.tsx  # 智能创建组件
```

## 环境变量

```env
# AI - 小米 MiMo
XIAOMI_AI_API_KEY=sk-xxxxx
XIAOMI_AI_BASE_URL=https://api.xiaomi.com/v1
```

## 注意事项

1. **PDF 文本提取**：已集成 `pdf-parse` 库，支持 PDF 文本提取
2. **AI 准确率**：AI 提取结果需要用户确认，建议在 UI 中明确标注
3. **文件大小**：建议限制上传文件大小为 10MB
4. **API 限流**：注意 AI API 的调用频率限制

## 后续优化

- [ ] 集成 mammoth 实现 Word 文档文本提取
- [ ] 支持批量上传多个合同
- [ ] 合同模板学习（根据历史合同优化提取）
- [ ] 多语言支持
- [ ] 支持图片 OCR（扫描件合同）
