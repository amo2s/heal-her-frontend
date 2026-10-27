# HEAL-HER AI — Frontend

### AI-Powered Social-Health, Safety & Empowerment Platform for Girls and Young Women

---

## 🌸 About the Project

**HEAL-HER AI** is an intelligent, privacy-first social-health platform engineered to provide age-appropriate, compassionate, and stigma-free health education, emotional support, and personal safety tools for girls and young women.

Navigating physical and emotional development, relationship safety, and mental wellness is often fraught with misinformation, anxiety, and privacy concerns. HEAL-HER AI bridges this gap through a multi-tiered platform tailored to the developmental stages of each user:

* **Kids (Ages 0–12)**: Protective, engaging storytelling, friendly **AI Buddy** interactions, fundamental boundary education, and rapid SOS capabilities.
* **Teens (Ages 13–17)**: Real-talk puberty, menstrual, and emotional wellness education, relationship red-flag detection, interactive scenario simulations, and a peer **Safe Circle**.
* **Young Adults (Ages 18–25)**: A confidential, autonomous command center for health literacy, reproductive wellness, professional resources, and dedicated **Heal AI** support.

### Key Capabilities

* **Heal AI & AI Buddy**: Real-time conversational AI companion delivering empathetic, medically grounded health education with streaming response support.
* **Stealth Mode (Emergency Privacy)**: Pressing the `Esc` key instantly activates stealth camouflage, disguising the active screen to safeguard privacy in unsupportive or unsafe environments.
* **Interactive Scenario Simulations**: Gamified decision-tree simulations that help users identify healthy boundaries, peer pressure, and relationship red flags.
* **Safe Circle**: A quick-access, trusted emergency contact system providing safety networks and guidance during crises.
* **Zero-Trust Management Shell**: A hardened, role-based administrative portal for authorized staff and counselors featuring telemetry, audit logs, and user management.

---

## 🛠️ Tech Stack

### Core Framework & Runtime
* **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, Server Components & Route Handlers)
* **Library**: [React](https://react.dev/) 19
* **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)

### Styling & Animation
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 & PostCSS
* **Component Primitives**: [Radix UI](https://www.radix-ui.com/) accessible primitives
* **Animations**: [Framer Motion](https://www.framer.com/motion/) (fluid gestures, layout animations, spring transitions)
* **Icons**: [Lucide React](https://lucide.dev/)

### Audio & Telemetry
* **Audio Engine**: [Howler.js](https://howlerjs.com/) for interface feedback and ambient audio guidance

### Architecture & Security
* **BFF (Backend-For-Frontend) Zero-Trust Proxy**:
  * Edge-level route protection and path canonicalization.
  * Context-aware silent token rotation for short-lived access tokens (15m) and long-lived refresh tokens (7d).
  * Strict `HttpOnly`, `SameSite: strict`, `Secure` cookie vaults preventing client-side token exfiltration.
  * Client IP resolution and server-to-server handshake cryptography.

---

## 📁 Folder Structure

```text
frontend/
├── app/                                 # Next.js App Router
│   ├── (auth)/                          # Authentication pages (login, registration)
│   ├── api/                             # Server Route Handlers
│   │   ├── auth/                        # Auth endpoints (login, logout, signup, management)
│   │   ├── go/                          # TOS & Gateway reverse proxy
│   │   └── proxy/[...slug]/             # Universal Courier (shielded GraphQL/REST reverse proxy)
│   ├── dashboard/                       # Tiered User Dashboards
│   │   ├── kids/                        # Kids safe space, AI Buddy, detector, simulations
│   │   ├── teens/                       # Teens wellness hub, Heal AI, simulations
│   │   └── young-adults/                # Young adult command center & Heal AI
│   ├── management/                      # Administrative & staff shell
│   │   └── (dashboard)/dashboard/       # Hardened staff dashboard with parallel slots
│   ├── globals.css                      # Global design system & theme tokens
│   └── layout.tsx                       # Root HTML & body structure
├── components/                          # Reusable Component Hierarchy
│   ├── context/                         # Audio and sensory managers
│   ├── kids/                            # Kids-specific UI cards, topbar, and sidebar
│   ├── management/                      # Staff rails, system telemetry, and dropdowns
│   ├── modals/                          # Logout, settings, and profile modals
│   ├── teens/                           # Teens navigation, topbar, and data views
│   ├── ui/                              # Base UI primitives (buttons, inputs, cards, dialogs)
│   └── young-adults/                    # Young adult navigation and layout wrappers
├── data/                                # Centralized domain data and tier definitions
├── lib/                                 # Shared utilities & isomorphic fetch engines
│   ├── auth.ts                          # Legacy/mock auth types
│   ├── proxy.ts                         # Axios client and WebSocket configuration
│   ├── utility.ts                       # fortressFetch isomorphic admin courier
│   └── utils.ts                         # Tailwind clsx/twMerge utility
├── public/                              # Static media assets, icons, and hero illustrations
├── store/                               # Client State Management
│   ├── heal.tsx                         # HealContext (tier, nickname, stealth mode)
│   └── use-sidebar.tsx                  # Zustand store for drawer navigation
├── next.config.mjs                      # Next.js configuration and CSP security headers
├── package.json                         # Dependencies and build scripts
├── pnpm-lock.yaml                       # Pnpm dependency lockfile
├── proxy.ts                             # Next.js Edge proxy and session renewal engine
├── tailwind.config.mjs                  # Tailwind design system configuration
└── tsconfig.json                        # TypeScript configuration and path aliases (@/*)
```

---

## 🚀 Setup and Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (version `20.x` or higher recommended)
* [pnpm](https://pnpm.io/) (version `10.x` or `11.x`)

### 1. Clone the Repository
```bash
git clone https://github.com/amo2s/heal-her-frontend.git
cd heal-her-frontend/frontend
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file inside the `frontend/` directory:

```env
# GraphQL & Core Backend Service
BACKEND_URL=https://sliverboy-healher-backend.hf.space
NEXT_PUBLIC_BACKEND_URL=https://sliverboy-healher-backend.hf.space

# Cryptographic Handshake Secret between Next.js Proxy & Backend
FRONTEND_HANDSHAKE_SECRET=your_secret_handshake_key_here

# Go TOS Gateway (Optional Local Integration)
GO_GATEWAY_URL=http://localhost:8080
```

### 4. Run the Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the application.

### 5. Build for Production
To create an optimized production build:
```bash
pnpm build
pnpm start
```

---

## 🔒 Security & Privacy

HEAL-HER AI adheres to privacy-by-design standards:
* **No Client Token Storage**: JWTs and refresh tokens are strictly held in `HttpOnly` cookies.
* **Network Tab Masking**: All outgoing backend requests route through `/api/proxy/*`, shielding internal backend hostnames and headers from browser inspection.
* **Quick Camouflage**: The global keyboard listener ensures instant screen-camouflage via `Esc`.
* **Zero Logging of Sensitive Telemetry**: Audit logs are stripped of PII before cryptographic ledger recording.

---

## 📄 License
This project is proprietary and confidential. All rights reserved.
