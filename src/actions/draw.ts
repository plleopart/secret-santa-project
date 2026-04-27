"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateDerangement(
  ids: string[]
): { giverId: string; receiverId: string }[] {
  const n = ids.length
  if (n < 2) throw new Error("Not enough members")

  let receivers: string[]
  // Retry until no self-assignment (converges in ~1.58 tries on average)
  do {
    receivers = [...ids]
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[receivers[i], receivers[j]] = [receivers[j], receivers[i]]
    }
  } while (receivers.some((r, i) => r === ids[i]))

  return ids.map((giverId, i) => ({ giverId, receiverId: receivers[i] }))
}

export async function performDraw(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  })

  if (!group) throw new Error("Group not found")
  if (group.adminId !== session.user.id) throw new Error("Unauthorized")
  if (group.drawnAt) throw new Error("Draw already done")
  if (group.drawMode !== "automatic") throw new Error("Wrong draw mode")
  if (group.members.length < 2) throw new Error("Not enough members")

  const memberIds = group.members.map((m) => m.userId)
  const assignments = generateDerangement(memberIds)

  await prisma.$transaction([
    prisma.assignment.createMany({
      data: assignments.map(({ giverId, receiverId }) => ({
        groupId,
        giverId,
        receiverId,
      })),
    }),
    prisma.group.update({
      where: { id: groupId },
      data: { drawnAt: new Date() },
    }),
  ])
}

export async function setManualAssignments(
  groupId: string,
  assignments: { giverId: string; receiverId: string }[]
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  })

  if (!group) throw new Error("Group not found")
  if (group.adminId !== session.user.id) throw new Error("Unauthorized")
  if (group.drawnAt) throw new Error("Draw already done")
  if (group.drawMode !== "manual") throw new Error("Wrong draw mode")

  const memberIds = new Set(group.members.map((m) => m.userId))

  if (assignments.length !== group.members.length)
    throw new Error("Incomplete assignments")

  const giverSet = new Set<string>()
  const receiverSet = new Set<string>()

  for (const a of assignments) {
    if (!memberIds.has(a.giverId) || !memberIds.has(a.receiverId))
      throw new Error("Invalid member in assignments")
    if (a.giverId === a.receiverId) throw new Error("Self-assignment not allowed")
    if (giverSet.has(a.giverId)) throw new Error("Duplicate giver")
    if (receiverSet.has(a.receiverId)) throw new Error("Duplicate receiver")
    giverSet.add(a.giverId)
    receiverSet.add(a.receiverId)
  }

  await prisma.$transaction([
    prisma.assignment.createMany({
      data: assignments.map((a) => ({
        groupId,
        giverId: a.giverId,
        receiverId: a.receiverId,
      })),
    }),
    prisma.group.update({
      where: { id: groupId },
      data: { drawnAt: new Date() },
    }),
  ])
}
