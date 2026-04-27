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
    async signIn({ user, profile }) {
      if (!profile?.sub || !user.email) return false

      const name = user.name || (profile as { name?: string }).name || user.email
      const email = user.email.toLowerCase()

      try {
        // Upsert by email so that guest users (added by admin before login) get their
        // keycloakId promoted to the real Keycloak sub. ON UPDATE CASCADE propagates
        // the change to all FK references (group_members, assignments, messages).
        await prisma.user.upsert({
          where: { email },
          update: { keycloakId: profile.sub, name },
          create: { keycloakId: profile.sub, email, name },
        })
      } catch (err) {
        console.error("[auth] signIn upsert failed:", err)
        return false
      }

      return true
    },
    session({ session, token }) {
      session.user.id = token.sub!
      return session
    },
  },
})
