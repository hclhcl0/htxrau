const cheerio = require('cheerio');
fetch('https://ksbtdanang.vn/news/binh-dan-hoc-vu-so/binh-dan-hoc-vu-so-bai-5-hoc-ai-theo-cach-ai-cung-hieu-tu-xa-la-den-tro-ly-dac-luc-moi-ngay-2228.html')
  .then(r => r.text())
  .then(t => {
    const $ = cheerio.load(t);
    // Find elements containing 'BBT'
    $('*').each((i, el) => {
       if ($(el).text().includes('BBT:')) {
           // Output the first block that looks like the excerpt
           const html = $(el).html();
           if (html && html.includes('BBT:') && html.length < 500) {
               console.log('Found in tag:', el.tagName);
               console.log('HTML:', html);
           }
       }
    });
  });
