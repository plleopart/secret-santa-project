"use client"

import { Button, Group } from "@mantine/core"
import { Link } from "@/i18n/navigation"
import { IconSend, IconMail } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

interface Props {
  groupId: string
  hasAssignment: boolean
}

export function GroupMessagingActions({ groupId, hasAssignment }: Props) {
  const t = useTranslations("groups")

  if (!hasAssignment) return null

  return (
    <Group gap="sm">
      <Button
        component={Link}
        href={`/groups/${groupId}/send`}
        leftSection={<IconSend size={15} />}
        variant="light"
      >
        {t("sendMessage")}
      </Button>
      <Button
        component={Link}
        href={`/groups/${groupId}/messages`}
        leftSection={<IconMail size={15} />}
        variant="subtle"
        color="gray"
      >
        {t("myMessages")}
      </Button>
    </Group>
  )
}
