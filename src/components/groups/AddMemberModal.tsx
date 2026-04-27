"use client"

import { Modal, TextInput, Button, Stack, Alert } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { addMember } from "@/actions/groups"
import { IconUserPlus, IconAlertCircle } from "@tabler/icons-react"

interface Props {
  groupId: string
  disabled?: boolean
}

export function AddMemberModal({ groupId, disabled }: Props) {
  const t = useTranslations("groups")
  const router = useRouter()
  const [opened, { open, close }] = useDisclosure()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError(null)
    try {
      await addMember(groupId, { name, email })
      close()
      setName("")
      setEmail("")
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ""
      setError(msg === "Already a member" ? t("errorAlreadyMember") : msg)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    close()
    setError(null)
    setName("")
    setEmail("")
  }

  return (
    <>
      <Button
        leftSection={<IconUserPlus size={16} />}
        onClick={open}
        disabled={disabled}
        variant="light"
      >
        {t("addMember")}
      </Button>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={t("addMember")}
        centered
      >
        <Stack gap="md">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              {error}
            </Alert>
          )}
          <TextInput
            label={t("memberName")}
            placeholder={t("memberNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            data-autofocus
          />
          <TextInput
            label={t("memberEmail")}
            placeholder={t("memberEmailPlaceholder")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!name.trim() || !email.trim()}
            fullWidth
          >
            {t("addMember")}
          </Button>
        </Stack>
      </Modal>
    </>
  )
}
