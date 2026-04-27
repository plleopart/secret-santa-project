"use client"

import { useState, useTransition } from "react"
import { Textarea, Button, Stack, Alert, Text, Group } from "@mantine/core"
import { sendReply } from "@/actions/messages"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { IconArrowBackUp } from "@tabler/icons-react"

interface Props {
  groupId: string
  remaining: number
}

export function ReplyForm({ groupId, remaining }: Props) {
  const t = useTranslations("messages")
  const router = useRouter()
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const canReply = remaining > 0

  function handleSubmit() {
    if (!body.trim() || !canReply) return
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      try {
        await sendReply(groupId, body)
        setBody("")
        setSuccess(true)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error")
      }
    })
  }

  return (
    <Stack gap="sm">
      {success && (
        <Alert color="green" variant="light">
          {t("replySuccess")}
        </Alert>
      )}
      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}

      <Textarea
        placeholder={t("replyPlaceholder")}
        value={body}
        onChange={(e) => setBody(e.currentTarget.value)}
        minRows={3}
        autosize
        disabled={isPending || !canReply}
      />

      <Group justify="space-between" align="center">
        <Text size="xs" c={remaining <= 1 ? "orange" : "dimmed"}>
          {canReply
            ? t("replyCredits", { count: remaining })
            : t("noReplyCredits")}
        </Text>
        <Button
          leftSection={<IconArrowBackUp size={15} />}
          onClick={handleSubmit}
          loading={isPending}
          disabled={!body.trim() || !canReply}
          size="sm"
        >
          {t("reply")}
        </Button>
      </Group>
    </Stack>
  )
}
