"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type WishlistDirection = "up" | "down"

export interface WishlistItemInput {
  name: string
  description?: string
  url?: string
}

function validateAndNormalizeUrl(value?: string): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  try {
    return new URL(trimmed).toString()
  } catch {
    throw new Error("Invalid URL")
  }
}

function validateAndNormalizeName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Wishlist item name is required")
  if (trimmed.length > 120) throw new Error("Wishlist item name is too long")
  return trimmed
}

function normalizeDescription(description?: string): string | null {
  const trimmed = description?.trim()
  if (!trimmed) return null
  if (trimmed.length > 1000) throw new Error("Wishlist item description is too long")
  return trimmed
}

async function requireUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")
  return session.user.id
}

async function assertGroupMembership(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })

  if (!membership) throw new Error("Unauthorized")
}

async function getOwnedItem(itemId: string, userId: string) {
  const item = await prisma.wishlistItem.findUnique({ where: { id: itemId } })
  if (!item) throw new Error("Wishlist item not found")
  if (item.userId !== userId) throw new Error("Unauthorized")
  return item
}

export async function getWishlistData(groupId: string) {
  const userId = await requireUserId()
  await assertGroupMembership(groupId, userId)

  const [myItems, givingAssignment] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { groupId, userId },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    }),
    prisma.assignment.findUnique({
      where: { groupId_giverId: { groupId, giverId: userId } },
      include: {
        receiver: {
          select: {
            keycloakId: true,
            name: true,
          },
        },
      },
    }),
  ])

  if (!givingAssignment) {
    return {
      myItems,
      recipient: null,
      recipientItems: [],
    }
  }

  const recipientItems = await prisma.wishlistItem.findMany({
    where: { groupId, userId: givingAssignment.receiverId },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  })

  return {
    myItems,
    recipient: {
      id: givingAssignment.receiver.keycloakId,
      name: givingAssignment.receiver.name,
    },
    recipientItems,
  }
}

export async function addWishlistItem(groupId: string, input: WishlistItemInput) {
  const userId = await requireUserId()
  await assertGroupMembership(groupId, userId)

  const name = validateAndNormalizeName(input.name)
  const description = normalizeDescription(input.description)
  const url = validateAndNormalizeUrl(input.url)

  const maxPriorityAggregate = await prisma.wishlistItem.aggregate({
    where: { groupId, userId },
    _max: { priority: true },
  })

  const nextPriority = (maxPriorityAggregate._max.priority ?? 0) + 1

  await prisma.wishlistItem.create({
    data: {
      groupId,
      userId,
      name,
      description,
      url,
      priority: nextPriority,
    },
  })
}

export async function updateWishlistItem(itemId: string, input: WishlistItemInput) {
  const userId = await requireUserId()
  const item = await getOwnedItem(itemId, userId)

  const name = validateAndNormalizeName(input.name)
  const description = normalizeDescription(input.description)
  const url = validateAndNormalizeUrl(input.url)

  await prisma.wishlistItem.update({
    where: { id: item.id },
    data: {
      name,
      description,
      url,
    },
  })
}

export async function deleteWishlistItem(itemId: string) {
  const userId = await requireUserId()
  const item = await getOwnedItem(itemId, userId)

  await prisma.wishlistItem.delete({ where: { id: item.id } })
}

export async function moveWishlistItem(itemId: string, direction: WishlistDirection) {
  const userId = await requireUserId()
  const item = await getOwnedItem(itemId, userId)

  const neighborWhere =
    direction === "up"
      ? {
          groupId: item.groupId,
          userId: item.userId,
          priority: { lt: item.priority },
        }
      : {
          groupId: item.groupId,
          userId: item.userId,
          priority: { gt: item.priority },
        }

  const neighbor = await prisma.wishlistItem.findFirst({
    where: neighborWhere,
    orderBy:
      direction === "up"
        ? [{ priority: "desc" }, { createdAt: "asc" }]
        : [{ priority: "asc" }, { createdAt: "asc" }],
  })

  if (!neighbor) return

  await prisma.$transaction([
    prisma.wishlistItem.update({
      where: { id: item.id },
      data: { priority: neighbor.priority },
    }),
    prisma.wishlistItem.update({
      where: { id: neighbor.id },
      data: { priority: item.priority },
    }),
  ])
}
