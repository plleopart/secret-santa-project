import "@mantine/core/styles.css"
import { MantineProvider, ColorSchemeScript } from "@mantine/core"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as "ca" | "es" | "en")) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
