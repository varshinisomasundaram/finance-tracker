import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const sampleReviews = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bangalore',
    rating: 5,
    text: 'Finally a finance tracker that respects my privacy. No bank connections, no ads — just clean data I entered myself. The net worth dashboard is incredibly satisfying to watch grow each month.',
    createdAt: daysAgo(1),
  },
  {
    name: 'Rahul Mehta',
    role: 'Freelance Designer, Mumbai',
    rating: 5,
    text: 'The multi-currency support is a game changer. I have investments in USD and INR and it converts everything live. Super helpful for tracking my real net worth without manual calculations.',
    createdAt: daysAgo(3),
  },
  {
    name: 'Ananya Krishnan',
    role: 'Product Manager, Chennai',
    rating: 5,
    text: "I love the insurance renewal tracker. I used to miss renewals every year and pay a penalty. Now it shows me what's due in the next 30 days — brilliant feature that has already saved me money!",
    createdAt: daysAgo(6),
  },
  {
    name: 'Vikram Nair',
    role: 'Chartered Accountant, Kochi',
    rating: 5,
    text: 'I recommend this to all my clients. The goals module with the inflation calculator is genuinely useful — ₹50L today will need ₹90L in 10 years at 6% inflation. It shows that clearly.',
    createdAt: daysAgo(10),
  },
  {
    name: 'Sneha Reddy',
    role: 'Data Analyst, Hyderabad',
    rating: 5,
    text: 'Clean, fast, and no bloat. I tried four other apps before this. None of them let me track gold, PPF, and real estate together in one place. This one handles it all beautifully.',
    createdAt: daysAgo(14),
  },
  {
    name: 'Arjun Patel',
    role: 'Startup Founder, Ahmedabad',
    rating: 4,
    text: 'The EMI calculator on the liabilities page saved me hours. I can now see exactly how much interest I am paying on my home loan vs car loan side by side. Would love a mobile app next!',
    createdAt: daysAgo(21),
  },
  {
    name: 'Meera Iyer',
    role: 'Doctor, Pune',
    rating: 5,
    text: 'I was skeptical at first but the self-hosted option sold me. My financial data stays on my own server. The setup took under 10 minutes and I have had zero issues since.',
    createdAt: daysAgo(30),
  },
  {
    name: 'Karthik Subramaniam',
    role: 'Investment Analyst, Coimbatore',
    rating: 5,
    text: "The net worth snapshot feature is underrated. I take one every month and can visually see my wealth growing over time. It's become a personal ritual I look forward to.",
    createdAt: daysAgo(45),
  },
  {
    name: 'Divya Nambiar',
    role: 'HR Manager, Trivandrum',
    rating: 4,
    text: 'Very intuitive UI. I set up all my FD, RD, and PPF accounts in under 20 minutes. The category breakdown for expenses has made me much more mindful of where my money goes.',
    createdAt: daysAgo(60),
  },
  {
    name: 'Suresh Babu',
    role: 'Civil Engineer, Hyderabad',
    rating: 5,
    text: 'The budget tracking with category-wise limits is exactly what I needed. I set monthly limits for groceries, fuel, and dining and the app keeps me on track. Solid product!',
    createdAt: daysAgo(90),
  },
]

async function main() {
  console.log('🌱 Seeding sample reviews with varied dates...')

  let count = 0
  for (const review of sampleReviews) {
    await prisma.review.upsert({
      where: { id: `sample-review-${count + 1}` },
      update: { createdAt: review.createdAt },
      create: {
        id: `sample-review-${count + 1}`,
        name: review.name,
        role: review.role,
        rating: review.rating,
        text: review.text,
        isApproved: true,
        createdAt: review.createdAt,
      },
    })
    count++
  }

  console.log(`✅ Seeded ${count} sample reviews`)
}

main()
  .catch((e) => {
    console.error('❌ Reviews seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
