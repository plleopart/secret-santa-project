import "@mantine/core/styles.css"
import { MantineProvider } from "@mantine/core"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import Script from "next/script"
import { routing } from "@/i18n/routing"
import { theme } from "@/lib/theme"

// Inline equivalent of Mantine's ColorSchemeScript for defaultColorScheme="auto".
// Rendered from a Server Component to avoid React 19's "script in client component" warning.
const colorSchemeScript = `try{var _c=window.localStorage.getItem("mantine-color-scheme-value");var c=_c==="light"||_c==="dark"||_c==="auto"?_c:"auto";var d=c!=="auto"?c:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",d)}catch(e){}`

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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script id="mantine-color-scheme" strategy="beforeInteractive">
          {colorSchemeScript}
        </Script>
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
