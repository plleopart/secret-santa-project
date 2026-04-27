# 🎅 Amic Invisible

A web app for managing anonymous messaging within a Secret Santa group. When someone is assigned a person in the draw, they can ask questions about the gift without revealing their identity. The app allows sending anonymous messages to the assigned recipient — the receiver can never know who is writing to them.

> **Language note:** The UI is in Catalan by default (also supports Spanish and English). Code, database schema, and documentation are in English.

---

## ✨ Features

### Authentication
- Sign in with Google via **Keycloak** (OIDC)
- Session managed by **NextAuth v5**
- Automatic user record upsert on every authenticated request
- "Guest" members can be added by admin before they have a Keycloak account; their record is promoted on first login

### Groups
- **Create** a Secret Santa group with a name and draw mode
- **Join** a group using a 6-character invite code
- Each user can be in multiple groups simultaneously
- Per-group roles: **Admin** or **Member** (no global roles)

### Dashboard
- Overview of all your groups (admin and member)
- Status badges: draw pending / draw done
- Unread message count per group
- Dark / light mode toggle

### Sidebar navigation
- Contextual: group-specific items (overview, messages, members, wish list) appear when navigating a group in user view
- **Administrator** section pinned to the bottom — dedicated screen listing all groups you manage
- Admin view and user view are fully separated: admin items never show in the user sidebar and vice versa

### Group overview
- Creation date, member count, draw status
- Message status card: always visible, highlights unread count when applicable
- My assignment card (shown after the draw)

### Group members
- Full member list with name, email, and admin badge

### Wish list
- Dedicated page per group *(feature placeholder — coming soon)*

### Draw — Automatic mode
- Admin triggers the draw with a confirmation step
- **Fisher-Yates derangement**: guaranteed no self-assignment
- Admin sees the full assignment list after the draw
- Members see only their own assignment ("Your Secret Santa is…")

### Draw — Manual mode
- Admin defines who gives to whom via a dropdown editor
- Validation: no duplicates, no self-assignments, all members must be assigned
- Read-only view once saved

### Anonymous messaging
- **Hub page**: two cards (Send / Inbox) with per-card unread badges so the user knows exactly where to look
- **Send page** (`/send`): compose anonymous messages to your recipient; view the full conversation thread including replies received
- **Inbox page** (`/messages/inbox`): read messages from your anonymous giver; reply up to 5 times per round
- **Admin view** (`/admin`): full message log for the group, visible only to the group admin

---

## 🔒 Anonymity guarantee

The `messages` table has **no `sender_id` column**. Sender identity is validated at the Server Action level (checking the `assignments` table) but is never persisted. Not even a bug, an admin query, or a database dump can reveal who sent a message.

---

## 🏗️ Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | Mantine UI 9 |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL |
| Auth | Keycloak (OIDC) + NextAuth v5 |
| i18n | next-intl (Catalan · Spanish · English) |
| Server logic | Next.js Server Actions (no API routes) |

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
    auth.ts         # logout
    groups.ts       # listMyGroups, createGroup, joinGroup, getGroup,
                    #   addMember, listAdminGroups
    draw.ts         # performDraw (Fisher-Yates), setManualAssignments
    messages.ts     # sendMessage, sendReply, getReplyStatus, markAllRead
    admin.ts        # getGroupAssignments, getGroupMessages
  app/
    [locale]/
      (auth)/               # Login page (no AppShell)
      (protected)/          # Authenticated pages with sidebar layout
        admin/              # Administrator dashboard
        dashboard/
        groups/[groupId]/
          page.tsx          # Group overview
          members/          # Member list
          wishlist/         # Wish list (placeholder)
          messages/
            page.tsx        # Messaging hub (2 cards with unread badges)
            inbox/          # Inbox: received messages + reply form
          send/             # Send anonymous message + conversation
          admin/            # Admin: draw, members, all messages
  components/
    layout/         # AppNavbar (contextual sidebar), ProtectedShell
    groups/         # GroupCard, GroupMessagingActions, AddMemberModal,
                    # AutoDrawSection, ManualAssignmentEditor, InviteCodeBadge
    messages/       # AnonymousMessageForm, ReplyForm
  i18n/             # next-intl routing + navigation helpers
  lib/              # auth.ts (NextAuth), prisma.ts, theme.ts
  messages/         # ca.json · es.json · en.json
```

---

## 🗺️ Roadmap

- [ ] Wish list: add/remove items, visible only to your assigned giver
- [ ] Toast notifications for actions
- [ ] Email notifications (optional)

---

## 📄 License

MIT
