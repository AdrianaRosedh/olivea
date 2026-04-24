# Olivea Admin Portal — Phase 2 Architecture Plan
## Chat Integration, AI Chatbot & User Permissions

---

## Overview

Evolve the Olivea admin portal from a content management system into a full operations hub with:

1. **User management & permissions** — real auth, roles, team invites
2. **Chatwoot integration** — unified inbox for Instagram DMs + live chat
3. **AI chatbot** — auto-respond to common guest questions in ES/EN
4. **Live chat widget** — replace Cloudbeds chat on the public site

---

## Phase 1: Authentication & User Management

### Why first?
Everything else depends on knowing *who* is logged in and *what they can do*. The current admin uses `mockUser` with no real auth — this must be the foundation.

### Tech stack
- **Supabase Auth** (already configured) — email/password + magic link login
- **Custom claims in JWT** — role stored in `app_metadata` via Auth Hook
- **RLS policies** — database-level enforcement, not just UI checks

### User roles

| Role | Content | Chat | Users | Settings |
|------|---------|------|-------|----------|
| **Owner** | Full CRUD | Full access + bot config | Create/edit/delete users | All settings |
| **Manager** | Full CRUD | Full access | View team only | Limited settings |
| **Editor** | Edit only (no delete) | No access | No access | No access |
| **Host** | Read only | Chat only (reply to guests) | No access | No access |

### Database schema

```sql
-- Extends Supabase auth.users with app-specific profile
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'editor'
    check (role in ('owner', 'manager', 'editor', 'host')),
  avatar_url text,
  invited_by uuid references admin_users(id),
  last_active_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: users can read all profiles, only owners can modify
alter table admin_users enable row level security;

create policy "Anyone authenticated can read profiles"
  on admin_users for select using (auth.uid() is not null);

create policy "Owners can manage all users"
  on admin_users for all using (
    exists (
      select 1 from admin_users
      where id = auth.uid() and role = 'owner'
    )
  );

-- Audit log for accountability
create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references admin_users(id),
  action text not null,        -- 'login', 'content.save', 'user.invite', etc.
  resource_type text,          -- 'page', 'popup', 'user', etc.
  resource_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
```

### Auth flow
1. Owner invites team member → receives magic link email
2. First login creates `admin_users` row with assigned role
3. JWT custom claim includes role → available in middleware and RLS
4. Next.js middleware checks `/admin/*` routes → redirects to login if unauthenticated
5. Role checked server-side before any mutation (not just UI hiding)

### Admin UI additions
- **Team page** (`/admin/team`) — list users, invite new, change roles, deactivate
- **Login page** (`/admin/login`) — email + password or magic link
- **Profile panel** — already built, wire to real Supabase Auth
- **Role guards** — server components check role before rendering sensitive sections

### Estimated effort: 1-2 weeks

---

## Phase 2: Chatwoot Self-Hosted Deployment

### Infrastructure

| Component | Spec | Monthly cost |
|-----------|------|-------------|
| VPS (Hetzner/DigitalOcean) | 4GB RAM, 2 vCPU, 80GB SSD | ~$20-24 |
| PostgreSQL | Included on VPS (Docker) | $0 |
| Redis | Included on VPS (Docker) | $0 |
| S3 storage (attachments) | Supabase Storage or Cloudflare R2 | ~$0-5 |
| Domain | `chat.oliveafarmtotable.com` | $0 (subdomain) |
| **Total** | | **~$20-30/month** |

### Docker deployment

```yaml
# docker-compose.yml (simplified)
services:
  chatwoot-rails:
    image: chatwoot/chatwoot:latest
    env_file: .env
    ports:
      - "3001:3000"
    depends_on:
      - postgres
      - redis

  chatwoot-sidekiq:
    image: chatwoot/chatwoot:latest
    command: bundle exec sidekiq
    env_file: .env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### Instagram connection steps
1. Create Meta Business App at developers.facebook.com
2. Add "Instagram Graph API" and "Messenger" products
3. Connect your Facebook Page(s) linked to Instagram accounts
4. Get Page Access Token (long-lived)
5. Configure webhook URL: `https://chat.oliveafarmtotable.com/webhooks/instagram`
6. Set callback verification token in Chatwoot env
7. Submit for Meta App Review (instagram_manage_messages permission)

**Timeline note:** Meta app review can take 1-4 weeks. Start this early.

### What you get out of the box
- Unified inbox for all Instagram accounts
- Conversation assignment to team members
- Canned responses (saved replies)
- Contact management with conversation history
- Labels and filters
- Typing indicators and read receipts
- File/image sharing
- Mobile app (iOS + Android)

### Estimated effort: 2-3 days setup + Meta review wait

---

## Phase 3: Embed Chat in Admin Portal

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Olivea Admin Portal (Next.js)                       │
│                                                       │
│  ┌──────────┐  ┌──────────────────────────────────┐  │
│  │  Dock     │  │  Main Content Area               │  │
│  │           │  │                                    │  │
│  │ Dashboard │  │  ┌────────────────────────────┐   │  │
│  │ Pages     │  │  │  Chat Inbox                 │   │  │
│  │ Content   │  │  │  ┌──────┐ ┌──────────────┐ │   │  │
│  │ 💬 Chat  │  │  │  │ Conv │ │ Messages     │ │   │  │
│  │ Settings  │  │  │  │ List │ │              │ │   │  │
│  │           │  │  │  │      │ │              │ │   │  │
│  │           │  │  │  │      │ │ [Reply box]  │ │   │  │
│  │           │  │  │  └──────┘ └──────────────┘ │   │  │
│  │           │  │  └────────────────────────────┘   │  │
│  └──────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
         │                        │
         │         Chatwoot REST API + WebSocket
         │                        │
         ▼                        ▼
┌─────────────────────────────────────────────────────┐
│  Chatwoot (self-hosted)                              │
│  chat.oliveafarmtotable.com                          │
│  - Instagram webhooks                                │
│  - Live chat widget backend                          │
│  - Agent bot processing                              │
└─────────────────────────────────────────────────────┘
```

### Integration approach

**Use Chatwoot's REST API + WebSocket** — don't embed Chatwoot's UI in an iframe. Build a native chat interface that matches the Olivea admin design language.

**Key API endpoints:**

| Action | Endpoint |
|--------|----------|
| List conversations | `GET /api/v1/accounts/{id}/conversations` |
| Get messages | `GET /api/v1/accounts/{id}/conversations/{id}/messages` |
| Send reply | `POST /api/v1/accounts/{id}/conversations/{id}/messages` |
| Assign agent | `POST /api/v1/accounts/{id}/conversations/{id}/assignments` |
| Toggle status | `POST /api/v1/accounts/{id}/conversations/{id}/toggle_status` |
| Search contacts | `GET /api/v1/accounts/{id}/contacts/search` |

**Real-time via WebSocket:**
- Connect to `wss://chat.oliveafarmtotable.com/cable`
- Subscribe to conversation events
- Incoming messages appear instantly — no polling

### Admin portal additions

Add a **Chat** category to the dock (between Content and Settings):

- **Inbox** — conversation list with filters (open, pending, resolved)
- **Conversation view** — message thread with reply box
- **Contacts** — guest contact profiles with conversation history
- **Canned responses** — manage saved replies
- **Bot settings** — configure auto-responses (Owner/Manager only)

### Role-based chat access

| Feature | Owner | Manager | Host |
|---------|-------|---------|------|
| View all conversations | Yes | Yes | Assigned only |
| Reply to conversations | Yes | Yes | Yes |
| Assign conversations | Yes | Yes | No |
| Configure bot | Yes | Yes | No |
| Manage canned responses | Yes | Yes | No |

### Estimated effort: 2-3 weeks

---

## Phase 4: AI Chatbot

### How it works

```
Guest DMs on Instagram
        │
        ▼
    Chatwoot receives message
        │
        ▼
    Agent Bot webhook fires
        │
        ▼
    Your bot endpoint (Next.js API route or Edge Function)
        │
        ├── Can answer? → Auto-reply in ES or EN
        │                  (hours, location, menu, reservations)
        │
        └── Can't answer? → Hand off to human agent
                             + notify team
```

### Bot knowledge base

The bot should know:

- **Hours**: Farm to Table dinner service, Café morning hours, Casa check-in/out
- **Location**: Address, directions from Ensenada, parking
- **Reservations**: How to book (OpenTable link), group size limits, dress code
- **Menu**: It's a tasting menu, dietary accommodations available, wine pairing option
- **Casa**: Room types, amenities, booking link (Cloudbeds)
- **Café**: Open to public, no reservation needed, specialty coffee
- **Pricing**: General ranges without exact numbers (or exact if you want)
- **Events**: Current season's special events

### Language detection

1. Detect language from incoming message (simple heuristic or API)
2. Reply in the same language
3. If uncertain, reply in Spanish first (primary audience)

### Implementation options

| Approach | Pros | Cons |
|----------|------|------|
| **Rule-based (keyword matching)** | Fast, cheap, predictable | Brittle, limited understanding |
| **Claude API with RAG** | Natural conversation, handles edge cases | Cost per message (~$0.01-0.03), latency |
| **Hybrid (rules + AI fallback)** | Best of both, cost-efficient | More complex to build |

**Recommendation: Hybrid approach.**
- Common questions (hours, location, "how to book") → instant rule-based reply
- Complex or ambiguous questions → Claude API with restaurant context
- Anything the bot isn't confident about → hand off to human

### Bot response examples

**Guest:** "Hola, ¿a qué hora abren?"
**Bot:** "¡Hola! 🌿 Olivea Farm To Table abre para cena de jueves a lunes. El servicio de la experiencia degustación comienza a las 14:00. ¿Te gustaría hacer una reservación?"

**Guest:** "Do you have vegetarian options?"
**Bot:** "Hi! Our tasting menu is guided by what the garden offers each day. We're happy to accommodate vegetarian diets — just let us know when you book so Chef can prepare your experience. Would you like our reservation link?"

**Guest:** "Can I bring my dog?"
**Bot → hands off to human** (uncommon question, needs human judgment)

### Estimated effort: 1-2 weeks

---

## Phase 5: Live Chat Widget on Public Site

### Replace Cloudbeds widget

Add Chatwoot's live chat widget to `oliveafarmtotable.com`. It's a single script tag:

```html
<script>
  window.chatwootSettings = {
    position: "right",
    type: "standard",
    launcherTitle: "Chat with us",
    locale: "es", // or detect from page lang
  };
  // Load widget script
</script>
```

### Customization
- Match Olivea brand colors (olive green, cream)
- Pre-chat form: name + email (optional)
- Business hours indicator
- Bot handles after-hours with "we'll reply when we're back"
- Multilingual: widget language matches page language (ES/EN)

### Integration with existing site
- Widget loads on all public pages
- Conversations from the widget appear in the same Chatwoot inbox
- Same bot logic applies — auto-answer common questions
- Same team replies from the admin portal chat interface

### Estimated effort: 1-2 days

---

## Rollout Timeline

```
Week 1-2    Phase 1: Auth & User Management
            └── Real login, roles, team management, middleware guards

Week 3      Phase 2: Chatwoot Deployment
            └── VPS setup, Docker, Instagram connection
            └── Submit Meta app review (runs in parallel)

Week 4-6    Phase 3: Chat in Admin Portal
            └── Build native chat UI using Chatwoot API
            └── WebSocket for real-time messages
            └── Conversation list, thread view, reply box

Week 6-7    Phase 4: AI Chatbot
            └── Bot webhook endpoint
            └── Knowledge base + rule engine
            └── Claude API integration for complex questions
            └── Language detection

Week 7      Phase 5: Live Chat Widget
            └── Add to public site, style to brand
            └── Connect bot, test end-to-end

Week 8      Testing & Polish
            └── End-to-end testing across all channels
            └── Bot tuning based on real conversations
            └── Team training
```

**Total estimated timeline: 6-8 weeks**
**Total monthly cost: ~$20-30** (VPS) + Claude API usage (~$5-20/mo depending on volume)

---

## Technical Decisions Summary

| Decision | Choice | Why |
|----------|--------|-----|
| Auth provider | Supabase Auth | Already in stack, JWT custom claims, RLS integration |
| Chat platform | Chatwoot (self-hosted) | Free, owns data, Instagram API handled, REST + WebSocket API |
| Chat UI | Custom (not iframe) | Matches admin design, full control, better UX |
| Bot engine | Hybrid (rules + Claude API) | Cost-efficient, handles both simple and complex queries |
| Hosting | Hetzner/DO VPS | Cheapest for Chatwoot requirements, full control |
| Real-time | Chatwoot WebSocket | Native support, no additional infrastructure |

---

## Open Questions

1. **How many Instagram accounts?** Each needs its own Facebook Page connection
2. **WhatsApp too?** Chatwoot supports it, but requires a Meta Business API number ($)
3. **Bot personality?** Formal/warm/playful — should match Olivea's brand voice
4. **After-hours behavior?** Auto-reply with "we'll respond tomorrow" or collect info?
5. **Notification preferences?** Push notifications, email alerts for unread messages?
