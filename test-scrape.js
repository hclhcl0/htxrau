const cheerio = require('cheerio');
fetch('https://ksbtdanang.vn/news/binh-dan-hoc-vu-so/binh-dan-hoc-vu-so-chatgpt-tro-ly-tri-tue-nhan-tao-ho-tro-hoc-tap-cong-viec-va-truyen-thong-y-te-2227.html')
  .then(r => r.text())
  .then(t => {
    const $ = cheerio.load(t);
    console.log('=== hometext.m-bottom ===');
    console.log($('.hometext.m-bottom').text().trim() || 'EMPTY');
    console.log('=== hometext (bất kỳ) ===');
    $('.hometext').each((i, el) => {
      console.log(`[${i}] class="${$(el).attr('class')}" => "${$(el).text().trim().substring(0, 200)}"`);
    });
    console.log('=== meta description ===');
    console.log($('meta[name="description"]').attr('content') || 'none');
    console.log('=== og:description ===');
    console.log($('meta[property="og:description"]').attr('content') || 'none');
    // Tìm thêm các đoạn chứa "BBT"
    $('p, div, span').each((i, el) => {
      const text = $(el).children().length === 0 ? $(el).text().trim() : '';
      if (text.includes('BBT:') && text.length < 600) {
        console.log(`\n=== BBT found in <${el.tagName}> class="${$(el).attr('class')}" ===`);
        console.log(text);
      }
    });
  });
