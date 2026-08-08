import 'dotenv/config';
import * as cheerio from 'cheerio';

const API_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://ecdc.ksbtdanang.vn';
const EMAIL = process.env.ADMIN_EMAIL || '';
const PASSWORD = process.env.ADMIN_PASSWORD || '';

// Basic HTML to Lexical JSON converter
function parseNode($, el: any): any[] {
  if (el.type === 'text') {
    const text = el.data;
    if (!text.trim() && text !== ' ') return [];
    return [{ type: 'text', text: el.data, version: 1, format: 0, mode: 'normal', style: '' }];
  }
  
  if (el.type === 'tag') {
    const tagName = el.name.toLowerCase();
    
    if (tagName === 'br') return [{ type: 'linebreak', version: 1 }];
    
    if (tagName === 'b' || tagName === 'strong') {
      const children = parseChildren($, el);
      return children.map(c => { if (c.type === 'text') c.format = c.format | 1; return c; });
    }
    
    if (tagName === 'i' || tagName === 'em') {
      const children = parseChildren($, el);
      return children.map(c => { if (c.type === 'text') c.format = c.format | 2; return c; });
    }
    
    if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th'].includes(tagName)) {
      const children = parseChildren($, el);
      if (children.length === 0) return [];
      
      let type = 'paragraph';
      if (tagName.startsWith('h')) type = 'heading';
      
      const node: any = { type: type, version: 1, children: children };
      if (type === 'heading') node.tag = tagName;
      return [node];
    }
    
    if (['ul', 'ol'].includes(tagName)) {
      const children = parseChildren($, el);
      return [{
        type: 'list',
        listType: tagName === 'ul' ? 'bullet' : 'number',
        start: 1,
        version: 1,
        children: children.map(c => {
          if (c.type === 'paragraph' || c.type === 'heading') {
            return { type: 'listitem', value: 1, version: 1, children: [c] };
          }
          return { type: 'listitem', value: 1, version: 1, children: c.type === 'listitem' ? c.children : [c] };
        })
      }];
    }
    
    if (tagName === 'img') {
      const src = $(el).attr('src');
      if (src) {
        return [{ type: 'text', text: `\n[Hình ảnh: ${src}]\n`, version: 1, format: 2, mode: 'normal', style: '' }];
      }
    }

    return parseChildren($, el);
  }
  return [];
}

function parseChildren($, parent: any): any[] {
  let children: any[] = [];
  $(parent).contents().each((_: any, el: any) => {
    children = children.concat(parseNode($, el));
  });
  return children;
}

function htmlToLexical(html: string) {
  const $ = cheerio.load(html);
  let rootChildren = parseChildren($, $('body')[0]);
  
  const normalizedRoot = [];
  let currentParagraph = null;
  
  for (const child of rootChildren) {
    if (child.type === 'text' || child.type === 'linebreak') {
      if (!currentParagraph) {
        currentParagraph = { type: 'paragraph', version: 1, children: [] };
        normalizedRoot.push(currentParagraph);
      }
      currentParagraph.children.push(child);
    } else {
      currentParagraph = null;
      if (child.type === 'listitem') {
        normalizedRoot.push({ type: 'list', listType: 'bullet', start: 1, version: 1, children: [child] });
      } else {
        normalizedRoot.push(child);
      }
    }
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: normalizedRoot.length > 0 ? normalizedRoot : [{ type: 'paragraph', version: 1, children: [] }]
    }
  };
}


async function run() {
  if (!EMAIL || !PASSWORD) {
    console.error("❌ Vui lòng cung cấp ADMIN_EMAIL và ADMIN_PASSWORD trong file .env");
    process.exit(1);
  }

  console.log(`Đang đăng nhập vào ${API_URL}...`);
  const loginRes = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });

  if (!loginRes.ok) {
    console.error("❌ Đăng nhập thất bại. Kiểm tra lại thông tin ADMIN_EMAIL, ADMIN_PASSWORD.");
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log(`✅ Đăng nhập thành công!`);

  // Get category ID
  const catRes = await fetch(`${API_URL}/api/categories?where[slug][equals]=cam-nang-vac-xin`, {
    headers: { 'Authorization': `JWT ${token}` }
  });
  const catData = await catRes.json();
  const categoryId = catData.docs?.[0]?.id || 2; 

  console.log(`Bắt đầu lấy dữ liệu từ https://ksbtdanang.vn/cam-nang-vac-xin/ ...`);
  const indexRes = await fetch('https://ksbtdanang.vn/cam-nang-vac-xin/');
  const indexHtml = await indexRes.text();
  const $ = cheerio.load(indexHtml);

  // Extract article URLs
  const articleUrls = new Set<string>();
  $('.news_column .panel-body h3 a, .tms_list_tin ul li h4 a').each((i, el) => {
    let href = $(el).attr('href');
    if (href) {
      if (!href.startsWith('http')) href = 'https://ksbtdanang.vn' + href;
      articleUrls.add(href);
    }
  });

  console.log(`Tìm thấy ${articleUrls.size} bài viết.`);
  const urls = Array.from(articleUrls);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i+1}/${urls.length}] Đang xử lý: ${url}`);
    try {
      const artRes = await fetch(url);
      const artHtml = await artRes.text();
      const $art = cheerio.load(artHtml);

      const title = $art('.tms_tintuc_titlle h1').text().trim() || $art('h1').first().text().trim();
      const publishedTimeMeta = $art('meta[property="article:published_time"]').attr('content');
      let publishedAt = new Date().toISOString();
      if (publishedTimeMeta) {
        let cleanTime = publishedTimeMeta.replace(/EDT|EST|ICT|\+[0-9]{2}:[0-9]{2}/g, '');
        const parsedDate = new Date(cleanTime);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate.toISOString();
        }
      }

      // Check duplicate via REST API
      const existingRes = await fetch(`${API_URL}/api/articles?where[title][equals]=${encodeURIComponent(title)}&limit=1`, {
        headers: { 'Authorization': `JWT ${token}` }
      });
      const existing = await existingRes.json();

      if (existing.docs?.length > 0) {
        console.log(`=> Đã tồn tại bài viết: ${title}. Bỏ qua.`);
        continue;
      }

      const contentHtml = $art('#news-bodyhtml').html() || '';
      const lexicalContent = htmlToLexical(contentHtml);

      let description = $art('meta[name="description"]').attr('content') || '';
      if (description.length > 250) description = description.substring(0, 247) + '...';

      // Thumbnail
      let imageId = null;
      let imgUrl = $art('meta[property="og:image"]').attr('content');
      if (imgUrl) {
        if (!imgUrl.startsWith('http')) imgUrl = 'https://ksbtdanang.vn' + (imgUrl.startsWith('/') ? '' : '/') + imgUrl;
        
        console.log(`=> Tải ảnh: ${imgUrl}`);
        const imgRes = await fetch(imgUrl);
        if (imgRes.ok) {
          try {
            const arrayBuffer = await imgRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const urlObj = new URL(imgUrl);
            const filename = urlObj.pathname.split('/').pop() || 'image.jpg';
            const mimetype = imgRes.headers.get('content-type') || 'image/jpeg';
            
            const formData = new FormData();
            formData.append('file', new Blob([buffer], { type: mimetype }), filename);
            formData.append('alt', title);

            const uploadRes = await fetch(`${API_URL}/api/media`, {
              method: 'POST',
              headers: { 'Authorization': `JWT ${token}` },
              body: formData as any
            });

            if (uploadRes.ok) {
              const mediaDoc = await uploadRes.json();
              imageId = mediaDoc.doc.id;
            } else {
               const errText = await uploadRes.text();
               console.error(`=> Lỗi upload ảnh (${uploadRes.status}):`, errText);
            }
          } catch (uploadErr) {
             console.error(`=> Lỗi hệ thống khi upload ảnh:`, uploadErr);
          }
        }
      }

      // Create article
      const articleData: any = {
        title,
        description,
        category: categoryId,
        content: lexicalContent,
        publishedAt,
        _status: 'published',
        reviewStatus: 'approved',
        slug: url.split('/').pop()?.replace('.html', '') || 'bai-viet-' + Date.now(),
        author_name: 'Admin'
      };

      if (imageId) {
        articleData.image = imageId;
      }

      const createRes = await fetch(`${API_URL}/api/articles`, {
        method: 'POST',
        headers: { 
          'Authorization': `JWT ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(articleData)
      });

      if (createRes.ok) {
        console.log(`=> ✅ Tạo bài viết thành công: ${title}`);
      } else {
        const errText = await createRes.text();
        console.error(`=> ❌ API lỗi khi tạo bài viết:`, errText);
      }

    } catch (err) {
      console.error(`=> ❌ Lỗi xử lý bài viết ${url}:`, err);
    }
  }

  console.log('Hoàn thành seed dữ liệu lên Domain!');
  process.exit(0);
}

run().catch(console.error);
