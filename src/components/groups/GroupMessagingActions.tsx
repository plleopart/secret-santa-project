"use client"

import { Badge, Button, Paper, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core"
import { Link } from "@/i18n/navigation"
import { IconSend, IconInbox } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

interface Props {
  groupId: string
  hasAssignment: boolean
  receiverName: string
  showInboxAlways?: boolean
  unreadInbox?: number
  unreadReplies?: number
}

export function GroupMessagingActions({
  groupId,
  hasAssignment,
  receiverName,
  showInboxAlways = false,
  unreadInbox = 0,
  unreadReplies = 0,
}: Props) {
  const t = useTranslations()

  if (!hasAssignment && !showInboxAlways) return null

  const cols = hasAssignment ? { base: 1, sm: 2 } : { base: 1 }

  return (
    <SimpleGrid cols={cols} spacing="md">
      {hasAssignment && (
        <Paper withBorder p="lg" radius="md" style={{ borderColor: "var(--mantine-color-blue-3)" }}>
          <Stack gap="md" justify="space-between" h="100%">
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="blue">
                {t("groups.sendCardDirection", { name: receiverName })}
              </Text>
              <ThemeIcon color="blue" variant="light" size="xl" radius="xl">
                <IconSend size={20} />
              </ThemeIcon>
              <Text fw={600} size="md" mt={4}>
                {t("groups.sendCardTitle")}
              </Text>
              <Text size="sm" c="dimmed">
                {t("groups.sendCardSubtitle")}
              </Text>
              {unreadReplies > 0 && (
                <Badge color="red" variant="light" size="sm" w="fit-content">
                  {t("messages.unread", { count: unreadReplies })}
                </Badge>
              )}
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
              {t("groups.sendCardCta")}
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper withBorder p="lg" radius="md" style={{ borderColor: "var(--mantine-color-teal-3)" }}>
        <Stack gap="md" justify="space-between" h="100%">
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="teal">
              {t("groups.inboxCardDirection")}
            </Text>
            <ThemeIcon color="teal" variant="light" size="xl" radius="xl">
              <IconInbox size={20} />
            </ThemeIcon>
            <Text fw={600} size="md" mt={4}>
              {t("groups.inboxCardTitle")}
            </Text>
            <Text size="sm" c="dimmed">
              {t("groups.inboxCardSubtitle")}
            </Text>
            {unreadInbox > 0 && (
              <Badge color="red" variant="light" size="sm" w="fit-content">
                {t("messages.unread", { count: unreadInbox })}
              </Badge>
            )}
          </Stack>
          <Button
            component={Link}
            href={`/groups/${groupId}/messages/inbox`}
            leftSection={<IconInbox size={15} />}
            variant="light"
            color="teal"
            fullWidth
            mt="xs"
          >
            {t("groups.inboxCardCta")}
          </Button>
        </Stack>
      </Paper>
    </SimpleGrid>
  )
}
