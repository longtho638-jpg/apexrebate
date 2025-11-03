const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const tools = await prisma.tool.count();
  const categories = await prisma.toolCategory.count();
  const reviews = await prisma.toolReview.count();
  console.log({ users, tools, categories, reviews });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
