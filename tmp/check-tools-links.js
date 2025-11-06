const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

(async () => {
  console.log("🔍 Kiểm tra Tools Marketplace links...\n");
  
  try {
    // 1. Kiểm tra categories
    const categories = await db.tool_categories.findMany();
    console.log(`✅ Categories: ${categories.length} items`);
    categories.forEach(cat => {
      console.log(`   - ${cat.icon} ${cat.name} (id: ${cat.id})`);
    });
    
    // 2. Kiểm tra tools
    const tools = await db.tools.findMany({
      include: {
        tool_categories: true,
        users: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`\n✅ Tools: ${tools.length} items\n`);
    
    if (tools.length === 0) {
      console.log("⚠️  Không có tool nào! Hãy chạy seed trước.");
      process.exit(0);
    }
    
    // 3. Tạo links và kiểm tra
    console.log("📋 Links để test:\n");
    tools.forEach((tool, idx) => {
      const link = `/tools/${tool.id}`;
      console.log(`${idx + 1}. ${tool.name}`);
      console.log(`   Category: ${tool.tool_categories.name}`);
      console.log(`   Seller: ${tool.users.name || tool.users.email}`);
      console.log(`   Price: $${tool.price}`);
      console.log(`   Status: ${tool.status}`);
      console.log(`   🔗 Link: http://localhost:3000${link}`);
      console.log(`   🔗 Link EN: http://localhost:3000/en${link}`);
      console.log(`   🔗 Link VI: http://localhost:3000/vi${link}\n`);
    });
    
    // 4. Kiểm tra reviews
    const reviews = await db.tool_reviews.findMany({
      include: {
        tools: { select: { name: true } },
        users: { select: { name: true, email: true } }
      }
    });
    console.log(`✅ Reviews: ${reviews.length} items`);
    reviews.forEach(rev => {
      console.log(`   - ${rev.tools.name}: ${rev.rating}⭐ by ${rev.users.name || rev.users.email}`);
    });
    
    // 5. Tóm tắt
    console.log(`\n📊 Tóm tắt:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Tools: ${tools.length}`);
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Sellers: ${new Set(tools.map(t => t.sellerId)).size}`);
    
    console.log(`\n✅ Tất cả links đã được tạo!`);
    console.log(`\n💡 Cách test:`);
    console.log(`   1. Chạy: npm run dev`);
    console.log(`   2. Truy cập links ở trên`);
    console.log(`   3. Hoặc vào: http://localhost:3000/tools để xem danh sách\n`);
    
  } catch (e) {
    console.error("❌ Error:", e);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
})();
