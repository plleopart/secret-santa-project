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
import { Link } from "@/i18n/navigation"
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
        </Group>
      </Stack>

      {/* Messages status card — always visible */}
      <Link href={`/groups/${group.id}/messages`} style={{ textDecoration: "none" }}>
        <Paper
          withBorder
          p="md"
          radius="md"
          style={{
            borderColor: unreadCount > 0
              ? "var(--mantine-color-red-3)"
              : "var(--mantine-color-default-border)",
            cursor: "pointer",
          }}
        >
          <Group gap="sm">
            <ThemeIcon
              color={unreadCount > 0 ? "red" : "gray"}
              variant="light"
              size="lg"
              radius="xl"
            >
              <IconMail size={18} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {t("nav.messages")}
              </Text>
              <Text fw={600} size="sm" c={unreadCount > 0 ? "red" : "dimmed"}>
                {unreadCount > 0
                  ? t("messages.unread", { count: unreadCount })
                  : t("groups.noNewMessages")}
              </Text>
            </Stack>
          </Group>
        </Paper>
      </Link>

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
    </Stack>
  )
}
