import { redirect } from "next/navigation"

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  redirect(`/groups/${groupId}/wishlist/my`)
}
