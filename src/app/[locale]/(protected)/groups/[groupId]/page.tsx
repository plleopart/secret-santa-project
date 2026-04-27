import {
  Stack,
  Title,
  Text,
  Badge,
  Group,
  Paper,
  ThemeIcon,
} from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { getLocale } from "next-intl/server"
import { getGroup } from "@/actions/groups"
import { notFound } from "next/navigation"
import { GroupMessagingActions } from "@/components/groups/GroupMessagingActions"
import { IconGift, IconUsers, IconCalendar, IconMail } from "@tabler/icons-react"

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const [t, locale] = await Promise.all([getTranslations(), getLocale()])

  let data: Awaited<ReturnType<typeof getGroup>>
  try {
    data = await getGroup(groupId)
  } catch {
    notFound()
  }

  const { group, myAssignment, unreadCount } = data!

  return (
    <Stack gap="xl" maw={720}>
      {/* Header */}
      <Stack gap={4}>
        <Group gap="sm" align="center">
          <Title order={2}>{group.name}</Title>
          {group.drawnAt ? (
            <Badge color="green" variant="light" size="sm">
              {t("groups.drawDone")}
            </Badge>
          ) : (
            <Badge color="orange" variant="dot" size="sm">
              {t("groups.drawPending")}
            </Badge>
          )}
        </Group>

        {/* Metadata row */}
        <Group gap="md" mt={4}>
          <Group gap={4} wrap="nowrap">
            <IconCalendar size={13} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {t("groups.createdAt")} {new Date(group.createdAt).toLocaleDateString(locale)}
            </Text>
          </Group>

          <Group gap={4} wrap="nowrap">
            <IconUsers size={13} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {t("groups.members", { count: group.members.length })}
            </Text>
          </Group>

          {unreadCount > 0 && (
            <Group gap={4} wrap="nowrap">
              <IconMail size={13} color="var(--mantine-color-red-6)" />
              <Text size="xs" c="red" fw={600}>
                {t("messages.unread", { count: unreadCount })}
              </Text>
            </Group>
          )}
        </Group>
      </Stack>

      {/* My assignment — draw done and user has assignment */}
      {myAssignment && (
        <Paper
          withBorder
          p="md"
          radius="md"
          style={{ borderColor: "var(--mantine-color-blue-3)" }}
        >
          <Group gap="sm">
            <ThemeIcon color="blue" variant="light" size="lg" radius="xl">
              <IconGift size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {t("groups.myAssignment")}
              </Text>
              <Text fw={700} size="lg">
                {myAssignment.receiver.name}
              </Text>
              <Text size="xs" c="dimmed">
                {myAssignment.receiver.email}
              </Text>
            </Stack>
          </Group>
        </Paper>
      )}

      {/* Messaging CTAs — shown once draw is done */}
      {group.drawnAt && (
        <GroupMessagingActions
          groupId={group.id}
          hasAssignment={!!myAssignment}
          receiverName={myAssignment?.receiver.name ?? ""}
        />
      )}
    </Stack>
  )
}
