import { PrismaClient } from '@prisma/client'
import { getOctokitForUser } from '../lib/octokit'

const prisma = new PrismaClient()

async function main() {
  const repoFullName = 'shahbaz957/NestJS-LMS'
  const [owner, repo] = repoFullName.split('/')

  // Get the first user (assuming only one user for now)
  const user = await prisma.user.findFirst()
  if (!user) throw new Error('No user found in DB')

  console.log(`Checking hooks for ${repoFullName} as user ${user.id}...`)
  const octokit = await getOctokitForUser(user.id)

  const { data: hooks } = await octokit.repos.listWebhooks({
    owner,
    repo,
  })

  console.log('--- GITHUB WEBHOOKS ---')
  console.log(JSON.stringify(hooks.map(h => ({
    id: h.id,
    url: h.config.url,
    active: h.active,
    last_response: h.last_response
  })), null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
