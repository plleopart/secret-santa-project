"use client"

import { AppShell, Burger } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { AppNavbar } from "./AppNavbar"

interface Props {
  children: React.ReactNode
  userName: string
  userEmail: string
  adminGroups: { id: string; name: string }[]
}

export function ProtectedShell({ children, userName, userEmail, adminGroups }: Props) {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      navbar={{
        width: 220,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="xl"
    >
      <AppShell.Navbar>
        <AppNavbar userName={userName} userEmail={userEmail} adminGroups={adminGroups} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
          mb="md"
        />
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
