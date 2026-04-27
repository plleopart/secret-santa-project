"use client"

import {
  Stack,
  Select,
  Button,
  Alert,
  Group,
  Avatar,
  Text,
  Paper,
  ThemeIcon,
} from "@mantine/core"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { setManualAssignments } from "@/actions/draw"
import {
  IconAlertCircle,
  IconArrowRight,
  IconGift,
  IconDeviceFloppy,
  IconConfetti,
} from "@tabler/icons-react"

interface Member {
  userId: string
  user: { name: string; email: string }
}

interface Assignment {
  giverId: string
  receiverId: string
  giver: { name: string; email: string }
  receiver: { name: string; email: string }
}

interface Props {
  groupId: string
  members: Member[]
  assignments: Assignment[]
  drawnAt: Date | null
}

export function ManualAssignmentEditor({
  groupId,
  members,
  assignments,
  drawnAt,
}: Props) {
  const t = useTranslations("groups")
  const router = useRouter()

  const [pairs, setPairs] = useState<Record<string, string | null>>(
    Object.fromEntries(members.map((m) => [m.userId, null]))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usedReceivers = new Set(Object.values(pairs).filter(Boolean))

  const getOptions = (currentGiverId: string) =>
    members
      .filter((m) => m.userId !== currentGiverId)
      .map((m) => ({
        value: m.userId,
        label: m.user.name,
        disabled:
          usedReceivers.has(m.userId) && pairs[currentGiverId] !== m.userId,
      }))

  const allAssigned = members.every((m) => pairs[m.userId] !== null)

  const handleSave = async () => {
    if (!allAssigned) return
    setLoading(true)
    setError(null)
    try {
      const result = members.map((m) => ({
        giverId: m.userId,
        receiverId: pairs[m.userId]!,
      }))
      await setManualAssignments(groupId, result)
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ""
      if (msg.includes("Self-assignment")) setError(t("errorSelfAssignment"))
      else if (msg.includes("Incomplete")) setError(t("errorIncompleteAssignments"))
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Already drawn — show assignments read-only
  if (drawnAt) {
    return (
      <Stack gap="md">
        <Group gap="xs">
          <ThemeIcon color="green" variant="light" size="md" radius="xl">
            <IconConfetti size={14} />
          </ThemeIcon>
          <Text fw={600} c="green">
            {t("drawDone")}
          </Text>
        </Group>

        <Stack gap="xs">
          {assignments.map((a) => (
            <Paper key={a.giverId} withBorder p="sm" radius="md">
              <Group gap="sm">
                <Avatar size={32} color="blue" radius="xl">
                  {a.giver.name.charAt(0).toUpperCase()}
                </Avatar>
                <Text size="sm" fw={500} style={{ flex: 1 }}>
                  {a.giver.name}
                </Text>
                <IconArrowRight size={14} style={{ opacity: 0.4 }} />
                <Avatar size={32} color="red" radius="xl">
                  {a.receiver.name.charAt(0).toUpperCase()}
                </Avatar>
                <Text size="sm" fw={500} style={{ flex: 1 }}>
                  {a.receiver.name}
                </Text>
                <ThemeIcon color="gray" variant="transparent" size="sm">
                  <IconGift size={14} />
                </ThemeIcon>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Stack>
    )
  }

  // Not drawn — show editor
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {t("manualAssignmentsHint")}
      </Text>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}

      {members.length < 2 && (
        <Alert color="orange" variant="light">
          {t("notEnoughMembers")}
        </Alert>
      )}

      <Stack gap="xs">
        {members.map((m) => (
          <Paper key={m.userId} withBorder p="sm" radius="md">
            <Group gap="sm" wrap="nowrap">
              <Avatar size={32} color="blue" radius="xl">
                {m.user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Text size="sm" fw={500} style={{ minWidth: 120 }} truncate>
                {m.user.name}
              </Text>
              <IconArrowRight size={14} style={{ opacity: 0.4, flexShrink: 0 }} />
              <Select
                placeholder={t("selectRecipient")}
                value={pairs[m.userId]}
                onChange={(val) =>
                  setPairs((prev) => ({ ...prev, [m.userId]: val }))
                }
                data={getOptions(m.userId)}
                style={{ flex: 1 }}
                size="sm"
              />
            </Group>
          </Paper>
        ))}
      </Stack>

      <Button
        leftSection={<IconDeviceFloppy size={16} />}
        onClick={handleSave}
        loading={loading}
        disabled={!allAssigned || members.length < 2}
      >
        {t("saveAssignments")}
      </Button>
    </Stack>
  )
}
