import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  
  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      slug: {
        contains: '/'
      }
    }
  });

  console.log(`Found ${docs.length} articles with slashes in slug.`);

  for (const doc of docs) {
    const newSlug = doc.slug.replace(/\//g, '-');
    console.log(`Updating ${doc.slug} to ${newSlug}`);
    await payload.update({
      collection: 'articles',
      id: doc.id,
      data: {
        slug: newSlug
      }
    });
  }

  console.log('Done!');
  process.exit(0);
}

run().catch(console.error);
