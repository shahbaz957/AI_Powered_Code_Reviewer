import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- RECENT WEBHOOK EVENTS ---')
  const events = await prisma.webhookEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  console.log(JSON.stringify(events, null, 2))

  console.log('\n--- RECENT REVIEWS ---')
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  console.log(JSON.stringify(reviews, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
