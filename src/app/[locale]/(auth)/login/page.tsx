import { Center, Stack, Button, Title } from "@mantine/core"
import { useTranslations } from "next-intl"
import { signIn } from "@/lib/auth"

export default function LoginPage() {
  const t = useTranslations("auth")

  return (
    <Center h="100vh">
      <Stack align="center" gap="xl">
        <Title order={1}>🎅 Amic Invisible</Title>
        <form
          action={async () => {
            "use server"
            await signIn("keycloak")
          }}
        >
          <Button type="submit" size="lg">
            {t("login")}
          </Button>
        </form>
      </Stack>
    </Center>
  )
}
