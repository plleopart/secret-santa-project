"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAX_REPLIES_PER_ROUND = 5

export async function sendMessage(groupId: string, body: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const userId = session.user.id
  const trimmedBody = body.trim()
  if (!trimmedBody) throw new Error("Message body is empty")

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group) throw new Error("Group not found")
  if (!group.drawnAt) throw new Error("Draw not done yet")

  const assignment = await prisma.assignment.findUnique({
    where: { groupId_giverId: { groupId, giverId: userId } },
  })
  if (!assignment) throw new Error("No assignment found")

  // Insert WITHOUT sender_id — anonymity guaranteed at the data level
  await prisma.message.create({
    data: {
      groupId,
      recipientId: assignment.receiverId,
      body: trimmedBody,
      isReply: false,
    },
  })
}

export async function sendReply(groupId: string, body: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const userId = session.user.id
  const trimmedBody = body.trim()
  if (!trimmedBody) throw new Error("Message body is empty")

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group || !group.drawnAt) throw new Error("Draw not done yet")

  // Find the assignment where the current user is the RECEIVER
  const assignment = await prisma.assignment.findFirst({
    where: { groupId, receiverId: userId },
  })
  if (!assignment) throw new Error("No assignment found")

  // The giver must have sent at least one message first
  const lastOriginalMessage = await prisma.message.findFirst({
    where: { groupId, recipientId: userId, isReply: false },
    orderBy: { createdAt: "desc" },
  })
  if (!lastOriginalMessage) throw new Error("No messages received yet")

  // Count replies sent since the last original message received (round counter)
  const repliesSince = await prisma.message.count({
    where: {
      groupId,
      recipientId: assignment.giverId,
      isReply: true,
      createdAt: { gt: lastOriginalMessage.createdAt },
    },
  })
  if (repliesSince >= MAX_REPLIES_PER_ROUND) throw new Error("Reply limit reached")

  // Insert reply WITHOUT sender_id — anonymity guaranteed at the data level
  await prisma.message.create({
    data: {
      groupId,
      recipientId: assignment.giverId,
      body: trimmedBody,
      isReply: true,
    },
  })
}

export async function getReplyStatus(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const userId = session.user.id

  const assignment = await prisma.assignment.findFirst({
    where: { groupId, receiverId: userId },
  })
  if (!assignment) return { canReply: false, remaining: 0, hasMessages: false }

  const lastOriginalMessage = await prisma.message.findFirst({
    where: { groupId, recipientId: userId, isReply: false },
    orderBy: { createdAt: "desc" },
  })
  if (!lastOriginalMessage) return { canReply: false, remaining: 0, hasMessages: false }

  const repliesSince = await prisma.message.count({
    where: {
      groupId,
      recipientId: assignment.giverId,
      isReply: true,
      createdAt: { gt: lastOriginalMessage.createdAt },
    },
  })

  const remaining = Math.max(0, MAX_REPLIES_PER_ROUND - repliesSince)
  return { canReply: remaining > 0, remaining, hasMessages: true }
}

export async function markAllRead(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  const userId = session.user.id

  await prisma.message.updateMany({
    where: { groupId, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  })
}
