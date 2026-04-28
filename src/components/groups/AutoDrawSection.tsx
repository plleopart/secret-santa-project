"use client"

import {
  Stack,
  Button,
  Text,
  Alert,
  Modal,
  Group,
  ThemeIcon,
  Paper,
  Avatar,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { performDraw } from "@/actions/draw"
import {
  IconGift,
  IconAlertCircle,
  IconArrowRight,
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

export function AutoDrawSection({
  groupId,
  members,
  assignments,
  drawnAt,
}: Props) {
  const t = useTranslations("groups")
  const router = useRouter()
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
    useDisclosure()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDraw = async () => {
    setLoading(true)
    setError(null)
    try {
      await performDraw(groupId)
      closeConfirm()
      router.refresh()
    } catch (e) {
      closeConfirm()
      const msg = e instanceof Error ? e.message : ""
      if (msg === "Not enough members") setError(t("notEnoughMembers"))
      else if (msg === "No valid assignments with restrictions")
        setError(t("restrictionNoSolutionError"))
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Already drawn — show assignments
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

  // Not drawn yet
  return (
    <Stack gap="md">
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

      <Button
        leftSection={<IconGift size={16} />}
        onClick={openConfirm}
        disabled={members.length < 2}
        color="blue"
      >
        {t("performDraw")}
      </Button>

      <Modal
        opened={confirmOpened}
        onClose={closeConfirm}
        title={t("confirmDraw")}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">{t("confirmDrawText")}</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={closeConfirm} disabled={loading}>
              Cancel·la
            </Button>
            <Button onClick={handleDraw} loading={loading} color="blue">
              {t("performDraw")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
