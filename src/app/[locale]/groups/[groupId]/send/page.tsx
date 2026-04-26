import { Stack, Title } from "@mantine/core"
import { useTranslations } from "next-intl"

export default function SendMessagePage() {
  const t = useTranslations("messages")

  return (
    <Stack p="xl">
      <Title order={2}>{t("send")}</Title>
    </Stack>
  )
}
