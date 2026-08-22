import { getPayload } from 'payload';
import config from '../src/payload.config.ts';

async function run() {
  console.log('🔄 Initializing Payload to push schema...');
  try {
    const payload = await getPayload({ config });
    console.log('✅ Payload initialized. Schema push should be complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Payload:', error);
    process.exit(1);
  }
}

run();
