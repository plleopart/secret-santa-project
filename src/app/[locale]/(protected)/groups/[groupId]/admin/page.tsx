import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Divider,
  ThemeIcon,
  Avatar,
} from "@mantine/core"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"
import { getGroup } from "@/actions/groups"
import { getGroupMessages } from "@/actions/admin"
import { AddMemberModal } from "@/components/groups/AddMemberModal"
import { AutoDrawSection } from "@/components/groups/AutoDrawSection"
import { ManualAssignmentEditor } from "@/components/groups/ManualAssignmentEditor"
import { InviteCodeBadge } from "@/components/groups/InviteCodeBadge"
import { DrawRestrictionsEditor } from "@/components/groups/DrawRestrictionsEditor"
import {
  IconArrowLeft,
  IconArrowRight,
  IconMail,
  IconUsers,
} from "@tabler/icons-react"

export default async function AdminPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const t = await getTranslations()

  let data: Awaited<ReturnType<typeof getGroup>>
  try {
    data = await getGroup(groupId)
  } catch {
    notFound()
  }

  const { group, isAdmin } = data!
  if (!isAdmin) notFound()

  const messages = await getGroupMessages(groupId)

  return (
    <Stack gap="xl" maw={720}>
      {/* Back to member view */}
      <Link
        href={`/groups/${groupId}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "var(--mantine-font-size-sm)",
          color: "var(--mantine-color-dimmed)",
          textDecoration: "none",
        }}
      >
        <IconArrowLeft size={14} />
        {group.name}
      </Link>

      {/* Header */}
      <Stack gap="xs">
        <Group gap="sm" align="center">
          <Title order={2}>{group.name}</Title>
          <Badge color="violet" variant="light" size="sm">
            Admin
          </Badge>
          {group.drawnAt ? (
            <Badge color="green" variant="light" size="sm">
              {t("groups.drawDone")}
            </Badge>
          ) : (
            <Badge color="orange" variant="dot" size="sm">
              {t("groups.drawPending")}
            </Badge>
          )}
        </Group>

        <InviteCodeBadge label={t("groups.inviteCode")} code={group.inviteCode} />
      </Stack>

      {/* Members */}
      <Stack gap="md">
        <Divider
          label={
            <Group gap="xs">
              <IconUsers size={13} />
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                {t("groups.membersSection")}
              </Text>
              <Badge size="xs" variant="light" color="gray">
                {group.members.length}
              </Badge>
            </Group>
          }
          labelPosition="left"
        />

        <AddMemberModal groupId={group.id} disabled={!!group.drawnAt} />

        <Stack gap="xs">
          {group.members.map((m) => (
            <Paper key={m.id} withBorder p="sm" radius="md">
              <Group gap="sm">
                <Avatar size={36} color="blue" radius="xl">
                  {m.user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Stack gap={0}>
                  <Group gap="xs" align="center">
                    <Text size="sm" fw={500}>
                      {m.user.name}
                    </Text>
                    {m.userId === group.adminId && (
                      <Badge size="xs" color="blue" variant="light">
                        Admin
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {m.user.email}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Stack>

      {/* Draw */}
      <Stack gap="md">
        <Divider
          label={
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              {t("groups.drawSection")}
            </Text>
          }
          labelPosition="left"
        />

        {group.drawMode === "automatic" ? (
          <Stack gap="md">
            <DrawRestrictionsEditor
              groupId={group.id}
              members={group.members}
              restrictions={group.drawRestrictions}
              drawnAt={group.drawnAt}
            />
            <AutoDrawSection
              groupId={group.id}
              members={group.members}
              assignments={group.assignments}
              drawnAt={group.drawnAt}
            />
          </Stack>
        ) : (
          <Stack gap="md">
            <DrawRestrictionsEditor
              groupId={group.id}
              members={group.members}
              restrictions={group.drawRestrictions}
              drawnAt={group.drawnAt}
            />
            <ManualAssignmentEditor
              groupId={group.id}
              members={group.members}
              assignments={group.assignments}
              drawnAt={group.drawnAt}
              restrictions={group.drawRestrictions}
            />
          </Stack>
        )}
      </Stack>

      {/* Assignments overview */}
      {group.assignments.length > 0 && (
        <Stack gap="sm">
          <Divider
            label={
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                {t("groups.assignmentsSection")}
              </Text>
            }
            labelPosition="left"
          />
          <Stack gap="xs">
            {group.assignments.map((a) => (
              <Paper key={a.id} withBorder p="sm" radius="md">
                <Group gap="sm">
                  <Avatar size={32} color="blue" radius="xl">
                    {a.giver.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="sm" fw={500}>
                    {a.giver.name}
                  </Text>
                  <ThemeIcon size="xs" variant="transparent" c="dimmed">
                    <IconArrowRight size={14} />
                  </ThemeIcon>
                  <Avatar size={32} color="pink" radius="xl">
                    {a.receiver.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="sm" fw={500}>
                    {a.receiver.name}
                  </Text>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Messages */}
      <Stack gap="sm">
        <Divider
          label={
            <Group gap="xs">
              <IconMail size={13} />
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                {t("messages.adminMessages")}
              </Text>
              <Badge size="xs" variant="light" color="gray">
                {messages.length}
              </Badge>
            </Group>
          }
          labelPosition="left"
        />

        {messages.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t("messages.adminNoMessages")}
          </Text>
        ) : (
          <Stack gap="xs">
            {messages.map((m) => (
              <Paper key={m.id} withBorder p="sm" radius="md">
                <Group justify="space-between" mb={4}>
                  <Group gap="xs">
                    {m.isReply && (
                      <Badge size="xs" color="violet" variant="light">
                        {t("messages.isReply")}
                      </Badge>
                    )}
                    <Text size="xs" c="dimmed">
                      {t("messages.to")}:{" "}
                      <Text span fw={600} c="inherit">
                        {m.recipient.name}
                      </Text>
                    </Text>
                  </Group>
                  <Badge size="xs" color="gray" variant="light">
                    {new Date(m.createdAt).toLocaleString("ca")}
                  </Badge>
                </Group>
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {m.body}
                </Text>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
