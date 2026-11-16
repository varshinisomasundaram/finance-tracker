import { execSync } from 'child_process'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

module.exports = async () => {
  // Ensure test database is migrated
  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL },
      stdio: 'inherit',
    })
  } catch {
    // Migrations may already be applied
  }
}
