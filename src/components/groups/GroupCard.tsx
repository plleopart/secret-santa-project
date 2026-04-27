import { Card, Text, Badge, Group, Stack } from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { IconUsers, IconMail } from "@tabler/icons-react"

interface Props {
  id: string
  name: string
  drawnAt: Date | null
  memberCount: number
  isAdmin: boolean
  unreadCount?: number
}

export async function GroupCard({
  id,
  name,
  drawnAt,
  memberCount,
  isAdmin,
  unreadCount = 0,
}: Props) {
  const t = await getTranslations()

  return (
    <Card
      radius="md"
      p="lg"
      style={{
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        cursor: "pointer",
      }}
    >
      <Stack gap="sm">
        {/* Header row: name + badges */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text fw={600} size="md" style={{ lineHeight: 1.3 }} lineClamp={2}>
            {name}
          </Text>
          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            {isAdmin && (
              <Badge color="blue" variant="light" size="sm">
                Admin
              </Badge>
            )}
            {drawnAt ? (
              <Badge color="green" variant="light" size="sm">
                {t("groups.drawDone")}
              </Badge>
            ) : (
              <Badge color="orange" variant="dot" size="sm">
                {t("groups.drawPending")}
              </Badge>
            )}
          </Group>
        </Group>

        {/* Stats row */}
        <Group gap="md">
          <Group gap={4}>
            <IconUsers size={13} style={{ opacity: 0.5 }} />
            <Text size="xs" c="dimmed">
              {t("groups.members", { count: memberCount })}
            </Text>
          </Group>
          {unreadCount > 0 && (
            <Group gap={4}>
              <IconMail size={13} style={{ color: "var(--mantine-color-red-6)" }} />
              <Text size="xs" c="red">
                {t("messages.unread", { count: unreadCount })}
              </Text>
            </Group>
          )}
        </Group>

        {/* CTA */}
        <Link
          href={`/groups/${id}`}
          style={{
            display: "block",
            padding: "6px 12px",
            borderRadius: "var(--mantine-radius-md)",
            background: "var(--mantine-color-blue-light)",
            color: "var(--mantine-color-blue-light-color)",
            fontSize: "var(--mantine-font-size-sm)",
            fontWeight: 500,
            textDecoration: "none",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          {t("groups.viewGroup")}
        </Link>
      </Stack>
    </Card>
  )
}
