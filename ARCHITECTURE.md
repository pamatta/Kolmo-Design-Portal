# Kolmo Construction Client Portal – Architectural Overview

## 1. System Architecture

### 1.1 High-Level Architecture

The system is a full-stack web application structured into four primary layers:

- **Client Layer (Frontend)**
- **API Layer (Backend HTTP / WebSocket)**
- **Service Layer (External Integrations)**
- **Data Layer (Database & ORM)**

#### 1.1.1 Client Layer

**Stack:**

- React 18 + TypeScript
- Wouter (routing)
- TanStack Query / React Query (server state)
- React Hook Form + Zod (forms & validation)
- Radix UI + Tailwind CSS v4 + shadcn/ui
- Stream Chat SDK

Architecture diagram:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  React 18 + TypeScript                                               │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │
│  │  │   Wouter     │ │ React Query  │ │ React Hook   │ │ Stream Chat  │ │ │
│  │  │   Router     │ │ State Mgmt   │ │ Form + Zod   │ │ SDK          │ │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │  Radix UI + Tailwind CSS v4 + shadcn/ui Components               │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
1.1.2 API Layer
Stack:

Express.js + TypeScript

Responsibilities:

HTTP routing (REST API)

Authentication & authorization middleware

Zod-based validation

Error handling

Session management

Diagram:

text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Express.js + TypeScript                                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │
│  │  │   Auth       │ │   Route      │ │ Validation   │ │ Error        │ │ │
│  │  │ Middleware   │ │ Handlers     │ │ (Zod)        │ │ Handling     │ │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
Communication between client and API:

text
Copy code
CLIENT LAYER
   │
   ▼
HTTP/REST + WebSocket
   │
   ▼
API LAYER
1.1.3 Service Layer
Encapsulated service integrations:

text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │   Stripe   │ │  Mailgun   │ │   Stream   │ │ Cloudflare │ │   Zoho   │ │
│  │   Service  │ │  Service   │ │   Chat     │ │   R2       │ │ Expense │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
Stripe Service: payment intents & webhooks

Mailgun Service: transactional emails

Stream Chat Service: channels, tokens, membership

Cloudflare R2 Service: object storage

Zoho Service: expense integration

1.1.4 Data Layer
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  Drizzle ORM                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│  │  │  PostgreSQL 16 (Neon Serverless)                              │ │ │
│  │  │  • Connection pooling via @neondatabase/serverless            │ │ │
│  │  │  • Session persistence (connect-pg-simple)                    │ │ │
│  │  └───────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
1.2 Layered Architecture Pattern
The application follows a 3-tier architecture:

Presentation Layer (Frontend)

React + TypeScript

Radix UI + Tailwind CSS

Wouter routing

TanStack Query for server state

Application Layer (Backend)

Express REST API

Auth & middleware

Business logic orchestration

Integration with Stripe, Mailgun, Stream, Zoho, R2

Data Layer

Drizzle ORM

PostgreSQL (Neon)

PostgreSQL-backed sessions

2. Data Flow Architecture
2.1 Request Lifecycle
text
Copy code
┌──────────────────────────────────────────────────────────────────────────────┐
│                               REQUEST FLOW                                   │
│                                                                              │
│  1. User Action                                                              │
│       │                                                                      │
│       ▼                                                                      │
│  ┌────────────────┐                                                         │
│  │ React Component │ ──► React Query mutation/query                         │
│  └────────────────┘                                                         │
│       │                                                                      │
│       ▼                                                                      │
│  ┌────────────────┐                                                         │
│  │ apiRequest()   │ ──► Fetch with credentials, JSON headers                │
│  └────────────────┘                                                         │
│       │                                                                      │
│       ▼                                                                      │
│  ┌────────────────┐                                                         │
│  │ Express Router │ ──► Route matching                                      │
│  └────────────────┘                                                         │
│       │                                                                      │
│       ▼                                                                      │
│  ┌────────────────────────────────────────────┐                             │
│  │ Middleware Chain:                          │                             │
│  │  • Session validation (express-session)    │                             │
│  │  • Authentication (requireAuth)            │                             │
│  │  • Role verification (requireRole)         │                             │
│  │  • Permission check (requireProjectPerm)   │                             │
│  └────────────────────────────────────────────┘                             │
│       │                                                                      │
│       ▼                                                                      │
│  ┌────────────────┐                                                         │
│  │ Route Handler  │ ──► Business logic + validation                         │
│  └────────────────┘                                                         │
│       │                                                                      │
│       ▼                                                                      │
│  ┌────────────────┐                                                         │
│  │ Storage Layer  │ ──► Drizzle ORM queries                                 │
│  └────────────────┘                                                         │
│       │                                                                      │
│       ▼                                                                      │
│  ┌────────────────┐                                                         │
│  │ PostgreSQL     │ ──► Data persistence                                    │
│  └────────────────┘                                                         │
│       │                                                                      │
│       ▼                                                                      │
│  Response flows back through layers with cache invalidation                 │
└──────────────────────────────────────────────────────────────────────────────┘
2.2 Optimistic UI Updates
ts
Copy code
const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await apiRequest("POST", "/api/projects", data);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    toast({ title: "Success" });
  },
});
3. Authentication & Authorization Architecture
3.1 Authentication Strategies
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION STRATEGIES                              │
│                                                                             │
│  ┌─────────────────────┐        ┌─────────────────────┐                    │
│  │ LOCAL STRATEGY      │        │ MAGIC LINK STRATEGY │                    │
│  │                     │        │                     │                    │
│  │ Email + Password    │        │ 1. Enter email      │                    │
│  │      │              │        │      │              │                    │
│  │      ▼              │        │      ▼              │                    │
│  │ Scrypt hash compare │        │ Generate token      │                    │
│  │      │              │        │      │              │                    │
│  │      ▼              │        │      ▼              │                    │
│  │ Session created     │        │ Send via Mailgun    │                    │
│  │                     │        │      │              │                    │
│  │                     │        │      ▼              │                    │
│  │                     │        │ Click link          │                    │
│  │                     │        │      │              │                    │
│  │                     │        │      ▼              │                    │
│  │                     │        │ Validate + expire   │                    │
│  │                     │        │      │              │                    │
│  │                     │        │      ▼              │                    │
│  │                     │        │ Session created     │                    │
│  └─────────────────────┘        └─────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────────┘
3.2 Role-Based Access Control (RBAC)
ts
Copy code
type UserRole = "admin" | "client" | "projectManager";

// Middleware Chain
app.use("/api/admin/*", requireAuth, requireRole("admin"));
app.use("/api/projects/:id/*", requireAuth, requireProjectPermission);
Permission Matrix:

Resource	Admin	Project Manager	Client
Create Projects	✅	✅	❌
View All Projects	✅	✅	❌
View Assigned Projects	✅	✅	✅
Manage Quotes	✅	✅	❌
Accept Quotes	❌	❌	✅
Process Payments	❌	❌	✅
Manage Users	✅	❌	❌
View Analytics	✅	✅	❌

3.3 Session Management
ts
Copy code
// PostgreSQL-backed sessions
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);
4. Database Schema Architecture
4.1 Entity Relationship Diagram
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA                                    │
│                                                                             │
│  ┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐          │
│  │   USERS     │────<│ PROJECT_CLIENTS │>────│    PROJECTS     │          │
│  │             │     └─────────────────┘     │                 │          │
│  │ id (PK)     │                             │ id (PK)         │          │
│  │ email       │                             │ name            │          │
│  │ firstName   │                             │ status          │          │
│  │ lastName    │                             │ description     │          │
│  │ role        │                             │ address         │          │
│  │ password    │                             │ imageUrl        │          │
│  └─────────────┘                             │ createdAt       │          │
│        │                                     └─────────────────┘          │
│        │                                            │                      │
│        │                                     ┌──────┴──────┐               │
│        │                                     │             │               │
│        ▼                                     ▼             ▼               │
│  ┌─────────────┐                      ┌──────────┐  ┌──────────────┐      │
│  │   QUOTES    │                      │  TASKS   │  │ DAILY_LOGS   │      │
│  │             │                      │          │  │              │      │
│  │ id (PK)     │                      │ id (PK)  │  │ id (PK)      │      │
│  │ projectId   │──────────────────────│ projectId│  │ projectId    │      │
│  │ clientId    │                      │ name     │  │ notes        │      │
│  │ status      │                      │ status   │  │ date         │      │
│  │ totalAmount │                      │ dueDate  │  │ weather      │      │
│  │ items (JSON)│                      └──────────┘  └──────────────┘      │
│  └─────────────┘                                                           │
│        │                                                                   │
│        ▼                                                                   │
│  ┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐          │
│  │  INVOICES   │────<│   MILESTONES    │>────│    PAYMENTS     │          │
│  │             │     │                 │     │                 │          │
│  │ id (PK)     │     │ id (PK)         │     │ id (PK)         │          │
│  │ projectId   │     │ invoiceId (FK)  │     │ milestoneId (FK)│          │
│  │ quoteId     │     │ name            │     │ stripePaymentId │          │
│  │ status      │     │ percentage      │     │ amount          │          │
│  │ totalAmount │     │ amount          │     │ status          │          │
│  └─────────────┘     │ dueDate         │     │ paidAt          │          │
│                      │ status          │     └─────────────────┘          │
│                      └─────────────────┘                                   │
│                                                                             │
│  ┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐          │
│  │ DOCUMENTS   │     │   PUNCH_LISTS   │     │ PROJECT_VERSIONS│          │
│  │             │     │                 │     │                 │          │
│  │ id (PK)     │     │ id (PK)         │     │ id (PK)         │          │
│  │ projectId   │     │ projectId (FK)  │     │ projectId (FK)  │          │
│  │ name        │     │ title           │     │ versionNumber   │          │
│  │ fileUrl     │     │ status          │     │ changes (JSON)  │          │
│  │ uploadedAt  │     │ priority        │     │ createdAt       │          │
│  └─────────────┘     └─────────────────┘     └─────────────────┘          │
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────────┐                      │
│  │ CHAT_CHANNELS       │     │ ZOHO_TOKENS         │                      │
│  │                     │     │                     │                      │
│  │ id (PK)             │     │ id (PK)             │                      │
│  │ projectId (FK)      │     │ userId (FK)         │                      │
│  │ streamChannelId     │     │ accessToken         │                      │
│  │ createdAt           │     │ refreshToken        │                      │
│  └─────────────────────┘     │ expiresAt           │                      │
│                              └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
4.2 Key Enums
ts
Copy code
// Project Status
enum ProjectStatus {
  draft = "draft",
  active = "active",
  completed = "completed",
  archived = "archived",
}

// Quote Status
enum QuoteStatus {
  draft = "draft",
  sent = "sent",
  accepted = "accepted",
  declined = "declined",
  expired = "expired",
}

// Invoice Status
enum InvoiceStatus {
  draft = "draft",
  sent = "sent",
  partial = "partial",
  paid = "paid",
  overdue = "overdue",
}

// Milestone Type
enum MilestoneType {
  downPayment = "down_payment",
  milestone = "milestone",
  final = "final",
}

// Payment Status
enum PaymentStatus {
  pending = "pending",
  processing = "processing",
  completed = "completed",
  failed = "failed",
}
5. API Architecture
5.1 Route Structure
text
Copy code
/api
├── /auth
│   ├── POST   /login           # Local authentication
│   ├── POST   /register        # User registration
│   ├── POST   /logout          # Session termination
│   ├── GET    /me              # Current user info
│   └── POST   /magic-link      # Magic link authentication
│
├── /admin (requires admin role)
│   ├── GET    /users           # List all users
│   ├── POST   /users           # Create user
│   ├── GET    /clients/search  # Search clients
│   └── GET    /analytics       # Dashboard analytics
│
├── /projects
│   ├── GET    /                # List projects (role-filtered)
│   ├── POST   /                # Create project
│   ├── GET    /:id             # Get project details
│   ├── PATCH  /:id             # Update project
│   ├── DELETE /:id             # Archive project
│   │
│   ├── /:id/tasks
│   │   ├── GET    /            # List project tasks
│   │   ├── POST   /            # Create task
│   │   └── PATCH  /:taskId     # Update task
│   │
│   ├── /:id/documents
│   │   ├── GET    /            # List documents
│   │   ├── POST   /upload      # Upload document
│   │   └── DELETE /:docId      # Delete document
│   │
│   ├── /:id/daily-logs
│   │   ├── GET    /            # List daily logs
│   │   └── POST   /            # Create daily log
│   │
│   └── /:id/punch-list
│       ├── GET    /            # List punch items
│       └── POST   /            # Create punch item
│
├── /quotes
│   ├── GET    /                # List quotes
│   ├── POST   /                # Create quote
│   ├── GET    /:id             # Get quote details
│   ├── PATCH  /:id             # Update quote
│   ├── POST   /:id/send        # Send quote to client
│   ├── POST   /:id/accept      # Client accepts quote
│   └── GET    /:id/pdf         # Download quote PDF
│
├── /invoices
│   ├── GET    /                # List invoices
│   ├── GET    /:id             # Get invoice details
│   ├── POST   /:id/send        # Send invoice
│   └── GET    /:id/pdf         # Download invoice PDF
│
├── /payments
│   ├── POST   /intent          # Create Stripe payment intent
│   └── POST   /webhook         # Stripe webhook handler
│
├── /chat
│   ├── GET    /token           # Get Stream Chat token
│   └── GET    /channels        # List user's channels
│
└── /zoho
    ├── GET    /auth            # OAuth initiation
    ├── GET    /callback        # OAuth callback
    └── GET    /expenses        # Fetch expenses
5.2 Request/Response Patterns
ts
Copy code
// Standard success response
interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Error response
interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
6. External Service Integrations
6.1 Stripe Payment Integration
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STRIPE PAYMENT FLOW                                  │
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────────┐            │
│  │   Client    │      │   Backend   │      │     Stripe      │            │
│  └─────────────┘      └─────────────┘      └─────────────────┘            │
│        │                     │                     │                       │
│        │ 1. Click Pay        │                     │                       │
│        │────────────────────>│                     │                       │
│        │                     │ 2. Create Intent    │                       │
│        │                     │────────────────────>│                       │
│        │                     │                     │                       │
│        │                     │ 3. Return clientSecret                      │
│        │                     │<────────────────────│                       │
│        │ 4. clientSecret     │                     │                       │
│        │<────────────────────│                     │                       │
│        │                     │                     │                       │
│        │ 5. Confirm payment (Stripe.js)            │                       │
│        │──────────────────────────────────────────>│                       │
│        │                     │                     │                       │
│        │                     │ 6. Webhook: payment_intent.succeeded        │
│        │                     │<────────────────────│                       │
│        │                     │                     │                       │
│        │                     │ 7. Update DB + send email                   │
│        │                     │────────>            │                       │
│        │                     │                     │                       │
│        │ 8. Success confirmation                   │                       │
│        │<────────────────────│                     │                       │
└─────────────────────────────────────────────────────────────────────────────┘
6.2 Mailgun Email Integration
ts
Copy code
// Email types sent:
// 1. Quote delivery
// 2. Invoice notifications
// 3. Payment confirmations
// 4. Magic link authentication
// 5. Project status updates
interface EmailService {
  sendQuote(quote: Quote, client: User): Promise<void>;
  sendInvoice(invoice: Invoice, client: User): Promise<void>;
  sendPaymentConfirmation(payment: Payment): Promise<void>;
  sendMagicLink(email: string, token: string): Promise<void>;
}
6.3 Stream Chat Integration
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STREAM CHAT ARCHITECTURE                               │
│                                                                             │
│  ┌─────────────┐                              ┌─────────────────┐          │
│  │   Client    │◄────── WebSocket ──────────►│  Stream Chat    │          │
│  │   (React)   │       Real-time msgs         │    Server       │          │
│  └─────────────┘                              └─────────────────┘          │
│        │                                              ▲                     │
│        │ 1. Request token                             │                     │
│        ▼                                              │                     │
│  ┌─────────────┐                                      │                     │
│  │   Backend   │────── Server-side API ───────────────┘                    │
│  │             │                                                            │
│  │ • Generate token (JWT)                                                  │
│  │ • Create channels (project-based)                                       │
│  │ • Manage members                                                        │
│  └─────────────┘                                                            │
│                                                                             │
│  Channel Naming: project-{projectId}                                       │
│  Members: Admin + Project Manager + Assigned Clients                       │
└─────────────────────────────────────────────────────────────────────────────┘
6.4 Cloudflare R2 Storage
ts
Copy code
interface R2Upload {
  bucket: string;           // kolmo-construction
  region: string;           // auto
  endpoint: string;         // Cloudflare R2 endpoint

  // Operations
  uploadFile(file: Buffer, key: string): Promise<string>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

// File categories
// • Project images
// • Documents (PDFs, contracts)
// • Quote attachments
// • Daily log photos
7. Frontend Architecture
7.1 Component Hierarchy
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT ARCHITECTURE                               │
│                                                                             │
│  App.tsx                                                                    │
│  ├── QueryClientProvider                                                    │
│  │   └── AuthProvider                                                       │
│  │       └── ChatProvider                                                   │
│  │           └── ThemeProvider                                              │
│  │               └── Router (Wouter)                                        │
│  │                   ├── /login ──────────► LoginPage                       │
│  │                   ├── /register ───────► RegisterPage                    │
│  │                   │                                                        │
│  │                   └── ProtectedRoute                                     │
│  │                       └── UniversalLayout                                │
│  │                           ├── Sidebar (role-based nav)                  │
│  │                           └── Main Content                              │
│  │                               ├── /dashboard ──► DashboardPage          │
│  │                               ├── /projects ───► ProjectsPage           │
│  │                               ├── /projects/:id► ProjectDetailPage      │
│  │                               ├── /quotes ─────► QuotesPage             │
│  │                               ├── /invoices ───► InvoicesPage           │
│  │                               ├── /payments ───► PaymentsPage           │
│  │                               ├── /chat ───────► ChatPage               │
│  │                               └── /admin ──────► AdminPage              │
└─────────────────────────────────────────────────────────────────────────────┘
7.2 State Management Pattern
ts
Copy code
// TanStack Query pattern used throughout
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/projects", projectId],
  // Default queryFn configured in queryClient
});

// Mutations with cache invalidation
const createProject = useMutation({
  mutationFn: (data) => apiRequest("POST", "/api/projects", data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  },
});
7.3 Form Management Pattern
ts
Copy code
// React Hook Form + Zod validation
const form = useForm<InsertProject>({
  resolver: zodResolver(
    insertProjectSchema.extend({
      clientIds: z.array(z.number()).min(1, "At least one client required"),
    })
  ),
  defaultValues: {
    name: "",
    description: "",
    clientIds: [],
  },
});

// Form submission
const onSubmit = (data: InsertProject) => {
  createProjectMutation.mutate(data);
};
8. Key Business Workflows
8.1 Quote → Project → Invoice Lifecycle
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                    QUOTE TO INVOICE LIFECYCLE                              │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                           QUOTE PHASE                                │ │
│  │                                                                       │ │
│  │  1. Admin creates quote draft                                         │ │
│  │  2. Add line items (materials, labor, etc.)                           │ │
│  │  3. Configure milestones (default: 40/40/20)                          │ │
│  │     • Down payment: 40%                                               │ │
│  │     • Milestone: 40%                                                  │ │
│  │     • Final: 20%                                                      │ │
│  │  4. Send quote to client (Mailgun)                                    │ │
│  │  5. Client reviews and accepts quote                                  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                          PROJECT PHASE                               │ │
│  │                                                                       │ │
│  │  6. Project automatically created from quote                         │ │
│  │  7. Invoice generated with milestones                                │ │
│  │  8. Chat channel created (Stream Chat)                               │ │
│  │  9. Project management:                                              │ │
│  │     • Tasks tracked                                                   │ │
│  │     • Daily logs recorded                                            │ │
│  │     • Documents uploaded                                             │ │
│  │     • Punch lists managed                                            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         PAYMENT PHASE                                │ │
│  │                                                                       │ │
│  │  10. Client pays milestones:                                         │ │
│  │       • Down payment (40%) → Stripe intent + webhook                 │ │
│  │       • Milestone (40%) → Stripe intent + webhook                    │ │
│  │       • Final (20%) → Stripe intent + webhook                        │ │
│  │  11. Invoice marked PAID, project marked complete                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
8.2 Payment Processing Flow (Detail)
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PAYMENT PROCESSING DETAIL                              │
│                                                                             │
│  Client Portal                   Backend                     Stripe         │
│       │                             │                           │           │
│       │ 1. Select milestone         │                           │           │
│       │────────────────────────────>│                           │           │
│       │                             │ 2. Create PaymentIntent   │           │
│       │                             │──────────────────────────>│           │
│       │                             │                           │           │
│       │                             │ 3. Return client_secret   │           │
│       │<────────────────────────────│<──────────────────────────│           │
│       │ 4. Render Stripe Elements   │                           │           │
│       │─────────────────────────────────────────────────────────│           │
│       │ 5. Submit payment           │                           │           │
│       │─────────────────────────────────────────────────────────>           │
│       │                             │ 6. Webhook: succeeded     │           │
│       │                             │<──────────────────────────│           │
│       │                             │ 7. Update milestone &     │           │
│       │                             │    invoice status         │           │
│       │                             │ 8. Send confirmation      │           │
│       │                             │    email (Mailgun)        │           │
│       │ 9. Show success             │                           │           │
│       │<────────────────────────────│                           │           │
└─────────────────────────────────────────────────────────────────────────────┘
9. File Upload Architecture
9.1 Upload Flow
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE UPLOAD FLOW                                    │
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                 │
│  │   Browser   │      │   Express   │      │     R2      │                 │
│  └─────────────┘      └─────────────┘      └─────────────┘                 │
│        │                     │                     │                        │
│        │ 1. Select file      │                     │                        │
│        │    (ProjectImageUpload)                   │                        │
│        │ 2. FormData POST    │                     │                        │
│        │────────────────────>│                     │                        │
│        │                     │ 3. Multer (memory)  │                        │
│        │                     │ 4. Upload to R2     │──────────────────────> │
│        │                     │ 5. Return URL       │<────────────────────── │
│        │                     │ 6. Update DB        │                        │
│        │ 7. Return new URL   │                     │                        │
│        │<────────────────────│                     │                        │
└─────────────────────────────────────────────────────────────────────────────┘
9.2 File Categories & Storage Keys
ts
Copy code
// Storage key patterns
const storageKeys = {
  projectImages: (projectId: number) => `projects/${projectId}/cover`,
  documents: (projectId: number, filename: string) =>
    `projects/${projectId}/documents/${filename}`,
  dailyLogPhotos: (logId: number, filename: string) =>
    `daily-logs/${logId}/photos/${filename}`,
  quoteAttachments: (quoteId: number, filename: string) =>
    `quotes/${quoteId}/attachments/${filename}`,
};
10. Security Architecture
10.1 Security Layers
text
Copy code
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TRANSPORT LAYER                                                    │   │
│  │  • HTTPS enforced in production                                     │   │
│  │  • Secure cookies (httpOnly, secure, sameSite)                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AUTHENTICATION LAYER                                               │   │
│  │  • Session-based authentication (PostgreSQL store)                  │   │
│  │  • Scrypt password hashing                                          │   │
│  │  • Magic link tokens (expiring, single-use)                         │   │
│  │  • Session expiration (30 days)                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AUTHORIZATION LAYER                                                │   │
│  │  • Role-based access control (RBAC)                                 │   │
│  │  • Resource-level permissions (project ownership)                   │   │
│  │  • Route-level middleware guards                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  INPUT VALIDATION LAYER                                             │   │
│  │  • Zod schema validation on all inputs                              │   │
│  │  • Parameterized DB queries (Drizzle)                               │   │
│  │  • File type/size validation on uploads                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DATA LAYER                                                         │   │
│  │  • Environment variables for secrets                                │   │
│  │  • Encrypted at rest (Neon PostgreSQL)                              │   │
│  │  • Signed URLs for file access (R2)                                 │   │
│  │  • PCI-compliant payment handling (Stripe)                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
Summary
The Kolmo Construction Client Portal is a full-stack, construction-focused CRM / client portal that demonstrates:

Clean, layered architecture with clear separation of concerns

Type-safe development with TypeScript from frontend to backend

Secure authentication using sessions, Scrypt, and magic links

Robust payment processing via Stripe with milestone-based billing

Real-time collaboration via Stream Chat

Cloud-native document and media storage using Cloudflare R2

Construction domain workflows:

Quote → project → invoice lifecycle

Tasks, daily logs, documents, punch lists

The design supports scalability, maintainability, and future extension while preserving strong security and auditability throughout.

