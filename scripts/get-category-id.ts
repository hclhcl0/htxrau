import { getPayload } from 'payload';
import configPromise from '../src/payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  
  const { docs } = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: 'cam-nang'
      }
    }
  });

  if (docs.length > 0) {
    console.log(`CATEGORY_ID=${docs[0].id}`);
  } else {
    console.log('Category not found');
  }
  process.exit(0);
}

run().catch(console.error);
