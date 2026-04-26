"use server"

import { auth } from "@/lib/auth"

export async function performDraw(_groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement Fisher-Yates shuffle with no self-assignment
}

export async function setManualAssignments(
  _groupId: string,
  _pairs: Array<{ giverId: string; receiverId: string }>,
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthenticated")

  // TODO: implement
}
