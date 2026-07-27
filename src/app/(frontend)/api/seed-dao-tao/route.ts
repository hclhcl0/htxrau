import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://ksbtdanang.vn';

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
  let text = (html || '').replace(/[\r\n]+/g, ' ');
  text = text.replace(/<\/?(?:div|p|h[1-6]|ul|ol|li|table|tr|td|th|tbody|thead|tfoot|blockquote|article|section)[^>]*>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]*>/g, '');
  text = text.replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
             .replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&#160;/gi, ' ')
             .replace(/&nbsp;/gi, ' ').replace(/&ndash;/gi, '-').replace(/&mdash;/gi, '-');
  text = text.replace(/[ \t]+/g, ' ').replace(/\n\s+\n/g, '\n\n').trim();
  return text;
}

async function parseHtmlToLexical(html: string, payload: any, articleTitle: string) {
  const parts = html.split(/(<img[^>]+>)/gi);
  const children: any[] = [];

  for (const part of parts) {
    if (part.toLowerCase().startsWith('<img')) {
      const srcMatch = part.match(/src="([^"]+)"/i);
      if (srcMatch) {
        let src = srcMatch[1];
        if (src.startsWith('/')) src = BASE_URL + src;
        const mediaId = await downloadMedia(payload, src, articleTitle);
        if (mediaId) {
          children.push({
            type: "upload", relationTo: "media", value: mediaId, version: 1,
            format: "", id: String(Date.now() + Math.floor(Math.random() * 10000)), fields: {}
          });
        }
      }
    } else {
      const textPart = stripHtml(part);
      if (textPart.trim()) {
        const paragraphs = textPart.split('\n').map((p: string) => p.trim()).filter((p: string) => p !== '');
        for (const p of paragraphs) {
          children.push({
            type: "paragraph", format: "justify", indent: 0, version: 1, direction: "ltr",
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

  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}

async function downloadMedia(payload: any, url: string, altText: string) {
  try {
    const rawName = (url.split('/').pop() || 'image.jpg').split('?')[0];
    const sanitized = rawName.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const fileName = sanitized.replace(/^[_\-]+/, '') || 'image.jpg';

    const existingMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: fileName } },
      limit: 1,
    });
    if (existingMedia.totalDocs > 0) return existingMedia.docs[0].id;

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength === 0) return null;

    const mediaDoc = await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: { data: buffer, mimetype: contentType, name: fileName, size: buffer.byteLength },
    });
    return mediaDoc.id;
  } catch (err) {
    console.error('Lỗi tải ảnh:', err);
    return null;
  }
}

interface ArticleItem {
  title: string;
  link: string;
  slug: string;
}

async function fetchDaoTaoPage(pageUrl: string): Promise<ArticleItem[]> {
  const res = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } });
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const articles: ArticleItem[] = [];

  $('.panel.panel-default').each((_, el) => {
    const a = $(el).find('.panel-body h3 a').first();
    const href = a.attr('href') || '';
    const title = a.text().trim();
    if (!href || !title) return;

    const fullLink = href.startsWith('http') ? href : BASE_URL + href;
    // Lấy slug từ đuôi URL, bỏ số id cuối nếu có dạng /ten-bai-123.html
    const slugMatch = href.match(/\/([^\/]+?)(?:-\d+)?\.html$/);
    const slug = slugMatch ? slugMatch[1] : toSlug(title);
    articles.push({ title, link: fullLink, slug });
  });

  return articles;
}

async function crawlDaoTaoArticle(link: string, title: string) {
  try {
    const res = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return { imageUrl: null, rawHtml: '', description: '', pubDate: null };
    const html = await res.text();
    const $ = cheerio.load(html);

    const ogImage = $('meta[property="og:image"]').attr('content');
    let imageUrl: string | null = ogImage ? ogImage.replace(/&amp;/g, '&') : null;
    if (!imageUrl) {
      const firstImg = $('#news-bodyhtml img').first().attr('src');
      if (firstImg) imageUrl = firstImg.startsWith('/') ? BASE_URL + firstImg : firstImg;
    }

    const rawHtml = $('#news-bodyhtml').html() || '';
    const sapoText = $('.hometext.m-bottom').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    const description = sapoText || metaDesc.trim();

    // Lấy ngày tháng từ .date-time hoặc meta
    const dateText = $('.date-time').first().text().trim();
    let pubDate: string | null = null;
    if (dateText) {
      // định dạng thường là "DD/MM/YYYY HH:MM"
      const match = dateText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (match) {
        pubDate = new Date(`${match[3]}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}`).toISOString();
      }
    }

    return { imageUrl, rawHtml, description, pubDate };
  } catch {
    return { imageUrl: null, rawHtml: '', description: '', pubDate: null };
  }
}

async function runDaoTaoSync(payload: any, categoryId: string | number, forceUpdate: boolean) {
  let totalImported = 0;
  let totalSkipped = 0;

  try {
    console.log('[Seed Đào Tạo] Bắt đầu crawl từ ksbtdanang.vn/dao-tao/...');

    // Crawl tất cả các trang (trang 1..5, kiểm tra xem có thêm không)
    const pageUrls = [
      `${BASE_URL}/dao-tao/`,
      ...Array.from({ length: 9 }, (_, i) => `${BASE_URL}/dao-tao/page-${i + 2}/`),
    ];

    for (const pageUrl of pageUrls) {
      console.log(`[Seed Đào Tạo] Đang crawl trang: ${pageUrl}`);
      const articles = await fetchDaoTaoPage(pageUrl);
      if (articles.length === 0) {
        console.log(`[Seed Đào Tạo] Không tìm thấy bài nào ở ${pageUrl}, dừng.`);
        break;
      }

      for (const art of articles) {
        if (!art.slug || !art.title) continue;

        const existing = await payload.find({
          collection: 'articles',
          where: { slug: { equals: art.slug } },
          limit: 1,
        });

        let existingArticle: any = null;
        if (existing.totalDocs > 0) {
          existingArticle = existing.docs[0];
          const descOk = existingArticle.description && existingArticle.description.length >= 30;
          if (!forceUpdate && existingArticle.image && descOk) {
            totalSkipped++;
            continue;
          }
        }

        const { imageUrl, rawHtml, description, pubDate } = await crawlDaoTaoArticle(art.link, art.title);

        let mediaId = null;
        if (imageUrl) mediaId = await downloadMedia(payload, imageUrl, art.title);

        let finalContent = null;
        if (rawHtml) {
          finalContent = await parseHtmlToLexical(rawHtml, payload, art.title);
        }

        const articleData: any = {
          title: art.title,
          slug: art.slug,
          category: categoryId,
          description: (description || art.title).replace(/\n/g, ' ').trim(),
          author_name: 'CDC Đà Nẵng',
          views: 0,
          _status: 'published',
        };
        if (pubDate) articleData.publishedAt = pubDate;
        if (finalContent) articleData.content = finalContent;
        if (mediaId) articleData.image = mediaId;

        if (existingArticle) {
          await payload.update({ collection: 'articles', id: existingArticle.id, data: articleData });
          console.log(`[Đào Tạo] Cập nhật: ${art.title}`);
        } else {
          await payload.create({ collection: 'articles', data: articleData });
          console.log(`[Đào Tạo] Import: ${art.title}`);
        }
        totalImported++;

        await new Promise(r => setTimeout(r, 300));
      }
    }

    console.log(`[Seed Đào Tạo] Hoàn tất. Import/cập nhật: ${totalImported}, Bỏ qua: ${totalSkipped}`);
  } catch (error) {
    console.error('[Seed Đào Tạo] Lỗi:', error);
  }
}

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    const forceUpdate = url.searchParams.get('forceUpdate') === 'true';
    const categorySlug = url.searchParams.get('category') || 'dao-tao';

    if (secret !== 'vnos-cdc-seed') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tìm category theo slug được truyền vào (mặc định: dao-tao)
    const catRes = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
    });

    let categoryId: any = null;
    if (catRes.totalDocs > 0) {
      categoryId = catRes.docs[0].id;
      console.log(`[Seed Đào Tạo] Dùng category: "${catRes.docs[0].title}" (id=${categoryId})`);
    } else {
      return NextResponse.json({
        error: `Không tìm thấy category với slug "${categorySlug}". Hãy tạo chuyên mục trước hoặc truyền ?category=<slug> đúng.`,
      }, { status: 404 });
    }

    // Chạy ngầm
    runDaoTaoSync(payload, categoryId, forceUpdate);

    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt crawl phần ĐÀO TẠO từ ksbtdanang.vn. Category: "${catRes.docs[0].title}". Theo dõi log để biết tiến trình.`,
    });
  } catch (error) {
    console.error('[Seed Đào Tạo] Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
