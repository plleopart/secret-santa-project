"use client"

import { useMemo, useState, useTransition } from "react"
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from "@mantine/core"
import {
  addWishlistItem,
  deleteWishlistItem,
  moveWishlistItem,
  updateWishlistItem,
} from "@/actions/wishlist"
import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconGift,
  IconLink,
  IconTrash,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

interface WishlistItemView {
  id: string
  name: string
  description: string | null
  url: string | null
  priority: number
}

interface RecipientView {
  id: string
  name: string
}

interface Props {
  groupId: string
  myItems: WishlistItemView[]
  recipient: RecipientView | null
  recipientItems: WishlistItemView[]
  mode: "my" | "recipient"
}

function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "genericError"

  switch (error.message) {
    case "Invalid URL":
      return "invalidUrl"
    case "Wishlist item name is required":
      return "nameRequired"
    case "Wishlist item name is too long":
      return "nameTooLong"
    case "Wishlist item description is too long":
      return "descriptionTooLong"
    default:
      return "genericError"
  }
}

export function WishlistPanel({
  groupId,
  myItems,
  recipient,
  recipientItems,
  mode,
}: Props) {
  const t = useTranslations("wishlist")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editUrl, setEditUrl] = useState("")

  const [errorKey, setErrorKey] = useState<string | null>(null)

  const orderedMyItems = useMemo(
    () => [...myItems].sort((a, b) => a.priority - b.priority),
    [myItems]
  )

  const orderedRecipientItems = useMemo(
    () => [...recipientItems].sort((a, b) => a.priority - b.priority),
    [recipientItems]
  )

  function runAction(callback: () => Promise<void>) {
    setErrorKey(null)
    startTransition(async () => {
      try {
        await callback()
        router.refresh()
      } catch (error) {
        setErrorKey(getErrorMessage(error))
      }
    })
  }

  function handleAddItem() {
    runAction(async () => {
      await addWishlistItem(groupId, {
        name,
        description,
        url,
      })
      setName("")
      setDescription("")
      setUrl("")
    })
  }

  function startEdit(item: WishlistItemView) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditDescription(item.description ?? "")
    setEditUrl(item.url ?? "")
    setErrorKey(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName("")
    setEditDescription("")
    setEditUrl("")
  }

  return (
    <Stack gap="xl">
      {mode === "my" && (
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" radius="xl" size="md">
              <IconGift size={16} />
            </ThemeIcon>
            <Text fw={600}>{t("myList")}</Text>
          </Group>
          <Badge variant="light" color="gray" size="sm">
            {t("count", { count: myItems.length })}
          </Badge>
        </Group>

        {errorKey && (
          <Alert color="red" variant="light">
            {t(errorKey)}
          </Alert>
        )}

        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <TextInput
              label={t("name")}
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              disabled={isPending}
            />
            <Textarea
              label={t("description")}
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              autosize
              minRows={2}
              disabled={isPending}
            />
            <TextInput
              label={t("url")}
              placeholder={t("urlPlaceholder")}
              value={url}
              onChange={(event) => setUrl(event.currentTarget.value)}
              disabled={isPending}
            />
            <Button
              onClick={handleAddItem}
              disabled={!name.trim()}
              loading={isPending}
            >
              {t("add")}
            </Button>
          </Stack>
        </Paper>

        {orderedMyItems.length === 0 ? (
          <Paper withBorder p="xl" radius="md" style={{ borderStyle: "dashed" }}>
            <Text size="sm" c="dimmed" ta="center">
              {t("emptyOwn")}
            </Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {orderedMyItems.map((item, index) => {
              const isFirst = index === 0
              const isLast = index === orderedMyItems.length - 1
              const isEditing = editingId === item.id

              return (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap="xs">
                    {isEditing ? (
                      <>
                        <TextInput
                          label={t("name")}
                          value={editName}
                          onChange={(event) => setEditName(event.currentTarget.value)}
                          disabled={isPending}
                        />
                        <Textarea
                          label={t("description")}
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.currentTarget.value)
                          }
                          autosize
                          minRows={2}
                          disabled={isPending}
                        />
                        <TextInput
                          label={t("url")}
                          value={editUrl}
                          onChange={(event) => setEditUrl(event.currentTarget.value)}
                          disabled={isPending}
                        />
                        <Group justify="flex-end" gap="xs">
                          <Button
                            variant="subtle"
                            color="gray"
                            onClick={cancelEdit}
                            disabled={isPending}
                          >
                            {t("cancel")}
                          </Button>
                          <Button
                            onClick={() =>
                              runAction(async () => {
                                await updateWishlistItem(item.id, {
                                  name: editName,
                                  description: editDescription,
                                  url: editUrl,
                                })
                                cancelEdit()
                              })
                            }
                            loading={isPending}
                            disabled={!editName.trim()}
                          >
                            {t("save")}
                          </Button>
                        </Group>
                      </>
                    ) : (
                      <>
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Stack gap={2} style={{ minWidth: 0 }}>
                            <Text fw={600}>{item.name}</Text>
                            {item.description && (
                              <Text size="sm" c="dimmed">
                                {item.description}
                              </Text>
                            )}
                            {item.url && (
                              <Group gap={4}>
                                <IconLink size={14} color="var(--mantine-color-dimmed)" />
                                <Anchor href={item.url} target="_blank" rel="noreferrer" size="sm">
                                  {item.url}
                                </Anchor>
                              </Group>
                            )}
                          </Stack>

                          <Badge variant="light" color="blue">
                            {t("priority", { value: item.priority })}
                          </Badge>
                        </Group>

                        <Group justify="flex-end" gap={4}>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            disabled={isPending || isFirst}
                            onClick={() => runAction(() => moveWishlistItem(item.id, "up"))}
                            title={t("moveUp")}
                          >
                            <IconChevronUp size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            disabled={isPending || isLast}
                            onClick={() => runAction(() => moveWishlistItem(item.id, "down"))}
                            title={t("moveDown")}
                          >
                            <IconChevronDown size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            disabled={isPending}
                            onClick={() => startEdit(item)}
                            title={t("edit")}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            disabled={isPending}
                            onClick={() => runAction(() => deleteWishlistItem(item.id))}
                            title={t("delete")}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        )}
      </Stack>
      )}

      {mode === "recipient" && (
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={600}>{t("recipientListTitle")}</Text>
          {recipient && (
            <Badge variant="light" color="teal" size="sm">
              {recipient.name}
            </Badge>
          )}
        </Group>

        {!recipient ? (
          <Paper withBorder p="xl" radius="md" style={{ borderStyle: "dashed" }}>
            <Text size="sm" c="dimmed" ta="center">
              {t("recipientPending")}
            </Text>
          </Paper>
        ) : orderedRecipientItems.length === 0 ? (
          <Paper withBorder p="xl" radius="md" style={{ borderStyle: "dashed" }}>
            <Text size="sm" c="dimmed" ta="center">
              {t("emptyRecipient", { name: recipient.name })}
            </Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {orderedRecipientItems.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="md">
                <Stack gap={2}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text fw={600}>{item.name}</Text>
                      {item.description && (
                        <Text size="sm" c="dimmed">
                          {item.description}
                        </Text>
                      )}
                      {item.url && (
                        <Group gap={4}>
                          <IconLink size={14} color="var(--mantine-color-dimmed)" />
                          <Anchor
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            size="sm"
                          >
                            {item.url}
                          </Anchor>
                        </Group>
                      )}
                    </Stack>
                    <Badge variant="light" color="teal">
                      {t("priority", { value: item.priority })}
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
      )}
    </Stack>
  )
}
