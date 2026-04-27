import { Stack, Title, Text, SimpleGrid, Center } from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { listMyGroups } from "@/actions/groups"
import { GroupCard } from "@/components/groups/GroupCard"
import { DashboardActions } from "@/components/groups/DashboardActions"
import { IconGift } from "@tabler/icons-react"

export default async function DashboardPage() {
  const t = await getTranslations()
  const groups = await listMyGroups()

  return (
    <Stack gap="xl" maw={960}>
      <Stack gap="md">
        <Title order={2}>{t("dashboard.title")}</Title>
        <DashboardActions />
      </Stack>

      {groups.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <IconGift size={48} style={{ opacity: 0.25 }} />
            <Text c="dimmed" ta="center">
              {t("dashboard.noGroups")}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {t("dashboard.noGroupsHint")}
            </Text>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              drawnAt={group.drawnAt}
              memberCount={group.members.length}
              isAdmin={group.isAdmin}
              unreadCount={group.unreadCount}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}
