"use client"

import { useState, useTransition } from "react"
import { Textarea, Button, Stack, Alert } from "@mantine/core"
import { sendMessage } from "@/actions/messages"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

interface Props {
  groupId: string
}

export function AnonymousMessageForm({ groupId }: Props) {
  const t = useTranslations("messages")
  const router = useRouter()
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!body.trim()) return
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      try {
        await sendMessage(groupId, body)
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
          {t("sendSuccess")}
        </Alert>
      )}
      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}
      <Textarea
        placeholder={t("placeholder")}
        value={body}
        onChange={(e) => setBody(e.currentTarget.value)}
        minRows={4}
        autosize
        disabled={isPending}
      />
      <Button
        onClick={handleSubmit}
        loading={isPending}
        disabled={!body.trim()}
      >
        {t("sendButton")}
      </Button>
    </Stack>
  )
}
