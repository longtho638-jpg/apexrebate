import { db } from '@/lib/db';

async function debugDb() {
  console.log('Available models:', Object.keys(db));
  process.exit(0);
}

debugDb().catch(console.error);
