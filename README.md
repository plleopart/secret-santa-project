# 🎅 Amic Invisible

A web app for managing anonymous messaging within a Secret Santa group. When someone is assigned a person in the draw, they can ask questions about the gift without revealing their identity. The app allows sending anonymous messages to the assigned recipient — the receiver can never know who is writing to them.

> **Language note:** The UI is in Catalan by default (also supports Spanish and English). Code, database schema, and documentation are in English.

---

## ✨ Features

### Authentication
- Sign in with Google via **Keycloak** (OIDC)
- Session managed by **NextAuth v5**
- Automatic user record upsert on every authenticated request

### Groups
- **Create** a Secret Santa group with a name and draw mode
- **Join** a group using a 6-character invite code
- Each user can be in multiple groups simultaneously
- Per-group roles: **Admin** or **Member** (no global roles)

### Dashboard
- Overview of all your groups (admin and member)
- Status badges: draw pending / draw done / unread messages
- Member count per group
- Dark / light mode toggle

### Group detail
- Full member list with name and email
- Admin-only: invite code display with one-click copy
- Admin-only: **add members directly** by name + email (no login required for them)
- Add member button disabled once the draw is done

### Draw — Automatic mode
- Admin triggers the draw with a confirmation step
- **Fisher-Yates derangement**: guaranteed no self-assignment
- Admin sees the full assignment list after the draw
- Members see only their own assignment ("Your Secret Santa is…")

### Draw — Manual mode
- Admin defines who gives to whom via a dropdown editor
- Validation: no duplicates, no self-assignments, all members must be assigned
- Same read-only assignment view once saved

---

## 🏗️ Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | Mantine UI 9 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | Keycloak (OIDC) + NextAuth v5 |
| i18n | next-intl (Catalan · Spanish · English) |
| Server logic | Next.js Server Actions (no API routes) |

---

## 🔒 Anonymity guarantee

The `messages` table has **no `sender_id` column**. Sender identity is validated at the Server Action level (checking the `assignments` table) but is never persisted. Not even a bug, an admin query, or a database dump can reveal who sent a message.

---

## 🚀 Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL instance
- Keycloak instance configured with Google SSO and an `amic-invisible` client

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/amic_invisible"
AUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
KEYCLOAK_ISSUER="http://localhost:8080/realms/your-realm"
KEYCLOAK_CLIENT_ID="amic-invisible"
KEYCLOAK_CLIENT_SECRET="<from Keycloak client settings>"
```

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project structure

```
src/
  actions/          # Server Actions (all business logic lives here)
    groups.ts       # listMyGroups, createGroup, joinGroup, getGroup, addMember
    draw.ts         # performDraw (Fisher-Yates), setManualAssignments
    messages.ts     # sendMessage, getMyMessages, markAsRead
    admin.ts        # getGroupAssignments, getGroupMessages
    auth.ts         # logout
  app/
    [locale]/
      (auth)/       # Login page (no AppShell)
      (protected)/  # Authenticated pages with sidebar layout
        dashboard/
        groups/[groupId]/
  components/
    layout/         # AppNavbar, ProtectedShell (AppShell wrapper)
    groups/         # GroupCard, AddMemberModal, AutoDrawSection,
                    # ManualAssignmentEditor, DashboardActions, InviteCodeBadge
  i18n/             # next-intl routing + navigation helpers
  lib/              # auth.ts (NextAuth), prisma.ts, theme.ts
  messages/         # ca.json · es.json · en.json
```

---

## 🗺️ Roadmap

- [ ] Anonymous messaging inbox (`/groups/[groupId]/messages`)
- [ ] Send anonymous message (`/groups/[groupId]/send`)
- [ ] Admin message viewer (`/groups/[groupId]/admin`)
- [ ] Toast notifications for actions
- [ ] Email notifications (optional)

---

## 📄 License

MIT
