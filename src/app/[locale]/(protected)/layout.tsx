import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProtectedShell } from "@/components/layout/ProtectedShell"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function ProtectedLayout({ children, params }: Props) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id || !session.user.email) {
    redirect(`/${locale}/login`)
  }

  // Ensure the user exists in the DB on every authenticated request.
  // Upsert by email so that guest users (added by admin before login) get their
  // keycloakId promoted to the real Keycloak sub on first login.
  const email = session.user.email.toLowerCase()
  const name = session.user.name ?? email
  await prisma.user.upsert({
    where: { email },
    update: { keycloakId: session.user.id, name },
    create: { keycloakId: session.user.id, email, name },
  })

  const userId = session.user.id
  const rawNavGroups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    select: {
      id: true,
      name: true,
      adminId: true,
      messages: {
        where: { recipientId: userId, readAt: null },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const navGroups = rawNavGroups.map((g) => ({
    id: g.id,
    name: g.name,
    isAdmin: g.adminId === userId,
    unreadCount: g.messages.length,
  }))

  return (
    <ProtectedShell
      userName={session.user.name ?? session.user.email}
      userEmail={session.user.email}
      navGroups={navGroups}
    >
      {children}
    </ProtectedShell>
  )
}
