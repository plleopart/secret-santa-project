"use client"

import { Group, Text, ActionIcon, Tooltip } from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { IconCopy, IconCheck } from "@tabler/icons-react"

interface Props {
  label: string
  code: string
}

export function InviteCodeBadge({ label, code }: Props) {
  const clipboard = useClipboard({ timeout: 2000 })

  return (
    <Group gap="xs" align="center">
      <Text size="sm" c="dimmed">
        {label}:
      </Text>
      <Text size="sm" ff="monospace" fw={700} style={{ letterSpacing: 4 }}>
        {code}
      </Text>
      <Tooltip label={clipboard.copied ? "Copiat!" : "Copia el codi"} withArrow>
        <ActionIcon
          color={clipboard.copied ? "teal" : "gray"}
          variant="subtle"
          onClick={() => clipboard.copy(code)}
          size="sm"
        >
          {clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}
