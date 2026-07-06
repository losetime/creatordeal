const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

function createContractPDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  })

  const outputPath = path.join(__dirname, '..', '产品文档', '示例合同-品牌合作.pdf')
  const stream = fs.createWriteStream(outputPath)
  doc.pipe(stream)

  // 标题
  doc.fontSize(18).font('Helvetica-Bold').text('BRAND PARTNERSHIP AGREEMENT', { align: 'center' })
  doc.moveDown(2)

  // 协议日期
  doc.fontSize(11).font('Helvetica').text('This Brand Partnership Agreement ("Agreement") is entered into as of January 15, 2026, by and between:')
  doc.moveDown()

  // 品牌方信息
  doc.font('Helvetica-Bold').text('Brand (Sponsor):')
  doc.font('Helvetica')
  doc.text('- Company Name: Nike, Inc.')
  doc.text('- Contact: Sarah Johnson, Marketing Manager')
  doc.text('- Email: sarah.johnson@nike.com')
  doc.text('- Website: https://www.nike.com')
  doc.moveDown()

  // 创作者信息
  doc.font('Helvetica-Bold').text('Creator (Influencer):')
  doc.font('Helvetica')
  doc.text('- Name: Alex Chen')
  doc.text('- Platform: Instagram (@alexchen, 850K followers)')
  doc.text('- Email: alex@creatordeal.com')
  doc.moveDown(2)

  // 1. CAMPAIGN OVERVIEW
  doc.font('Helvetica-Bold').text('1. CAMPAIGN OVERVIEW')
  doc.font('Helvetica')
  doc.text('Campaign Name: Nike Spring Collection 2026')
  doc.text('Content Type: Instagram Reel + Instagram Story')
  doc.text('Campaign Objective: Promote Nike\'s new Spring 2026 athleisure collection targeting millennials and Gen Z consumers.')
  doc.moveDown()

  // 2. DELIVERABLES
  doc.font('Helvetica-Bold').text('2. DELIVERABLES')
  doc.font('Helvetica')
  doc.text('The Creator agrees to produce and publish the following content:')
  doc.moveDown()
  doc.text('1. 60-second Reel - Instagram - Quantity: 1 - Due Date: February 15, 2026')
  doc.text('2. Instagram Story (3 frames) - Instagram - Quantity: 1 set - Due Date: February 15, 2026')
  doc.text('3. Static Post - Instagram - Quantity: 1 - Due Date: February 20, 2026')
  doc.moveDown()
  doc.text('Content Requirements:')
  doc.text('- Must feature Nike Spring Collection products provided by Brand')
  doc.text('- Creator must tag @nike and use hashtag #NikeSpring2026')
  doc.text('- Content must be original and not previously published')
  doc.text('- Brand approval required before posting (5-business-day review period)')
  doc.moveDown()

  // 3. COMPENSATION
  doc.font('Helvetica-Bold').text('3. COMPENSATION')
  doc.font('Helvetica')
  doc.text('Total Compensation: $8,500.00 USD')
  doc.moveDown()
  doc.text('Payment Schedule:')
  doc.text('- 50% ($4,250.00) upon signing this Agreement')
  doc.text('- 50% ($4,250.00) upon completion of all deliverables')
  doc.moveDown()
  doc.text('Payment Method: Bank Transfer (ACH) or PayPal')
  doc.text('Payment Terms: Net 30 days from invoice date')
  doc.text('Late Payment: 1.5% monthly interest on overdue amounts')
  doc.moveDown()

  // 4. USAGE RIGHTS
  doc.font('Helvetica-Bold').text('4. USAGE RIGHTS')
  doc.font('Helvetica')
  doc.text('Platform Usage:')
  doc.text('- Brand may repost Creator\'s content on Nike\'s official Instagram account')
  doc.text('- Creator retains ownership of original content')
  doc.moveDown()
  doc.text('Duration:')
  doc.text('- Brand may use content for 12 months from initial publication date')
  doc.text('- After 12 months, Brand must request renewal or cease use')
  doc.moveDown()
  doc.text('Paid Advertising:')
  doc.text('- Brand may use content in paid social media advertisements')
  doc.text('- Additional fee of $2,500 required for paid advertising usage beyond 6 months')
  doc.moveDown()
  doc.text('Territory: Worldwide')
  doc.moveDown()

  // 5. CONTENT GUIDELINES
  doc.font('Helvetica-Bold').text('5. CONTENT GUIDELINES')
  doc.font('Helvetica')
  doc.text('Do\'s:')
  doc.text('- Showcase products in authentic, lifestyle settings')
  doc.text('- Include clear product visibility')
  doc.text('- Maintain Creator\'s authentic voice and style')
  doc.moveDown()
  doc.text('Don\'ts:')
  doc.text('- Do not make false or misleading claims about products')
  doc.text('- Do not feature competitor products in content')
  doc.text('- Do not use content inappropriately or off-brand')
  doc.text('- No explicit, violent, or controversial content')
  doc.moveDown()

  // 6. EXCLUSIVITY
  doc.font('Helvetica-Bold').text('6. EXCLUSIVITY')
  doc.font('Helvetica')
  doc.text('Category Exclusivity: Creator agrees not to create sponsored content for the following competitors during the campaign period and for 30 days after:')
  doc.moveDown()
  doc.text('- Adidas')
  doc.text('- Puma')
  doc.text('- Under Armour')
  doc.text('- Reebok')
  doc.moveDown()
  doc.text('Campaign Period: February 1, 2026 - March 31, 2026 (2 months)')
  doc.moveDown()

  // 7. INTELLECTUAL PROPERTY
  doc.font('Helvetica-Bold').text('7. INTELLECTUAL PROPERTY')
  doc.font('Helvetica')
  doc.text('- Creator retains copyright to all original content')
  doc.text('- Brand receives license to use content as specified in Section 4')
  doc.text('- Creator may use content in portfolio and self-promotion')
  doc.text('- Brand\'s trademarks and logos may not be used without written permission')
  doc.moveDown()

  // 8. CONFIDENTIALITY
  doc.font('Helvetica-Bold').text('8. CONFIDENTIALITY')
  doc.font('Helvetica')
  doc.text('Both parties agree to keep confidential:')
  doc.text('- Campaign strategy and product launch details')
  doc.text('- Compensation terms')
  doc.text('- Any proprietary information shared during the partnership')
  doc.moveDown()

  // 9. TERMINATION
  doc.font('Helvetica-Bold').text('9. TERMINATION')
  doc.font('Helvetica')
  doc.text('By Brand:')
  doc.text('- Brand may terminate with 14 days written notice')
  doc.text('- Brand must pay for completed deliverables')
  doc.moveDown()
  doc.text('By Creator:')
  doc.text('- Creator may terminate with 14 days written notice')
  doc.text('- Creator must return any provided products')
  doc.moveDown()
  doc.text('For Cause:')
  doc.text('- Either party may terminate immediately for material breach')
  doc.text('- Breach includes: missed deadlines, inappropriate content, violation of exclusivity')
  doc.moveDown()

  // 10. REPORTING
  doc.font('Helvetica-Bold').text('10. REPORTING')
  doc.font('Helvetica')
  doc.text('Creator agrees to provide the following reports within 7 days of content publication:')
  doc.moveDown()
  doc.text('- Screenshot of published content')
  doc.text('- Engagement metrics (likes, comments, shares, saves)')
  doc.text('- Story views and completion rate')
  doc.text('- Any brand mentions or tags received')
  doc.moveDown()

  // 11. INDEMNIFICATION
  doc.font('Helvetica-Bold').text('11. INDEMNIFICATION')
  doc.font('Helvetica')
  doc.text('Creator agrees to indemnify Brand against any claims arising from:')
  doc.text('- Creator\'s breach of this Agreement')
  doc.text('- Inappropriate or unlawful content')
  doc.text('- Infringement of third-party rights')
  doc.moveDown()

  // 12. GOVERNING LAW
  doc.font('Helvetica-Bold').text('12. GOVERNING LAW')
  doc.font('Helvetica')
  doc.text('This Agreement shall be governed by the laws of the State of California, United States.')
  doc.moveDown()

  // 13. ENTIRE AGREEMENT
  doc.font('Helvetica-Bold').text('13. ENTIRE AGREEMENT')
  doc.font('Helvetica')
  doc.text('This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations and agreements.')
  doc.moveDown(2)

  // SIGNATURES
  doc.font('Helvetica-Bold').text('SIGNATURES')
  doc.moveDown()
  doc.font('Helvetica').text('For Brand (Nike, Inc.):')
  doc.moveDown()
  doc.text('Name: Sarah Johnson')
  doc.text('Title: Marketing Manager')
  doc.text('Date: January 15, 2026')
  doc.moveDown(2)
  doc.text('For Creator:')
  doc.moveDown()
  doc.text('Name: Alex Chen')
  doc.text('Date: January 15, 2026')
  doc.moveDown(2)

  // EXHIBIT A
  doc.font('Helvetica-Bold').text('EXHIBIT A: PRODUCT LIST')
  doc.font('Helvetica')
  doc.text('The following products will be provided to Creator for content creation:')
  doc.moveDown()
  doc.text('1. Nike Air Max Dn - Size 10 - Color: Black/White')
  doc.text('2. Nike Sportswear Club Fleece Hoodie - Size L - Color: Grey')
  doc.text('3. Nike Dri-FIT UV Miler Short - Size L - Color: Navy')
  doc.moveDown(2)
  doc.text('This Agreement is executed in duplicate, one copy for each party.')

  doc.end()

  stream.on('finish', () => {
    console.log('PDF 合同已生成：' + outputPath)
  })

  stream.on('error', (err) => {
    console.error('生成 PDF 失败：', err)
  })
}

createContractPDF()
