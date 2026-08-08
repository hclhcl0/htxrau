import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// Helper function to download an image and return its buffer & metadata
async function downloadImage(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const urlObj = new URL(url);
    const filename = path.basename(urlObj.pathname);
    const mimetype = res.headers.get('content-type') || 'image/jpeg';
    
    return { buffer, filename, mimetype, size: buffer.length };
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return null;
  }
}

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
  const payload = await getPayload({ config: configPromise });
  const categoryId = 2; // Hardcoded ID for 'cam-nang-vac-xin'
  const targetCategorySlug = 'cam-nang-vac-xin';

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
        // Handle timezone EDT or similar if present (replace with Z)
        let cleanTime = publishedTimeMeta.replace(/EDT|EST|ICT|\+[0-9]{2}:[0-9]{2}/g, '');
        const parsedDate = new Date(cleanTime);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate.toISOString();
        }
      }

      // Check if article with this title already exists to avoid duplicates
      const existing = await payload.find({
        collection: 'articles',
        where: { title: { equals: title } },
        limit: 1
      });

      if (existing.docs.length > 0) {
        console.log(`=> Đã tồn tại bài viết: ${title}. Bỏ qua.`);
        continue;
      }

      const contentHtml = $art('#news-bodyhtml').html() || '';
      const lexicalContent = htmlToLexical(contentHtml);

      // Extract description
      let description = $art('meta[name="description"]').attr('content') || '';
      if (description.length > 250) description = description.substring(0, 247) + '...';

      // Thumbnail
      let imageId = null;
      let imgUrl = $art('meta[property="og:image"]').attr('content');
      if (imgUrl) {
        if (!imgUrl.startsWith('http')) imgUrl = 'https://ksbtdanang.vn' + (imgUrl.startsWith('/') ? '' : '/') + imgUrl;
        
        console.log(`=> Tải ảnh: ${imgUrl}`);
        const imgData = await downloadImage(imgUrl);
        if (imgData) {
          try {
            const mediaDoc = await payload.create({
              collection: 'media',
              data: {
                alt: title,
              },
              file: {
                data: imgData.buffer,
                mimetype: imgData.mimetype,
                name: imgData.filename,
                size: imgData.size
              }
            });
            imageId = mediaDoc.id;
          } catch (uploadErr) {
             console.error(`=> Lỗi upload ảnh:`, uploadErr);
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
        reviewStatus: 'approved', // So it shows on frontend
        slug: url.split('/').pop()?.replace('.html', '') || 'bai-viet-' + Date.now(),
        author_name: 'Admin'
      };

      if (imageId) {
        articleData.image = imageId;
      }

      await payload.create({
        collection: 'articles',
        data: articleData
      });

      console.log(`=> ✅ Tạo bài viết thành công: ${title}`);

    } catch (err) {
      console.error(`=> ❌ Lỗi xử lý bài viết ${url}:`, err);
    }
  }

  console.log('Hoàn thành seed dữ liệu!');
  process.exit(0);
}

run().catch(console.error);
