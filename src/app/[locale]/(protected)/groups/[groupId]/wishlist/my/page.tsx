import { Stack, Title } from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { getWishlistData } from "@/actions/wishlist"
import { notFound } from "next/navigation"
import { WishlistPanel } from "@/components/groups/WishlistPanel"

export default async function MyWishlistPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const t = await getTranslations()

  let data: Awaited<ReturnType<typeof getWishlistData>>
  try {
    data = await getWishlistData(groupId)
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Unauthenticated" ||
        error.message === "Unauthorized" ||
        error.message === "Group not found")
    ) {
      notFound()
    }

    throw error
  }

  return (
    <Stack gap="xl" maw={720}>
      <Title order={2}>{t("nav.myWishlist")}</Title>
      <WishlistPanel
        groupId={groupId}
        myItems={data.myItems}
        recipient={data.recipient}
        recipientItems={data.recipientItems}
        mode="my"
      />
    </Stack>
  )
}
