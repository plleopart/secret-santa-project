"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function sendMessage(_groupId: string, _body: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement
}

export async function getMyMessages(_groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement
}

export async function markAsRead(_messageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement
}
