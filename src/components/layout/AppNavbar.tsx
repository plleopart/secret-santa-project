"use client"

import {
  Stack,
  Text,
  Avatar,
  Group,
  ActionIcon,
  Divider,
  NavLink,
  Button,
  Box,
  Badge,
} from "@mantine/core"
import { useMantineColorScheme } from "@mantine/core"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { logout } from "@/actions/auth"
import {
  IconHome,
  IconSun,
  IconMoon,
  IconLogout,
  IconShield,
  IconInfoCircle,
  IconMail,
  IconUsers,
  IconSettings,
} from "@tabler/icons-react"

interface NavGroup {
  id: string
  name: string
  isAdmin: boolean
  unreadCount: number
}

interface Props {
  userName: string
  userEmail: string
  navGroups: NavGroup[]
}

export function AppNavbar({ userName, userEmail, navGroups }: Props) {
  const t = useTranslations()
  const pathname = usePathname()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const initial = userName.charAt(0).toUpperCase() || "?"

  const groupMatch = pathname.match(/^\/groups\/([^/]+)/)
  const currentGroupId = groupMatch?.[1] ?? null
  const currentGroup = currentGroupId ? navGroups.find((g) => g.id === currentGroupId) : null
  const isInAdminView =
    currentGroupId !== null && pathname.startsWith(`/groups/${currentGroupId}/admin`)

  return (
    <Stack h="100%" justify="space-between" p="md" gap={0}>
      <Box>
        <Text fw={700} size="lg" mb="xl" style={{ letterSpacing: "-0.3px" }}>
          🎅 Amic Invisible
        </Text>

        <NavLink
          label={t("nav.dashboard")}
          leftSection={<IconHome size={16} />}
          active={pathname === "/dashboard"}
          renderRoot={(props) => (
            <Link href="/dashboard" style={{ textDecoration: "none" }} {...props} />
          )}
          styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
        />

        {/* Group-specific navigation — shown when inside a group in user view */}
        {currentGroup && !isInAdminView && (
          <Box mt="md">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" px={12} mb={4}>
              {currentGroup.name}
            </Text>

            <NavLink
              label={t("nav.overview")}
              leftSection={<IconInfoCircle size={15} />}
              active={pathname === `/groups/${currentGroupId}`}
              renderRoot={(props) => (
                <Link
                  href={`/groups/${currentGroupId}`}
                  style={{ textDecoration: "none" }}
                  {...props}
                />
              )}
              styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
            />

            <NavLink
              label={t("nav.messages")}
              leftSection={<IconMail size={15} />}
              rightSection={
                currentGroup.unreadCount > 0 ? (
                  <Badge size="xs" color="red" variant="filled" circle>
                    {currentGroup.unreadCount}
                  </Badge>
                ) : undefined
              }
              active={
                pathname.startsWith(`/groups/${currentGroupId}/messages`) ||
                pathname.startsWith(`/groups/${currentGroupId}/send`)
              }
              renderRoot={(props) => (
                <Link
                  href={`/groups/${currentGroupId}/messages`}
                  style={{ textDecoration: "none" }}
                  {...props}
                />
              )}
              styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
            />

            <NavLink
              label={t("nav.members")}
              leftSection={<IconUsers size={15} />}
              active={pathname.startsWith(`/groups/${currentGroupId}/members`)}
              renderRoot={(props) => (
                <Link
                  href={`/groups/${currentGroupId}/members`}
                  style={{ textDecoration: "none" }}
                  {...props}
                />
              )}
              styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
            />

            {currentGroup.isAdmin && (
              <NavLink
                label={t("nav.adminManage")}
                leftSection={<IconSettings size={15} />}
                active={pathname.startsWith(`/groups/${currentGroupId}/admin`)}
                renderRoot={(props) => (
                  <Link
                    href={`/groups/${currentGroupId}/admin`}
                    style={{ textDecoration: "none" }}
                    {...props}
                  />
                )}
                styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
              />
            )}
          </Box>
        )}

      </Box>

      {/* Bottom: admin link + user info + logout */}
      <Stack gap="sm">
        <Divider />
        <NavLink
          label={t("nav.adminSection")}
          leftSection={<IconShield size={15} />}
          active={pathname === "/admin"}
          renderRoot={(props) => (
            <Link href="/admin" style={{ textDecoration: "none" }} {...props} />
          )}
          styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
        />
        <Divider />
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Avatar size={32} color="blue" radius="xl">
              {initial}
            </Avatar>
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Text size="xs" fw={600} truncate>
                {userName}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {userEmail}
              </Text>
            </Stack>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => toggleColorScheme()}
            title={colorScheme === "dark" ? "Light mode" : "Dark mode"}
            size="sm"
            style={{ flexShrink: 0 }}
          >
            {colorScheme === "dark" ? (
              <IconSun size={15} />
            ) : (
              <IconMoon size={15} />
            )}
          </ActionIcon>
        </Group>

        <form action={logout}>
          <Button
            type="submit"
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconLogout size={14} />}
            fullWidth
            justify="flex-start"
          >
            {t("auth.logout")}
          </Button>
        </form>
      </Stack>
    </Stack>
  )
}
