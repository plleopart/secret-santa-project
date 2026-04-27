import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  ThemeIcon,
  Divider,
  Alert,
  Box,
} from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ReplyForm } from "@/components/messages/ReplyForm"
import { IconArrowLeft, IconMail, IconMessageOff } from "@tabler/icons-react"
import { getReplyStatus } from "@/actions/messages"

export default async function MessagesPage({
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

  // Mark all original messages received as read
  await prisma.message.updateMany({
    where: { groupId, recipientId: userId, isReply: false, readAt: null },
    data: { readAt: new Date() },
  })

  // Find assignment where user is receiver (to get giverId for replies)
  const assignment = await prisma.assignment.findFirst({
    where: { groupId, receiverId: userId },
  })

  // Full conversation: received messages + sent replies, sorted chronologically
  const conversation = assignment
    ? await prisma.message.findMany({
        where: {
          groupId,
          OR: [
            { recipientId: userId, isReply: false },
            { recipientId: assignment.giverId, isReply: true },
          ],
        },
        orderBy: { createdAt: "asc" },
      })
    : await prisma.message.findMany({
        where: { groupId, recipientId: userId, isReply: false },
        orderBy: { createdAt: "asc" },
      })

  const { canReply, remaining, hasMessages } = await getReplyStatus(groupId)

  const hasOriginalMessages = conversation.some((m) => !m.isReply)

  return (
    <Stack gap="xl" maw={600}>
      <Link
        href={`/groups/${groupId}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "var(--mantine-font-size-sm)",
          color: "var(--mantine-color-dimmed)",
          textDecoration: "none",
        }}
      >
        <IconArrowLeft size={14} />
        {group.name}
      </Link>

      <Group gap="sm" align="center">
        <ThemeIcon color="blue" variant="light" size="lg" radius="xl">
          <IconMail size={18} />
        </ThemeIcon>
        <Title order={2}>{t("messages.inbox")}</Title>
      </Group>

      {!hasOriginalMessages ? (
        <Stack align="center" gap="sm" py="xl">
          <IconMessageOff size={40} style={{ opacity: 0.2 }} />
          <Text c="dimmed" ta="center">
            {t("messages.noMessages")}
          </Text>
        </Stack>
      ) : (
        <>
          {/* Conversation thread */}
          <Stack gap="xs">
            {conversation.map((m) => {
              const isMine = m.isReply
              return (
                <Box
                  key={m.id}
                  style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}
                >
                  <Paper
                    withBorder
                    p="sm"
                    radius="md"
                    maw="85%"
                    bg={isMine ? "var(--mantine-color-blue-light)" : "var(--mantine-color-default-hover)"}
                  >
                    <Text size="xs" fw={600} c="dimmed" mb={4}>
                      {isMine ? t("messages.youLabel") : t("messages.sender")}
                    </Text>
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {m.body}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4} ta={isMine ? "right" : "left"}>
                      {new Date(m.createdAt).toLocaleString("ca")}
                    </Text>
                  </Paper>
                </Box>
              )
            })}
          </Stack>

          {/* Reply section */}
          <Stack gap="sm">
            <Divider
              label={
                <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                  {t("messages.reply")}
                </Text>
              }
              labelPosition="left"
            />

            {!hasMessages ? (
              <Alert color="gray" variant="light">
                {t("messages.noMessagesForReply")}
              </Alert>
            ) : (
              <ReplyForm groupId={groupId} remaining={remaining} />
            )}
          </Stack>
        </>
      )}
    </Stack>
  )
}
