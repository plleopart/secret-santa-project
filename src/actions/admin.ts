"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getGroupAssignments(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group || group.adminId !== session.user.id) {
    throw new Error("Admin permission required for this group")
  }

  return prisma.assignment.findMany({
    where: { groupId },
    include: {
      giver: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } },
    },
  })
}

export async function getGroupMessages(_groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement (admin only)
}
