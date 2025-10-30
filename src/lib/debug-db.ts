import { db } from '@/lib/db';

async function debugDb() {
  console.log('Available models:', Object.keys(db));
  console.log('ToolCategory:', db.toolCategory);
  console.log('Tool:', db.tool);
  process.exit(0);
}

debugDb().catch(console.error);