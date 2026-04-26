import { Stack, Title } from "@mantine/core"

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  return (
    <Stack p="xl">
      <Title order={2}>{groupId}</Title>
    </Stack>
  )
}
