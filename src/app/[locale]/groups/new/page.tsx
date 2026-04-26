import { Stack, Title } from "@mantine/core"
import { useTranslations } from "next-intl"

export default function NewGroupPage() {
  const t = useTranslations("groups")

  return (
    <Stack p="xl">
      <Title order={2}>{t("create")}</Title>
    </Stack>
  )
}
