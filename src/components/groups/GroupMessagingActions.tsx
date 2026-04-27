"use client"

import { Button, Paper, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core"
import { Link } from "@/i18n/navigation"
import { IconSend, IconInbox } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

interface Props {
  groupId: string
  hasAssignment: boolean
  receiverName: string
}

export function GroupMessagingActions({ groupId, hasAssignment, receiverName }: Props) {
  const t = useTranslations("groups")

  if (!hasAssignment) return null

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      <Paper withBorder p="lg" radius="md" style={{ borderColor: "var(--mantine-color-blue-3)" }}>
        <Stack gap="md" justify="space-between" h="100%">
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="blue">
              {t("sendCardDirection", { name: receiverName })}
            </Text>
            <ThemeIcon color="blue" variant="light" size="xl" radius="xl">
              <IconSend size={20} />
            </ThemeIcon>
            <Text fw={600} size="md" mt={4}>
              {t("sendCardTitle")}
            </Text>
            <Text size="sm" c="dimmed">
              {t("sendCardSubtitle")}
            </Text>
          </Stack>
          <Button
            component={Link}
            href={`/groups/${groupId}/send`}
            leftSection={<IconSend size={15} />}
            variant="light"
            color="blue"
            fullWidth
            mt="xs"
          >
            {t("sendCardCta")}
          </Button>
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="md" style={{ borderColor: "var(--mantine-color-teal-3)" }}>
        <Stack gap="md" justify="space-between" h="100%">
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="teal">
              {t("inboxCardDirection")}
            </Text>
            <ThemeIcon color="teal" variant="light" size="xl" radius="xl">
              <IconInbox size={20} />
            </ThemeIcon>
            <Text fw={600} size="md" mt={4}>
              {t("inboxCardTitle")}
            </Text>
            <Text size="sm" c="dimmed">
              {t("inboxCardSubtitle")}
            </Text>
          </Stack>
          <Button
            component={Link}
            href={`/groups/${groupId}/messages`}
            leftSection={<IconInbox size={15} />}
            variant="light"
            color="teal"
            fullWidth
            mt="xs"
          >
            {t("inboxCardCta")}
          </Button>
        </Stack>
      </Paper>
    </SimpleGrid>
  )
}
