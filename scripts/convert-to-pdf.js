const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertHTMLtoPDF() {
  console.log('Starting PDF conversion...\n');

  const files = [
    '1_simple_gst_invoice.html',
    '2_complex_multitax_invoice.html',
    '3_service_invoice_tds.html',
    '4_retail_discount_invoice.html',
    '5_legacy_terms_invoice.html'
  ];

  const browser = await puppeteer.launch({
    headless: 'new'
  });

  for (const file of files) {
    const htmlPath = path.join(__dirname, '..', 'test-pdfs', file);
    const pdfPath = path.join(__dirname, '..', 'test-pdfs', file.replace('.html', '.pdf'));

    console.log(`Converting ${file}...`);

    const page = await browser.newPage();
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    console.log(`✅ Created: ${file.replace('.html', '.pdf')}`);
    
    await page.close();
  }

  await browser.close();
  
  console.log('\n✅ All PDFs created successfully in test-pdfs folder!');
}

convertHTMLtoPDF().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

