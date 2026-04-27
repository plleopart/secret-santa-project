import { Stack, Title } from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { GroupMessagingActions } from "@/components/groups/GroupMessagingActions"

export default async function MessagesHubPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const t = await getTranslations()
  const session = await auth()
  if (!session?.user?.id) notFound()

  const userId = session.user.id

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { where: { userId } } },
  })
  if (!group || group.members.length === 0) notFound()

  const [givingAssignment, unreadInbox, unreadReplies] = await Promise.all([
    prisma.assignment.findUnique({
      where: { groupId_giverId: { groupId, giverId: userId } },
      include: { receiver: { select: { name: true } } },
    }),
    // Unread messages received as a receiver (from giver)
    prisma.message.count({
      where: { groupId, recipientId: userId, isReply: false, readAt: null },
    }),
    // Unread replies received as a giver (from recipient)
    prisma.message.count({
      where: { groupId, recipientId: userId, isReply: true, readAt: null },
    }),
  ])

  return (
    <Stack gap="xl" maw={600}>
      <Title order={2}>{t("nav.messages")}</Title>
      <GroupMessagingActions
        groupId={groupId}
        hasAssignment={!!givingAssignment}
        receiverName={givingAssignment?.receiver.name ?? ""}
        showInboxAlways
        unreadInbox={unreadInbox}
        unreadReplies={unreadReplies}
      />
    </Stack>
  )
}
