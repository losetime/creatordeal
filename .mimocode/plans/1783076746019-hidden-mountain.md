# 计划：支付审核流程 + 订阅管理

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
