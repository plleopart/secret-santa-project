import {
  Stack,
  Title,
  Text,
  Badge,
  Group,
  Paper,
  Avatar,
  Divider,
  ThemeIcon,
} from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getGroup } from "@/actions/groups"
import { notFound } from "next/navigation"
import { GroupMessagingActions } from "@/components/groups/GroupMessagingActions"
import { IconArrowLeft, IconGift } from "@tabler/icons-react"

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const t = await getTranslations()

  let data: Awaited<ReturnType<typeof getGroup>>
  try {
    data = await getGroup(groupId)
  } catch {
    notFound()
  }

  const { group, myAssignment } = data!

  return (
    <Stack gap="xl" maw={720}>
      {/* Back link */}
      <Link
        href="/dashboard"
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
        {t("groups.backToDashboard")}
      </Link>

      {/* Header */}
      <Stack gap="xs">
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
        />
      )}

      {/* Members section */}
      <Stack gap="md">
        <Divider
          label={
            <Group gap="xs">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                {t("groups.membersSection")}
              </Text>
              <Badge size="xs" variant="light" color="gray">
                {group.members.length}
              </Badge>
            </Group>
          }
          labelPosition="left"
        />

        <Stack gap="xs">
          {group.members.map((m) => (
            <Paper key={m.id} withBorder p="sm" radius="md">
              <Group gap="sm">
                <Avatar size={36} color="blue" radius="xl">
                  {m.user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Stack gap={0}>
                  <Group gap="xs" align="center">
                    <Text size="sm" fw={500}>
                      {m.user.name}
                    </Text>
                    {m.userId === group.adminId && (
                      <Badge size="xs" color="blue" variant="light">
                        Admin
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {m.user.email}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}
