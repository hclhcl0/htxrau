import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import * as cheerio from 'cheerio';

function toSlug(str: string) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');
  str = str.replace(/([^0-9a-z-\s])/g, '');
  str = str.replace(/(\s+)/g, '-');
  return str.replace(/^-+/g, '').replace(/-+$/g, '');
}

function stripHtml(html: string) {
  // 1. Xóa các \r và \n thật trong source HTML để tránh ngắt câu ngẫu nhiên
  let text = (html || '').replace(/[\r\n]+/g, ' ');
  // 2. Chuyển các thẻ block và <br> thành \n
  text = text.replace(/<\/?(?:div|p|h[1-6]|ul|ol|li|table|tr|td|th|tbody|thead|tfoot|blockquote|article|section)[^>]*>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  // 3. Xóa tất cả các thẻ còn lại (span, strong, a, v.v) nhưng không xuống dòng
  text = text.replace(/<[^>]*>/g, '');
  // 4. Giải mã một số entity cơ bản
  text = text.replace(/&amp;/gi, '&')
             .replace(/&lt;/gi, '<')
             .replace(/&gt;/gi, '>')
             .replace(/&quot;/gi, '"')
             .replace(/&#39;/gi, "'")
             .replace(/&#160;/gi, ' ')
             .replace(/&nbsp;/gi, ' ')
             .replace(/&ndash;/gi, '-')
             .replace(/&mdash;/gi, '-')
             .replace(/\\r/g, ' ') // Xóa luôn chữ \r nếu bị lưu dưới dạng text
             .replace(/\\n/g, ' ');
  // 5. Chuẩn hóa khoảng trắng
  text = text.replace(/[ \t]+/g, ' ').replace(/\n\s+\n/g, '\n\n').trim();
  return text;
}

async function parseHtmlToLexical(html: string, payload: any, articleTitle: string) {
  const parts = html.split(/(<img[^>]+>)/gi);
  const children = [];

  for (const part of parts) {
    if (part.toLowerCase().startsWith('<img')) {
      const srcMatch = part.match(/src="([^"]+)"/i);
      if (srcMatch) {
        let src = srcMatch[1];
        if (src.startsWith('/')) src = 'https://ksbtdanang.vn' + src;
        
        const mediaId = await downloadMedia(payload, src, articleTitle);
        if (mediaId) {
          children.push({
            type: "upload",
            relationTo: "media",
            value: mediaId,
            version: 1,
            format: "",
            id: String(Date.now() + Math.floor(Math.random() * 10000)),
            fields: {}
          });
        }
      }
    } else {
      const textPart = stripHtml(part);
      if (textPart.trim()) {
        const paragraphs = textPart.split('\n').map(p => p.trim()).filter(p => p !== '');
        for (const p of paragraphs) {
          children.push({
            type: "paragraph",
            format: "justify",
            indent: 0,
            version: 1,
            direction: "ltr",
            children: [{ mode: "normal", text: p.substring(0, 10000), type: "text", style: "", detail: 0, format: 0, version: 1 }]
          });
        }
      }
    }
  }
  
  if (children.length === 0) {
    children.push({
      type: "paragraph", format: "justify", indent: 0, version: 1,
      children: [{ mode: "normal", text: " ", type: "text", style: "", detail: 0, format: 0, version: 1 }]
    });
  }

  return {
    root: {
      type: "root", format: "", indent: 0, version: 1, direction: "ltr",
      children: children
    }
  };
}

interface ArticleItem {
  id: number;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  slug: string;
}

async function fetchRssFeed(start: number): Promise<ArticleItem[]> {
  const url = `https://ksbtdanang.vn/news/rss/?start=${start}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } });
  const xml = await res.text();

  const items = xml.split('<item>').slice(1);
  const articles: ArticleItem[] = [];

  for (const item of items) {
    const titleMatch = item.match(/<title>(.*?)<\/title>/s);
    const linkMatch = item.match(/<link>(https?:\/\/ksbtdanang\.vn[^<]*)<\/link>/);
    const descMatch = item.match(/<description>\s*<!\[CDATA\[(.*?)\]\]>/s);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    const guidMatch = item.match(/<!\[CDATA\[news_(\d+)\]\]>/);

    if (!titleMatch || !linkMatch) continue;

    const id = guidMatch ? parseInt(guidMatch[1]) : 0;
    const title = titleMatch[1]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&#x[\w]+;/g, '').replace(/&#\d+;/g, '').trim();
    const link = linkMatch[1].trim();
    const description = stripHtml(descMatch ? descMatch[1] : '');
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    const slugMatch = link.match(/\/([^\/]+)-\d+\.html$/);
    const slug = slugMatch ? slugMatch[1] : toSlug(title);

    articles.push({ id, title, link, description, pubDate, slug });
  }

  return articles;
}

async function downloadMedia(payload: any, url: string, altText: string) {
  try {
    const fileName = (url.split('/').pop() || 'image.jpg').replace(/[^a-zA-Z0-9.\-]/g, '_');
    
    // Kiểm tra ảnh đã tồn tại chưa để tránh trùng lặp
    const existingMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: fileName } },
      limit: 1,
    });
    
    if (existingMedia.totalDocs > 0) {
      return existingMedia.docs[0].id;
    }

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());

    const mediaDoc = await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: {
        data: buffer,
        mimetype: contentType,
        name: fileName,
        size: buffer.byteLength,
      }
    });
    
    return mediaDoc.id;
  } catch (err) {
    console.error('Lỗi tải ảnh:', err);
    return null;
  }
}

async function runBackgroundSync(payload: any, categoryId: string | number, forceUpdate: boolean = false) {
  let totalImported = 0;
  let totalSkipped = 0;

  try {
    console.log('[Seed News] Bắt đầu crawl từ ksbtdanang.vn...');

    for (let start = 0; start <= 40; start += 20) {
      const articles = await fetchRssFeed(start);
      if (articles.length === 0) break;

      for (const art of articles) {
        if (!art.slug || !art.title) continue;

        const existing = await payload.find({
          collection: 'articles',
          where: { slug: { equals: art.slug } },
          limit: 1,
        });

        let existingArticle = null;
        if (existing.totalDocs > 0) {
          existingArticle = existing.docs[0];
          // Bỏ qua nếu không cờ forceUpdate VÀ đã có ảnh VÀ đã có description
          if (!forceUpdate && existingArticle.image && existingArticle.description) {
            totalSkipped++;
            continue;
          }
        }

        // Fetch HTML trang bài viết để lấy ảnh og:image và content
        let fullText = art.description;
        let imageUrl = null;
        let rawHtml = '';
        try {
          const res = await fetch(art.link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const html = await res.text();
          
          const $ = cheerio.load(html);
          
          const ogImageMatch = $('meta[property="og:image"]').attr('content');
          if (ogImageMatch) {
            imageUrl = ogImageMatch.replace(/&amp;/g, '&');
          } else {
            const imgMatch = $('#news-bodyhtml img').first().attr('src');
            if (imgMatch) {
              imageUrl = imgMatch;
              if (imageUrl.startsWith('/')) {
                imageUrl = 'https://ksbtdanang.vn' + imageUrl;
              }
            }
          }
          
          const rawHtmlContent = $('#news-bodyhtml').html();
          if (rawHtmlContent) {
            rawHtml = rawHtmlContent;
          }
          
          const sapoText = $('.hometext.m-bottom').text().trim();
          const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content');
          
          if (sapoText) {
            art.description = sapoText;
          } else if (metaDesc && metaDesc.trim() !== '') {
            art.description = metaDesc.trim();
          }
        } catch (err) {
        console.error("Lỗi crawl chi tiết:", art.link);
      }

      let mediaId = null;
      if (imageUrl) {
        mediaId = await downloadMedia(payload, imageUrl, art.title);
      }

      let finalContent = null;
      if (rawHtml) {
        finalContent = await parseHtmlToLexical(rawHtml, payload, art.title);
      } else if (!existingArticle) {
        finalContent = await parseHtmlToLexical(art.description, payload, art.title);
      }

      const articleData: any = {
        title: art.title,
        publishedAt: art.pubDate,
        slug: art.slug,
        category: categoryId,
        description: art.description.replace(/\n/g, ' ').trim(),
        author_name: 'CDC Đà Nẵng',
        views: 0,
        _status: 'published',
      };
      
      if (finalContent) {
        articleData.content = finalContent;
      }
      if (mediaId) {
        articleData.image = mediaId;
      }

        if (existingArticle) {
          await payload.update({
            collection: 'articles',
            id: existingArticle.id,
            data: articleData,
          });
          console.log(`Đã cập nhật: ${art.title} (Image: ${mediaId ? 'OK' : 'None'})`);
        } else {
          await payload.create({
            collection: 'articles',
            data: articleData,
          });
          console.log(`Đã import: ${art.title} (Image: ${mediaId ? 'OK' : 'None'})`);
        }

        totalImported++;
      }

      if (articles.length < 20) break;
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`[Seed News] Hoàn tất. Import: ${totalImported}, Bỏ qua: ${totalSkipped}`);
  } catch (error) {
    console.error('[Seed News] Lỗi crawl:', error);
  }
}

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise });

    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    const forceUpdate = url.searchParams.get('forceUpdate') === 'true';

    if (secret !== 'vnos-cdc-seed') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lấy ID của Category "Tin tức - Sự kiện"
    const catRes = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'tin-tuc-su-kien' } },
      limit: 1,
    });

    let categoryId = null;
    if (catRes.totalDocs > 0) {
      categoryId = catRes.docs[0].id;
    } else {
      const fallbackRes = await payload.find({
        collection: 'categories',
        limit: 1,
      });
      if (fallbackRes.totalDocs > 0) {
        categoryId = fallbackRes.docs[0].id;
      } else {
        categoryId = 1;
      }
    }

    // Chạy ngầm tiến trình crawl
    runBackgroundSync(payload, categoryId, forceUpdate);

    return NextResponse.json({
      success: true,
      message: 'Đã kích hoạt crawl bài viết VÀ TẢI ẢNH ĐẠI DIỆN từ ksbtdanang.vn.',
    });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
