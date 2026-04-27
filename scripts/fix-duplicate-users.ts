/**
 * One-time script to merge duplicate user rows created when a guest user (added by
 * admin before they logged in) and their subsequent Keycloak login row coexist.
 *
 * Strategy:
 *   - For each duplicated email, find the row with real FK data (group_members, etc.)
 *     and the row without (the empty Keycloak-login row).
 *   - Delete the empty row first (no FK refs → RESTRICT is fine).
 *   - Update the data-bearing row's keycloak_id to the real Keycloak sub.
 *     ON UPDATE CASCADE propagates to all FK tables automatically.
 *   - If BOTH rows are empty (no memberships), keep the one with more FK refs or
 *     just keep the newer one (the real Keycloak login) and delete the old UUID row.
 */

import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dups: Array<{ email: string; keycloak_id: string; member_count: bigint }> =
    await prisma.$queryRaw`
      SELECT u.email, u.keycloak_id, COUNT(gm.id) AS member_count
      FROM users u
      LEFT JOIN group_members gm ON gm.user_id = u.keycloak_id
      WHERE u.email IN (
        SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1
      )
      GROUP BY u.email, u.keycloak_id, u.created_at
      ORDER BY u.email, u.created_at ASC
    `

  if (dups.length === 0) {
    console.log("No duplicate emails found.")
    return
  }

  // Group by email
  const byEmail = new Map<string, typeof dups>()
  for (const row of dups) {
    const list = byEmail.get(row.email) ?? []
    list.push(row)
    byEmail.set(row.email, list)
  }

  for (const [email, rows] of byEmail) {
    console.log(`\nProcessing: ${email} (${rows.length} rows)`)
    rows.forEach((r) =>
      console.log(`  keycloak_id=${r.keycloak_id}  member_count=${r.member_count}`)
    )

    // The row with more FK refs is the "guest" one (has data); the other is empty login row.
    rows.sort((a, b) => Number(b.member_count) - Number(a.member_count))
    const dataRow = rows[0]   // has memberships (or both empty → keep newest = last login)
    const emptyRows = rows.slice(1)

    // For each "extra" row: delete it (it has no FK refs), then update dataRow's id to it
    // if it looks like the real Keycloak sub (the one we want to end up with).
    // Simple heuristic: the row with 0 member_count AND created AFTER the data row is the
    // real Keycloak sub (logged in after being added as guest).
    const realSubRow = emptyRows.find((r) => Number(r.member_count) === 0)

    if (!realSubRow) {
      console.log(`  ⚠ Could not identify real Keycloak sub row — skipping.`)
      continue
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete the empty row (safe: no FK refs)
      await tx.$executeRaw`DELETE FROM users WHERE keycloak_id = ${realSubRow.keycloak_id}`
      console.log(`  Deleted empty row: ${realSubRow.keycloak_id}`)

      // 2. Update the data row's keycloak_id to the real sub (CASCADE updates all FKs)
      await tx.$executeRaw`UPDATE users SET keycloak_id = ${realSubRow.keycloak_id} WHERE keycloak_id = ${dataRow.keycloak_id}`
      console.log(`  Updated ${dataRow.keycloak_id} → ${realSubRow.keycloak_id}`)
    })
  }

  console.log("\nDone.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
