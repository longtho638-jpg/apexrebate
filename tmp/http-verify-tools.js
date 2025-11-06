const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function fetchWithStatus(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return { status: res.status };
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'timeout' : (e.message || 'error') };
  } finally {
    clearTimeout(timeout);
  }
}

(async () => {
  console.log('🌐 HTTP verify tools links (base/en/vi)');
  try {
    const tools = await db.tools.findMany({ take: 3, orderBy: { updatedAt: 'desc' } });
    if (tools.length === 0) {
      console.log('⚠️  No tools found. Run: npm run seed:handoff');
      process.exit(0);
    }
    for (const t of tools) {
      const urls = [
        `http://localhost:3000/tools/${t.id}`,
        `http://localhost:3000/en/tools/${t.id}`,
        `http://localhost:3000/vi/tools/${t.id}`
      ];
      console.log(`\n🔧 ${t.name}`);
      for (const u of urls) {
        const r = await fetchWithStatus(u);
        if (r.status) {
          console.log(` - ${u} → ${r.status}`);
        } else {
          console.log(` - ${u} → ERROR (${r.error})`);
        }
      }
    }
    console.log('\n✅ Done');
  } catch (e) {
    console.error('❌ HTTP verify failed:', e);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
})();
