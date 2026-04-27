import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  ThemeIcon,
} from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { listAdminGroups } from "@/actions/groups"
import { IconShield, IconUsers, IconChevronRight } from "@tabler/icons-react"

export default async function AdminDashboardPage() {
  const t = await getTranslations()
  const groups = await listAdminGroups()

  return (
    <Stack gap="xl" maw={720}>
      <Title order={2}>{t("nav.adminSection")}</Title>

      {groups.length === 0 ? (
        <Paper withBorder p="xl" radius="md" style={{ borderStyle: "dashed" }}>
          <Stack align="center" gap="xs">
            <ThemeIcon size="xl" variant="light" color="gray" radius="xl">
              <IconShield size={24} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" ta="center">
              {t("adminPage.noGroups")}
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="sm">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}/admin`}
              style={{ textDecoration: "none" }}
            >
              <Paper
                withBorder
                p="md"
                radius="md"
                style={{ cursor: "pointer" }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={4}>
                    <Group gap="sm" align="center">
                      <Text fw={600} size="sm">
                        {group.name}
                      </Text>
                      {group.drawnAt ? (
                        <Badge color="green" variant="light" size="xs">
                          {t("groups.drawDone")}
                        </Badge>
                      ) : (
                        <Badge color="orange" variant="dot" size="xs">
                          {t("groups.drawPending")}
                        </Badge>
                      )}
                    </Group>
                    <Group gap={4}>
                      <IconUsers size={13} color="var(--mantine-color-dimmed)" />
                      <Text size="xs" c="dimmed">
                        {t("groups.members", { count: group.members.length })}
                      </Text>
                    </Group>
                  </Stack>
                  <IconChevronRight size={16} color="var(--mantine-color-dimmed)" />
                </Group>
              </Paper>
            </Link>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
