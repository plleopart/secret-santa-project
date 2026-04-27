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
} from "@tabler/icons-react"

interface Props {
  userName: string
  userEmail: string
  adminGroups: { id: string; name: string }[]
}

export function AppNavbar({ userName, userEmail, adminGroups }: Props) {
  const t = useTranslations()
  const pathname = usePathname()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const initial = userName.charAt(0).toUpperCase() || "?"

  return (
    <Stack h="100%" justify="space-between" p="md" gap={0}>
      {/* Logo */}
      <Box>
        <Text fw={700} size="lg" mb="xl" style={{ letterSpacing: "-0.3px" }}>
          🎅 Amic Invisible
        </Text>

        {/* Navigation links */}
        <NavLink
          label={t("nav.dashboard")}
          leftSection={<IconHome size={16} />}
          active={pathname === "/dashboard"}
          renderRoot={(props) => (
            <Link href="/dashboard" style={{ textDecoration: "none" }} {...props} />
          )}
          styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
        />

        {/* Admin groups section */}
        {adminGroups.length > 0 && (
          <Box mt="md">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" px={12} mb={4}>
              {t("nav.adminSection")}
            </Text>
            {adminGroups.map((g) => (
              <NavLink
                key={g.id}
                label={g.name}
                leftSection={<IconShield size={15} />}
                active={pathname === `/groups/${g.id}/admin`}
                renderRoot={(props) => (
                  <Link
                    href={`/groups/${g.id}/admin`}
                    style={{ textDecoration: "none" }}
                    {...props}
                  />
                )}
                styles={{ root: { borderRadius: "var(--mantine-radius-md)" } }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Bottom: user info + dark mode */}
      <Stack gap="sm">
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
