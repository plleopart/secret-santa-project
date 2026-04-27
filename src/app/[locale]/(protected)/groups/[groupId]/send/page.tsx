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
import { AnonymousMessageForm } from "@/components/messages/AnonymousMessageForm"
import { IconArrowLeft, IconGift, IconLock } from "@tabler/icons-react"

export default async function SendMessagePage({
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

  if (!group.drawnAt) {
    return (
      <Stack gap="xl" maw={600}>
        <BackLink groupId={groupId} groupName={group.name} />
        <Alert color="orange" icon={<IconLock size={16} />}>
          {t("errors.drawNotDone")}
        </Alert>
      </Stack>
    )
  }

  const assignment = await prisma.assignment.findUnique({
    where: { groupId_giverId: { groupId, giverId: userId } },
    include: { receiver: { select: { name: true } } },
  })

  if (!assignment) {
    return (
      <Stack gap="xl" maw={600}>
        <BackLink groupId={groupId} groupName={group.name} />
        <Alert color="gray">{t("errors.noAssignment")}</Alert>
      </Stack>
    )
  }

  // Mark replies received by the giver as read
  await prisma.message.updateMany({
    where: { groupId, recipientId: userId, isReply: true, readAt: null },
    data: { readAt: new Date() },
  })

  // Full conversation: sent messages + replies received, sorted chronologically
  const conversation = await prisma.message.findMany({
    where: {
      groupId,
      OR: [
        { recipientId: assignment.receiverId, isReply: false },
        { recipientId: userId, isReply: true },
      ],
    },
    orderBy: { createdAt: "asc" },
  })

  return (
    <Stack gap="xl" maw={600}>
      <BackLink groupId={groupId} groupName={group.name} />

      <Stack gap="xs">
        <Title order={2}>{t("messages.send")}</Title>
        <Group gap="xs">
          <ThemeIcon color="blue" variant="light" size="sm" radius="xl">
            <IconGift size={12} />
          </ThemeIcon>
          <Text size="sm" c="dimmed">
            {t("messages.to")}:{" "}
            <Text span fw={600} c="blue">
              {assignment.receiver.name}
            </Text>
          </Text>
        </Group>
      </Stack>

      <AnonymousMessageForm groupId={groupId} />

      {conversation.length > 0 && (
        <Stack gap="sm">
          <Divider
            label={
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                {t("messages.conversation")}
              </Text>
            }
            labelPosition="left"
          />
          <Stack gap="xs">
            {conversation.map((m) => {
              const isMine = !m.isReply
              return (
                <Box key={m.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                  <Paper
                    withBorder
                    p="sm"
                    radius="md"
                    maw="85%"
                    bg={isMine ? "var(--mantine-color-blue-light)" : "var(--mantine-color-default-hover)"}
                  >
                    <Text size="xs" fw={600} c="dimmed" mb={4}>
                      {isMine ? t("messages.youLabel") : `🎅 ${assignment.receiver.name}`}
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
        </Stack>
      )}
    </Stack>
  )
}

function BackLink({ groupId, groupName }: { groupId: string; groupName: string }) {
  return (
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
      {groupName}
    </Link>
  )
}
