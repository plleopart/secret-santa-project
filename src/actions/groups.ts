"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function listMyGroups() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const userId = session.user.id

  const adminGroups = await prisma.group.findMany({
    where: { adminId: userId },
    include: {
      members: true,
      _count: { select: { messages: true } },
    },
  })

  const memberGroups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: true,
      assignments: { where: { giverId: userId } },
      messages: { where: { recipientId: userId, readAt: null } },
    },
  })

  return { adminGroups, memberGroups }
}

export async function createGroup(_data: { name: string; drawMode: "manual" | "automatic" }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement
}

export async function joinGroup(_inviteCode: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement
}

export async function getGroup(_groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement
}
