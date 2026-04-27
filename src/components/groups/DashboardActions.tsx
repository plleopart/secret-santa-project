"use client"

import {
  Group,
  Button,
  Modal,
  TextInput,
  Select,
  Stack,
  Alert,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createGroup, joinGroup } from "@/actions/groups"
import { IconPlus, IconUsers, IconAlertCircle } from "@tabler/icons-react"

export function DashboardActions() {
  const t = useTranslations()
  const router = useRouter()

  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure()
  const [joinOpened, { open: openJoin, close: closeJoin }] = useDisclosure()

  const [createName, setCreateName] = useState("")
  const [drawMode, setDrawMode] = useState<string | null>("automatic")
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!createName.trim() || !drawMode) return
    setLoading(true)
    setError(null)
    try {
      await createGroup({
        name: createName,
        drawMode: drawMode as "manual" | "automatic",
      })
      closeCreate()
      setCreateName("")
      setDrawMode("automatic")
      router.refresh()
    } catch {
      setError(t("errors.unauthorized"))
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setLoading(true)
    setError(null)
    try {
      await joinGroup(joinCode)
      closeJoin()
      setJoinCode("")
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ""
      if (msg === "Group not found") setError(t("groups.errorInvalidCode"))
      else if (msg === "Already a member") setError(t("groups.errorAlreadyMember"))
      else setError(t("errors.unauthorized"))
    } finally {
      setLoading(false)
    }
  }

  const handleCloseCreate = () => {
    closeCreate()
    setError(null)
    setCreateName("")
    setDrawMode("automatic")
  }

  const handleCloseJoin = () => {
    closeJoin()
    setError(null)
    setJoinCode("")
  }

  return (
    <>
      <Group gap="sm">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreate}
        >
          {t("groups.createGroup")}
        </Button>
        <Button
          variant="outline"
          leftSection={<IconUsers size={16} />}
          onClick={openJoin}
        >
          {t("groups.joinGroup")}
        </Button>
      </Group>

      {/* Create group modal */}
      <Modal
        opened={createOpened}
        onClose={handleCloseCreate}
        title={t("groups.createGroup")}
        centered
      >
        <Stack gap="md">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}
          <TextInput
            label={t("groups.name")}
            placeholder={t("groups.namePlaceholder")}
            value={createName}
            onChange={(e) => setCreateName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            data-autofocus
          />
          <Select
            label={t("groups.drawMode")}
            placeholder={t("groups.drawModePlaceholder")}
            value={drawMode}
            onChange={setDrawMode}
            data={[
              { value: "automatic", label: t("groups.drawModeAutomatic") },
              { value: "manual", label: t("groups.drawModeManual") },
            ]}
          />
          <Button
            onClick={handleCreate}
            loading={loading}
            disabled={!createName.trim() || !drawMode}
            fullWidth
          >
            {t("groups.createGroup")}
          </Button>
        </Stack>
      </Modal>

      {/* Join group modal */}
      <Modal
        opened={joinOpened}
        onClose={handleCloseJoin}
        title={t("groups.joinGroup")}
        centered
      >
        <Stack gap="md">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}
          <TextInput
            label={t("groups.inviteCode")}
            placeholder={t("groups.inviteCodePlaceholder")}
            value={joinCode}
            onChange={(e) =>
              setJoinCode(e.currentTarget.value.toUpperCase())
            }
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            maxLength={6}
            styles={{ input: { textTransform: "uppercase", letterSpacing: 4 } }}
            data-autofocus
          />
          <Button
            onClick={handleJoin}
            loading={loading}
            disabled={joinCode.trim().length < 6}
            fullWidth
          >
            {t("groups.joinGroup")}
          </Button>
        </Stack>
      </Modal>
    </>
  )
}
