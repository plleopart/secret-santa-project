import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "keycloak",
      name: "Keycloak",
      type: "oidc",
      issuer: process.env.KEYCLOAK_ISSUER,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!profile?.sub || !user.email || !user.name) return false

      await prisma.user.upsert({
        where: { keycloakId: profile.sub },
        update: { email: user.email, name: user.name },
        create: { keycloakId: profile.sub, email: user.email, name: user.name },
      })

      return true
    },
    session({ session, token }) {
      session.user.id = token.sub!
      return session
    },
  },
})
