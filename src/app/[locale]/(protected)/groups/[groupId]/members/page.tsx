import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Avatar,
  Badge,
  Divider,
} from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { getGroup } from "@/actions/groups"
import { notFound } from "next/navigation"
import { IconUsers } from "@tabler/icons-react"

export default async function MembersPage({
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

  const { group } = data!

  return (
    <Stack gap="xl" maw={720}>
      <Title order={2}>{t("nav.members")}</Title>

      <Stack gap="md">
        <Divider
          label={
            <Group gap="xs">
              <IconUsers size={13} />
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
