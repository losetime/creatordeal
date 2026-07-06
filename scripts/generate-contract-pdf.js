const fs = require('fs')
const path = require('path')

// 简单的 PDF 生成器（使用基础 PDF 格式）
function generateContractPDF() {
  const contractContent = `BRAND PARTNERSHIP AGREEMENT

This Brand Partnership Agreement ("Agreement") is entered into as of January 15, 2026, by and between:

Brand (Sponsor):
- Company Name: Nike, Inc.
- Contact: Sarah Johnson, Marketing Manager
- Email: sarah.johnson@nike.com
- Website: https://www.nike.com

Creator (Influencer):
- Name: Alex Chen
- Platform: Instagram (@alexchen, 850K followers)
- Email: alex@creatordeal.com

1. CAMPAIGN OVERVIEW

Campaign Name: Nike Spring Collection 2026

Content Type: Instagram Reel + Instagram Story

Campaign Objective: Promote Nike's new Spring 2026 athleisure collection targeting millennials and Gen Z consumers.

2. DELIVERABLES

The Creator agrees to produce and publish the following content:

1. 60-second Reel - Instagram - Quantity: 1 - Due Date: February 15, 2026
2. Instagram Story (3 frames) - Instagram - Quantity: 1 set - Due Date: February 15, 2026
3. Static Post - Instagram - Quantity: 1 - Due Date: February 20, 2026

Content Requirements:
- Must feature Nike Spring Collection products provided by Brand
- Creator must tag @nike and use hashtag #NikeSpring2026
- Content must be original and not previously published
- Brand approval required before posting (5-business-day review period)

3. COMPENSATION

Total Compensation: $8,500.00 USD

Payment Schedule:
- 50% ($4,250.00) upon signing this Agreement
- 50% ($4,250.00) upon completion of all deliverables

Payment Method: Bank Transfer (ACH) or PayPal

Payment Terms: Net 30 days from invoice date

Late Payment: 1.5% monthly interest on overdue amounts

4. USAGE RIGHTS

Platform Usage:
- Brand may repost Creator's content on Nike's official Instagram account
- Creator retains ownership of original content

Duration:
- Brand may use content for 12 months from initial publication date
- After 12 months, Brand must request renewal or cease use

Paid Advertising:
- Brand may use content in paid social media advertisements
- Additional fee of $2,500 required for paid advertising usage beyond 6 months

Territory: Worldwide

5. CONTENT GUIDELINES

Do's:
- Showcase products in authentic, lifestyle settings
- Include clear product visibility
- Maintain Creator's authentic voice and style

Don'ts:
- Do not make false or misleading claims about products
- Do not feature competitor products in content
- Do not use content inappropriately or off-brand
- No explicit, violent, or controversial content

6. EXCLUSIVITY

Category Exclusivity: Creator agrees not to create sponsored content for the following competitors during the campaign period and for 30 days after:

- Adidas
- Puma
- Under Armour
- Reebok

Campaign Period: February 1, 2026 - March 31, 2026 (2 months)

7. INTELLECTUAL PROPERTY

- Creator retains copyright to all original content
- Brand receives license to use content as specified in Section 4
- Creator may use content in portfolio and self-promotion
- Brand's trademarks and logos may not be used without written permission

8. CONFIDENTIALITY

Both parties agree to keep confidential:
- Campaign strategy and product launch details
- Compensation terms
- Any proprietary information shared during the partnership

9. TERMINATION

By Brand:
- Brand may terminate with 14 days written notice
- Brand must pay for completed deliverables

By Creator:
- Creator may terminate with 14 days written notice
- Creator must return any provided products

For Cause:
- Either party may terminate immediately for material breach
- Breach includes: missed deadlines, inappropriate content, violation of exclusivity

10. REPORTING

Creator agrees to provide the following reports within 7 days of content publication:

- Screenshot of published content
- Engagement metrics (likes, comments, shares, saves)
- Story views and completion rate
- Any brand mentions or tags received

11. INDEMNIFICATION

Creator agrees to indemnify Brand against any claims arising from:
- Creator's breach of this Agreement
- Inappropriate or unlawful content
- Infringement of third-party rights

12. GOVERNING LAW

This Agreement shall be governed by the laws of the State of California, United States.

13. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations and agreements.

SIGNATURES

For Brand (Nike, Inc.):

Name: Sarah Johnson
Title: Marketing Manager
Date: January 15, 2026

For Creator:

Name: Alex Chen
Date: January 15, 2026

EXHIBIT A: PRODUCT LIST

The following products will be provided to Creator for content creation:

1. Nike Air Max Dn - Size 10 - Color: Black/White
2. Nike Sportswear Club Fleece Hoodie - Size L - Color: Grey
3. Nike Dri-FIT UV Miler Short - Size L - Color: Navy

This Agreement is executed in duplicate, one copy for each party.`

  // 创建简单的 PDF 内容（使用 pdfmake 或其他库会更好，但这里用简单方式）
  // 实际上，我们需要用 pdf 库来生成 PDF
  // 这里先创建一个 txt 文件，然后用在线工具转换

  const outputPath = path.join(__dirname, '..', '产品文档', '示例合同-品牌合作.pdf')

  // 使用 PDFKit 或其他库生成 PDF
  // 由于需要额外依赖，我们先创建一个说明文件
  const instructions = `# 如何生成 PDF 合同

## 方法 1：使用在线工具
1. 复制 "示例合同-品牌合作.txt" 的内容
2. 访问 https://www.sejda.com/html-to-pdf 或类似工具
3. 粘贴内容并下载 PDF

## 方法 2：使用 Node.js 脚本（推荐）
1. 安装依赖：pnpm add pdfkit
2. 运行脚本：node scripts/create-pdf-contract.js

## 方法 3：手动创建
1. 打开 Word 或 Google Docs
2. 粘贴合同内容
3. 导出为 PDF

生成的 PDF 文件应保存到：产品文档/示例合同-品牌合作.pdf`

  fs.writeFileSync(path.join(__dirname, '..', '产品文档', '生成PDF说明.md'), instructions)

  console.log('生成 PDF 说明文件：产品文档/生成PDF说明.md')
  console.log('')
  console.log('请使用以下方式之一生成 PDF：')
  console.log('1. 在线工具：https://www.sejda.com/html-to-pdf')
  console.log('2. 手动创建：用 Word 粘贴内容后导出 PDF')
}

generateContractPDF()
