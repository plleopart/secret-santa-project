import { Stack, Title } from "@mantine/core"
import { useTranslations } from "next-intl"

export default function MessagesPage() {
  const t = useTranslations("messages")

  return (
    <Stack p="xl">
      <Title order={2}>{t("inbox")}</Title>
    </Stack>
  )
}
