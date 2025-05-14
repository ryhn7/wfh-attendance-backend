import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const employeePassword = await bcrypt.hash('employee123', 10)

  // Seed 8 Admin Users
  for (let i = 1; i <= 8; i++) {
    const email = `admin${i}@example.com`
    const name = `Admin ${i}`

    const admin = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: adminPassword,
        name,
        role: 'ADMIN',
      },
    })

    console.log(`Created admin user: ${admin.email}`)
  }

  // Seed 8 Employee Users
  for (let i = 1; i <= 8; i++) {
    const email = `employee${i}@example.com`
    const name = `Employee ${i}`

    const employee = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: employeePassword,
        name,
        role: 'EMPLOYEE',
      },
    })

    console.log(`Created employee user: ${employee.email}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
