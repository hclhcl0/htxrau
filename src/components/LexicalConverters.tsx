import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';

import { UploadBlock } from './UploadBlock';
import { EmbedBlock } from './PageBlocks/EmbedBlock';
import { SliderClientBlock } from './blocks/SliderClientBlock';
import { InfographicClientBlock } from './blocks/InfographicClientBlock';
import { ExcelTableServerBlock } from './blocks/ExcelTableServerBlock';
import VideoBlock from './blocks/VideoBlock';
import { getMediaUrl } from '@/lib/mediaUrl';

function getGDriveEmbedUrl(url: string): { embedUrl: string; directUrl: string } {
  if (url && url.includes('drive.google.com')) {
    let fileId = '';
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    
    if (dMatch && dMatch[1]) {
      fileId = dMatch[1];
    } else if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }

    if (fileId) {
      return {
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        directUrl: `https://drive.google.com/file/d/${fileId}/view`
      };
    }
  }
  return { embedUrl: url, directUrl: url };
}

export const getJsxConverters = (fallbackAlt?: string) => ({ defaultConverters }: any) => ({
  ...defaultConverters,
  upload: ({ node }: any) => <UploadBlock node={node} fallbackAlt={fallbackAlt} />,
  blocks: {
    columnsBlock: ({ node }: any) => {
      const { layout, col1, col2, col3 } = node.fields;

      // Map layout value to CSS class name
      const layoutClassMap: Record<string, string> = {
        half: 'columns-half',
        third: 'columns-third',
        twoThirdsLeft: 'columns-two-thirds-left',
        twoThirdsRight: 'columns-two-thirds-right',
      };
      const layoutClass = layoutClassMap[layout] || 'columns-half';

      return (
        <div className={`columns-block-grid ${layoutClass}`}>
          <div>{col1 ? <RichText data={col1} converters={getJsxConverters(fallbackAlt)} /> : null}</div>
          <div>{col2 ? <RichText data={col2} converters={getJsxConverters(fallbackAlt)} /> : null}</div>
          {layout === 'third' && col3 && <div><RichText data={col3} converters={getJsxConverters(fallbackAlt)} /></div>}
        </div>
      );
    },
    videoBlock: ({ node }: any) => <VideoBlock data={node.fields} />,
    newsList: () => null,
    externalLinks: () => null,
    pdfBlock: ({ node }: any) => {
      const { source, pdfFile, gdriveUrl, displayMode, orientation } = node.fields || {};
      const url = source === 'upload' ? getMediaUrl(pdfFile, '') : gdriveUrl;
      if (!url) return null;
      
      const { embedUrl, directUrl } = getGDriveEmbedUrl(url);

      if (displayMode === 'download') {
         return (
           <div className="my-3 not-prose">
             <a 
               href={directUrl} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="inline-flex items-center gap-2 bg-gov-primary text-white px-6 py-3 font-medium rounded-lg hover:bg-gov-secondary transition-colors shadow-sm"
             >
               📄 Tải xuống tài liệu PDF
             </a>
           </div>
         );
      }

      const isGDrive = url.includes('drive.google.com');
      const aspectClass = orientation === 'horizontal' ? 'aspect-video' : 'aspect-[1/1.4]';

      return (
        <div className="my-4 not-prose">
          <div className={`${aspectClass} w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative shadow-sm`}>
            <iframe 
              src={embedUrl} 
              width="100%" 
              height="100%" 
              allow="autoplay"
              style={{ border: 'none' }}
            ></iframe>
          </div>
          {isGDrive && (
            <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-2 items-center">
              <span>Không hiển thị được tài liệu?</span>
              <a 
                href={directUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                Mở trực tiếp trong cửa sổ mới ↗
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-xs text-gray-500">(Hãy chắc chắn rằng tài liệu đã được bật quyền chia sẻ "Bất kỳ ai có liên kết đều xem được")</span>
            </div>
          )}
        </div>
      );
    },
    galleryBlock: ({ node }: any) => {
      const { images, caption, style } = node.fields || {};
      if (!images?.length) return null;

      // Hỗ trợ cả format mới (hasMany relationship: img là media object hoặc ID)
      // và format cũ (array: img là { image: {...}, caption: '...' })
      const normalizeImage = (img: any) => {
        if (!img) return null;
        if (typeof img === 'object' && img.image) {
          // Format cũ: img là { image: {...}, caption: '...' }
          const url = getMediaUrl(img.image, '');
          return url ? { url, alt: img.image?.alt || img.caption || '', caption: img.caption || null } : null;
        }
        // Format mới: img là media object trực tiếp hoặc ID
        const url = getMediaUrl(img, '');
        return url ? { url, alt: typeof img === 'object' ? (img.alt || '') : '', caption: null } : null;
      };

      const validImages = images.map(normalizeImage).filter(Boolean);
      if (!validImages.length) return null;

      if (style === 'slider') {
        const sliderImages = validImages.map((img: any) => ({
          image: { url: img.url, alt: img.alt },
          caption: img.caption || caption,
        }));
        return <SliderClientBlock images={sliderImages} autoplay={true} />;
      }

      const count = validImages.length;
      let gridClass = 'grid-cols-1';
      if (count === 2) gridClass = 'grid-cols-1 md:grid-cols-2';
      else if (count >= 3) gridClass = 'grid-cols-2 md:grid-cols-3';

      return (
        <div className="my-4 not-prose">
          <div className={`grid ${gridClass} gap-3`}>
            {validImages.map((img: any, i: number) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                <img
                  src={img.url}
                  alt={img.alt || caption || 'Ảnh thư viện'}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: count === 1 ? 'auto' : '4/3' }}
                />
                {img.caption && (
                  <p className="text-xs text-center text-gray-500 py-1.5 px-2 bg-gray-50">{img.caption}</p>
                )}
              </div>
            ))}
          </div>
          {caption && (
            <p className="text-sm text-center text-gray-500 mt-2 italic">{caption}</p>
          )}
        </div>
      );
    },

    calloutBlock: ({ node }: any) => {
      const { type, title, content } = node.fields;
      let bg = 'bg-blue-50 border-blue-200 text-blue-900';
      if (type === 'warning') bg = 'bg-yellow-50 border-yellow-200 text-yellow-900';
      if (type === 'danger') bg = 'bg-red-50 border-red-200 text-red-900';
      if (type === 'success') bg = 'bg-green-50 border-green-200 text-green-900';
      return (
        <div className={`p-5 my-3 border rounded-xl ${bg}`}>
          {title && <h4 className="font-bold text-lg mb-2">{title}</h4>}
          <p className="m-0 text-base">{content}</p>
        </div>
      );
    },
    buttonBlock: ({ node }: any) => {
      const { label, url, style, openInNewTab } = node.fields;
      const css = style === 'primary' ? 'bg-gov-primary text-white hover:bg-gov-secondary' : 'border-2 border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white';
      return (
        <div className="my-3">
          <a href={url} target={openInNewTab ? '_blank' : '_self'} className={`inline-block px-8 py-3 rounded-full font-bold transition-all ${css}`}>
            {label}
          </a>
        </div>
      );
    },
    relatedArticlesBlock: ({ node }: any) => {
      const { title, articles } = node.fields;
      if (!articles?.length) return null;
      return (
        <div className="my-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-gov-primary">{title}</h3>
          <ul className="space-y-3">
            {articles.map((art: any) => (
               <li key={art.id} className="flex items-start">
                 <span className="text-gov-secondary mr-2 mt-1">▶</span>
                 <a href={`/bai-viet/${art.slug || art.id}`} className="text-gray-800 font-medium hover:text-gov-secondary transition-colors text-lg">{typeof art === 'object' ? art.title : 'Bài viết liên quan'}</a>
               </li>
            ))}
          </ul>
        </div>
      );
    },
    cardBlock: ({ node }: any) => {
      const { image, title, description, linkUrl, linkLabel } = node.fields || {};
      const imgUrl = image ? getMediaUrl(image, '') : '';
      return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full my-3 hover:shadow-md transition-shadow not-prose">
          {imgUrl && (
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img src={imgUrl} alt={title || 'Hình ảnh'} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            {description && <p className="text-gray-600 mb-6 flex-grow">{description}</p>}
            {linkUrl && (
              <a href={linkUrl} className="inline-flex items-center mt-auto font-bold text-gov-primary hover:text-gov-secondary transition-colors group">
                {linkLabel || 'Xem thêm'} 
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            )}
          </div>
        </div>
      );
    },
    tiktokBlock: ({ node }: any) => {
      const { videoId, videoUrl, maxWidth, alignment } = node.fields || {};
      
      // Bóc tách video ID từ videoId hoặc từ videoUrl
      let tId = videoId;
      if (!tId && videoUrl) {
        const match = videoUrl.match(/video\/(\d+)/);
        if (match && match[1]) {
          tId = match[1];
        }
      }
      if (!tId) return null;

      // Tính toán CSS để căn lề
      const containerStyle: React.CSSProperties = {
        display: 'flex',
        width: '100%',
        margin: '1.5rem 0',
      };
      
      if (alignment === 'left') {
        containerStyle.justifyContent = 'flex-start';
      } else if (alignment === 'right') {
        containerStyle.justifyContent = 'flex-end';
      } else {
        containerStyle.justifyContent = 'center';
      }

      const playerUrl = `https://www.tiktok.com/player/v1/${tId}?music_info=1&description=1`;

      return (
        <div style={containerStyle} className="not-prose">
          <div style={{ width: '100%', maxWidth: `${maxWidth || 340}px`, aspectRatio: '9/16' }}>
            <iframe
              className="w-full h-full rounded-2xl overflow-hidden shadow-md"
              src={playerUrl}
              title="TikTok video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ aspectRatio: '9/16', minHeight: '520px', border: 'none' }}
            />
          </div>
        </div>
      );
    },
    imageLinkBlock: ({ node }: any) => {
      const { image, linkUrl, openInNewTab } = node.fields || {};
      const imgUrl = image ? getMediaUrl(image, '') : '';
      if (!imgUrl) return null;
      return (
        <span className="block my-6 w-full flex justify-center not-prose">
          <a href={linkUrl} target={openInNewTab ? '_blank' : '_self'} rel="noopener noreferrer" className="block max-w-full hover:opacity-90 transition-opacity">
            <img 
              src={imgUrl} 
              alt={(typeof image === 'object' ? image.alt : null) || "Ảnh minh họa"} 
              className="rounded-xl shadow-sm border border-gray-100" 
              style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </a>
        </span>
      );
    },
    embedBlock: ({ node }: any) => <EmbedBlock {...node.fields} />,
    audioBlock: ({ node }: any) => {
      const { title, sourceType, audioFile, audioUrl, description } = node.fields || {};
      const src = sourceType === 'upload' ? getMediaUrl(audioFile, '') : audioUrl;
      if (!src) return null;

      return (
        <div className="my-6 p-5 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 not-prose">
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
          <audio controls className="w-full mt-2 outline-none rounded-full" preload="metadata">
            <source src={src} />
            Trình duyệt của bạn không hỗ trợ thẻ audio.
          </audio>
        </div>
      );
    },
    fileDownloadsBlock: ({ node }: any) => {
      const { title, files } = node.fields || {};
      if (!files?.length) return null;
      return (
        <div className="my-6 bg-gray-50 border border-gray-200 p-5 rounded-2xl not-prose">
          <h3 className="font-bold text-lg mb-4 text-gov-primary border-b border-gray-200 pb-2">{title || 'Tài liệu đính kèm'}</h3>
          <ul className="space-y-3">
            {files.map((f: any, i: number) => {
              const file = f.file;
              if (!file) return null;
              const fileUrl = getMediaUrl(file, '');
              if (!fileUrl) return null;
              const fileName = typeof file === 'object' ? file.filename : 'file';
              const ext = fileName?.split('.').pop()?.toUpperCase() || 'FILE';
              const name = f.customName || fileName;
              return (
                <li key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gov-secondary transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded min-w-12 text-center">{ext}</span>
                    <a href={fileUrl} download target="_blank" rel="noreferrer" className="text-gray-800 font-medium hover:text-gov-secondary truncate">
                      {name}
                    </a>
                  </div>
                  <a href={fileUrl} download target="_blank" rel="noreferrer" className="shrink-0 bg-gov-primary/10 text-gov-primary hover:bg-gov-primary hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                    Tải về
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      );
    },
    dividerBlock: ({ node }: any) => {
      const { style, size } = node.fields || {};
      const marginMap: Record<string, string> = {
        sm: 'my-2',
        md: 'my-4',
        lg: 'my-8',
        xl: 'my-16',
      };
      const marginClass = marginMap[size] || 'my-4';

      if (style === 'space') {
        return <div className={marginClass} aria-hidden="true" />;
      }
      if (style === 'gradient') {
        return (
          <div className={`${marginClass} h-1 w-full bg-gradient-to-r from-transparent via-emerald-600 to-transparent rounded-full opacity-60 not-prose`} />
        );
      }
      return <hr className={`${marginClass} border-t border-gray-200 not-prose`} />;
    },
    excelTableBlock: ({ node }: any) => {
      return <ExcelTableServerBlock {...node.fields} />;
    },
    sliderBlock: ({ node }: any) => {
      return <SliderClientBlock images={node.fields.images} autoplay={node.fields.autoplay} />;
    },
    infographicBlock: ({ node }: any) => {
      return <InfographicClientBlock image={node.fields.image} caption={node.fields.caption} />;
    },

    livestreamBlock: ({ node }: any) => {
      const { title, platform, videoId, status, description } = node.fields;
      if (!videoId) return null;
      
      return (
        <div className="my-8 rounded-2xl overflow-hidden border border-gray-200 shadow-md">
          <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-bold m-0 flex items-center gap-2">
              <span className="text-xl">📡</span> {title}
            </h3>
            {status === 'live' && (
              <span className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span> TRỰC TIẾP
              </span>
            )}
            {status === 'upcoming' && <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">Sắp diễn ra</span>}
            {status === 'ended' && <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold">Đã phát</span>}
          </div>
          
          <div className="aspect-video bg-black w-full relative">
            {platform === 'youtube' ? (
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}?autoplay=${status === 'live' ? 1 : 0}`} frameBorder="0" allowFullScreen></iframe>
            ) : (
              <iframe src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoId)}&show_text=false`} width="100%" height="100%" style={{ border: 'none', overflow: 'hidden' }} scrolling="no" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
            )}
          </div>
          
          {description && (
             <div className="bg-gray-50 p-4 border-t border-gray-200">
               <p className="text-gray-700 m-0">{description}</p>
             </div>
          )}
        </div>
      );
    },
  }
});
