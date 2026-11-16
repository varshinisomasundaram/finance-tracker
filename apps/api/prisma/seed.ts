import { PrismaClient } from '@prisma/client'
import { systemCategories, systemCategoryId } from './system-categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding system categories...')

  for (const category of systemCategories) {
    // We use a compound check — name + type + isSystem for uniqueness
    const id = systemCategoryId(category.name)
    await prisma.category.upsert({
      where: { id },
      update: { color: category.color, icon: category.icon },
      create: {
        id,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        isSystem: true,
        userId: null,
      },
    })
  }

  console.log(`✅ Seeded ${systemCategories.length} system categories`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
