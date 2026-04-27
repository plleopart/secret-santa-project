"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function listMyGroups() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const userId = session.user.id

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: true,
      messages: { where: { recipientId: userId, readAt: null } },
    },
    orderBy: { createdAt: "desc" },
  })

  return groups.map((g) => ({
    ...g,
    isAdmin: g.adminId === userId,
    unreadCount: g.messages.length,
  }))
}

export async function createGroup(data: {
  name: string
  drawMode: "manual" | "automatic"
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const userId = session.user.id

  const group = await prisma.group.create({
    data: {
      name: data.name.trim(),
      inviteCode: generateInviteCode(),
      adminId: userId,
      drawMode: data.drawMode,
      members: {
        create: { userId },
      },
    },
  })

  return group.id
}

export async function joinGroup(inviteCode: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const userId = session.user.id

  const group = await prisma.group.findUnique({
    where: { inviteCode: inviteCode.trim().toUpperCase() },
  })

  if (!group) throw new Error("Group not found")

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId } },
  })

  if (existing) throw new Error("Already a member")

  await prisma.groupMember.create({
    data: { groupId: group.id, userId },
  })

  return group.id
}

export async function getGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      },
      assignments: {
        include: {
          giver: true,
          receiver: true,
        },
      },
    },
  })

  if (!group) throw new Error("Group not found")

  const uid = session.user!.id
  const isAdmin = group.adminId === uid
  const isMember = isAdmin || group.members.some((m) => m.userId === uid)

  if (!isMember) throw new Error("Unauthorized")

  const myAssignment = group.assignments.find((a) => a.giverId === uid) ?? null

  return { group, isAdmin, myAssignment }
}

export async function addMember(
  groupId: string,
  data: { name: string; email: string }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group) throw new Error("Group not found")
  if (group.adminId !== session.user.id) throw new Error("Unauthorized")
  if (group.drawnAt) throw new Error("Draw already done")

  // Reuse existing user by email if possible, otherwise create a guest user
  let user = await prisma.user.findFirst({
    where: { email: data.email.trim().toLowerCase() },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        keycloakId: crypto.randomUUID(),
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
      },
    })
  }

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.keycloakId } },
  })
  if (existing) throw new Error("Already a member")

  await prisma.groupMember.create({
    data: { groupId, userId: user.keycloakId },
  })
}
