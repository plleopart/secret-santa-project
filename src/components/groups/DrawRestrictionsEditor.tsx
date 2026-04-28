"use client"

import { useState } from "react"
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { addDrawRestriction, removeDrawRestriction } from "@/actions/draw"
import { IconAlertCircle, IconBan, IconTrash } from "@tabler/icons-react"

interface Member {
  userId: string
  user: { name: string; email: string }
}

interface Restriction {
  id: string
  giverId: string
  receiverId: string
  giver: { name: string }
  receiver: { name: string }
}

interface Props {
  groupId: string
  members: Member[]
  restrictions: Restriction[]
  drawnAt: Date | null
}

export function DrawRestrictionsEditor({
  groupId,
  members,
  restrictions,
  drawnAt,
}: Props) {
  const t = useTranslations("groups")
  const router = useRouter()

  const [giverId, setGiverId] = useState<string | null>(null)
  const [receiverId, setReceiverId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const giverOptions = members.map((member) => ({
    value: member.userId,
    label: member.user.name,
  }))

  const receiverOptions = members
    .filter((member) => member.userId !== giverId)
    .map((member) => ({
      value: member.userId,
      label: member.user.name,
    }))

  function mapErrorMessage(message: string): string {
    if (message.includes("Self-restriction")) return t("restrictionSelfError")
    if (message.includes("Invalid members")) return t("restrictionInvalidMembersError")
    if (message.includes("Unique constraint")) return t("restrictionDuplicateError")
    if (message.includes("Draw already done")) return t("drawAlreadyDone")
    if (message.includes("Unauthorized")) return t("restrictionUnauthorizedError")
    return message
  }

  async function handleAddRestriction() {
    if (!giverId || !receiverId) return

    setIsLoading(true)
    setError(null)

    try {
      await addDrawRestriction(groupId, giverId, receiverId)
      setReceiverId(null)
      router.refresh()
    } catch (e) {
      const message = e instanceof Error ? e.message : ""
      setError(mapErrorMessage(message))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemoveRestriction(restrictionId: string) {
    setIsLoading(true)
    setError(null)

    try {
      await removeDrawRestriction(groupId, restrictionId)
      router.refresh()
    } catch (e) {
      const message = e instanceof Error ? e.message : ""
      setError(mapErrorMessage(message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack gap="md">
      <Group gap="xs">
        <ThemeIcon color="orange" variant="light" size="md" radius="xl">
          <IconBan size={14} />
        </ThemeIcon>
        <Text fw={600}>{t("restrictionsTitle")}</Text>
        <Badge size="xs" variant="light" color="gray">
          {restrictions.length}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed">
        {t("restrictionsHint")}
      </Text>

      {error && (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />}>
          {error}
        </Alert>
      )}

      {drawnAt ? (
        <Alert color="orange" variant="light">
          {t("drawAlreadyDone")}
        </Alert>
      ) : (
        <Paper withBorder p="sm" radius="md">
          <Stack gap="sm">
            <Select
              label={t("restrictionGiver")}
              placeholder={t("restrictionGiverPlaceholder")}
              data={giverOptions}
              value={giverId}
              onChange={(value) => {
                setGiverId(value)
                setReceiverId(null)
              }}
              disabled={isLoading}
            />

            <Select
              label={t("restrictionReceiver")}
              placeholder={t("restrictionReceiverPlaceholder")}
              data={receiverOptions}
              value={receiverId}
              onChange={setReceiverId}
              disabled={isLoading || !giverId}
            />

            <Button
              onClick={handleAddRestriction}
              disabled={!giverId || !receiverId}
              loading={isLoading}
              variant="light"
              color="orange"
            >
              {t("addRestriction")}
            </Button>
          </Stack>
        </Paper>
      )}

      {restrictions.length > 0 && (
        <Stack gap="xs">
          {restrictions.map((restriction) => (
            <Paper key={restriction.id} withBorder p="sm" radius="md">
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm">
                  <Text span fw={600}>
                    {restriction.giver.name}
                  </Text>{" "}
                  {t("restrictionArrow")}{" "}
                  <Text span fw={600}>
                    {restriction.receiver.name}
                  </Text>
                </Text>

                {!drawnAt && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleRemoveRestriction(restriction.id)}
                    disabled={isLoading}
                    title={t("removeRestriction")}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
