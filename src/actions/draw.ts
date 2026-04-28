"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function shuffle<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function generateAssignmentsWithRestrictions(
  ids: string[],
  blockedPairs: Set<string>
): { giverId: string; receiverId: string }[] {
  if (ids.length < 2) throw new Error("Not enough members")

  const assignments: { giverId: string; receiverId: string }[] = []
  const usedReceivers = new Set<string>()
  const givers = shuffle(ids)

  function canAssign(giverId: string, receiverId: string): boolean {
    if (giverId === receiverId) return false
    if (usedReceivers.has(receiverId)) return false
    if (blockedPairs.has(`${giverId}:${receiverId}`)) return false
    return true
  }

  function backtrack(index: number): boolean {
    if (index === givers.length) return true

    const giverId = givers[index]
    const candidates = shuffle(ids).filter((receiverId) =>
      canAssign(giverId, receiverId)
    )

    for (const receiverId of candidates) {
      assignments.push({ giverId, receiverId })
      usedReceivers.add(receiverId)

      if (backtrack(index + 1)) return true

      assignments.pop()
      usedReceivers.delete(receiverId)
    }

    return false
  }

  const found = backtrack(0)
  if (!found) throw new Error("No valid assignments with restrictions")

  return assignments
}

function validateAssignmentsAgainstRestrictions(
  assignments: { giverId: string; receiverId: string }[],
  blockedPairs: Set<string>
) {
  for (const assignment of assignments) {
    if (blockedPairs.has(`${assignment.giverId}:${assignment.receiverId}`)) {
      throw new Error("Restricted assignment")
    }
  }
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
  const restrictions = await prisma.drawRestriction.findMany({
    where: { groupId },
    select: { giverId: true, receiverId: true },
  })

  const blockedPairs = new Set(
    restrictions.map((restriction) => `${restriction.giverId}:${restriction.receiverId}`)
  )

  const assignments = generateAssignmentsWithRestrictions(memberIds, blockedPairs)

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
  const restrictions = await prisma.drawRestriction.findMany({
    where: { groupId },
    select: { giverId: true, receiverId: true },
  })

  const blockedPairs = new Set(
    restrictions.map((restriction) => `${restriction.giverId}:${restriction.receiverId}`)
  )

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

  validateAssignmentsAgainstRestrictions(assignments, blockedPairs)

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

export async function addDrawRestriction(
  groupId: string,
  giverId: string,
  receiverId: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  if (giverId === receiverId) throw new Error("Self-restriction not allowed")

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  })

  if (!group) throw new Error("Group not found")
  if (group.adminId !== session.user.id) throw new Error("Unauthorized")
  if (group.drawnAt) throw new Error("Draw already done")

  const memberIds = new Set(group.members.map((member) => member.userId))
  if (!memberIds.has(giverId) || !memberIds.has(receiverId)) {
    throw new Error("Invalid members for restriction")
  }

  await prisma.drawRestriction.create({
    data: {
      groupId,
      giverId,
      receiverId,
    },
  })
}

export async function removeDrawRestriction(groupId: string, restrictionId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group) throw new Error("Group not found")
  if (group.adminId !== session.user.id) throw new Error("Unauthorized")
  if (group.drawnAt) throw new Error("Draw already done")

  const restriction = await prisma.drawRestriction.findUnique({
    where: { id: restrictionId },
  })

  if (!restriction || restriction.groupId !== groupId) {
    throw new Error("Restriction not found")
  }

  await prisma.drawRestriction.delete({ where: { id: restrictionId } })
}
