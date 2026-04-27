import { Stack, Title, Text, Paper, ThemeIcon } from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { getGroup } from "@/actions/groups"
import { notFound } from "next/navigation"
import { IconGift } from "@tabler/icons-react"

export default async function WishlistPage({
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

  return (
    <Stack gap="xl" maw={720}>
      <Title order={2}>{t("nav.wishlist")}</Title>

      <Paper withBorder p="xl" radius="md" style={{ borderStyle: "dashed" }}>
        <Stack align="center" gap="xs">
          <ThemeIcon size="xl" variant="light" color="gray" radius="xl">
            <IconGift size={24} />
          </ThemeIcon>
          <Text size="sm" c="dimmed" ta="center">
            {t("groups.wishlistEmpty")}
          </Text>
        </Stack>
      </Paper>
    </Stack>
  )
}
