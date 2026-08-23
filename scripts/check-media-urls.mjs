process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'htx-rau-secret-key-very-secure-2026-safe-guard';

import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function main() {
  let config = await configPromise;
  if (config.default) config = await config.default;
  config.secret = config.secret || 'htx-rau-secret-key-very-secure-2026-safe-guard';
  const payload = await getPayload({ config });
  
  const media = await payload.find({ collection: 'media', limit: 5, depth: 0, overrideAccess: true });
  console.log('Media docs:');
  for (const m of media.docs) {
    console.log(JSON.stringify({ id: m.id, filename: m.filename, url: m.url }));
  }

  // Check site settings for banners
  const siteSettings = await payload.findGlobal({ slug: 'site-settings', depth: 2, overrideAccess: true });
  if (siteSettings.banners?.length > 0) {
    console.log('\nBanner images:');
    for (const b of siteSettings.banners.slice(0, 3)) {
      if (b.image) {
        console.log(JSON.stringify({ bannerTitle: b.title, imageUrl: b.image?.url, imageFilename: b.image?.filename }));
      }
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
