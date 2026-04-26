import { Stack, Title, Text } from "@mantine/core"
import { useTranslations } from "next-intl"

export default function DashboardPage() {
  const t = useTranslations("dashboard")

  return (
    <Stack p="xl">
      <Title order={1}>{t("title")}</Title>
      <Text c="dimmed">{t("noGroups")}</Text>
    </Stack>
  )
}
