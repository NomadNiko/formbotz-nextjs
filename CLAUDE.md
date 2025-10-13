# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FormBotz** is a conversational form builder that presents forms as chatbot-style interfaces. Users fill out forms by answering questions one at a time in a chat-like experience, similar to Typeform but with more flexibility for branching logic and variable interpolation.

This is a Next.js 15 application built with React 19, TypeScript, Tailwind CSS v4, MongoDB, and Flowbite React components. Uses Next.js App Router architecture.

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint

# Format code
pnpm format

# Check formatting without changes
pnpm format:check
```

## Architecture

### App Router Structure
- Uses Next.js App Router (not Pages Router)
- Routes are defined by folder structure in `app/` directory
- `app/layout.tsx` - Root layout with Geist fonts, Flowbite theme initialization
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles

### Flowbite React Integration
- Flowbite React is integrated via Next.js plugin (`flowbite-react/plugin/nextjs`)
- Configuration in `.flowbite-react/` directory (auto-generated, do not edit manually)
- Theme initialization via `<ThemeInit />` component in root layout
- `<ThemeModeScript />` required in `<head>` for dark mode support
- Dark mode toggle available via `<DarkThemeToggle />` component

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to root directory
- Module resolution: bundler (Next.js optimized)

### Styling
- Tailwind CSS v4 with PostCSS
- Prettier configured with `prettier-plugin-tailwindcss` for automatic class sorting
- Custom Tailwind configuration in Prettier: `tailwindAttributes: ["theme"]`, `tailwindFunctions: ["twMerge", "createTheme"]`

### Fonts
- Geist Sans and Geist Mono from Google Fonts
- Variable fonts configured with CSS variables (`--font-geist-sans`, `--font-geist-mono`)

## Key Dependencies

- **next**: ^15.4.2
- **react**: ^19.1.0
- **flowbite-react**: ^0.12.4 (React UI component library)
- **flowbite**: ^3.1.2 (Vanilla JavaScript UI library)
- **tailwindcss**: ^4.1.11

## Flowbite Components

This project uses both **Flowbite React** and **vanilla Flowbite** for UI components.

### Flowbite React Components (Recommended)
Use these React-native components for seamless integration:
- **Layout:** Card, Table, Navbar, Sidebar
- **Forms:** Button, TextInput, Checkbox, Radio, Select, Textarea, ToggleSwitch
- **Feedback:** Toast, Alert, Modal, Spinner
- **Navigation:** Dropdown, Tabs, Pagination, Breadcrumb
- **Display:** Badge, Avatar, Rating

Import example:
```jsx
import { Button, Card, Modal } from "flowbite-react";
```

### Vanilla Flowbite Components
Use these for components not available in React version:
- **Chat Bubble** - Chat interfaces with messages, attachments, actions
- **Timeline** - Chronological data display
- **Drawer** - Off-canvas sidebar (left/right/top/bottom)
- **Accordion** - Collapsible content sections
- **Datepicker** - Calendar date selection
- **Progress** - Loading/completion indicators

These require `'use client'` directive and JavaScript initialization:
```tsx
'use client';
import { initFlowbite } from 'flowbite';
```

### Complete Documentation
See **[FLOWBITE_COMPONENTS.md](./FLOWBITE_COMPONENTS.md)** for:
- Detailed API documentation for all components
- Complete code examples
- Props and configuration options
- Integration patterns for React and vanilla components
- Best practices and usage guidelines

### Quick Reference Links
- Flowbite React Docs: https://flowbite-react.com/docs/components/accordion
- Vanilla Flowbite Docs: https://flowbite.com/docs/components/alerts/
- Browse the sidebar navigation on either site to discover all available components

## Application Architecture

### Database Models (Mongoose + MongoDB)

Located in `lib/db/models/`:

**User Model:**
- Email, password (hashed with bcryptjs)
- Role (client/admin)
- Subscription info (plan limits, form/submission counts)

**Form Model:**
- Complex nested schema for steps with conditional logic
- Steps array containing display, input, and flow control configuration
- Support for variable interpolation, conditional branching
- Public URL for sharing
- Stats tracking (views, starts, completions)

**Submission Model:**
- Links to Form via formId
- Session-based tracking
- Step history with timestamps
- Dynamic data storage (Map of key-value pairs)
- Conversion tracking and time-per-step analytics

### Authentication (NextAuth.js)

- Credentials provider with email/password
- Session management with JWT
- Protected routes using `requireAuth()` utility
- Custom session types with user ID and role

### Core Application Structure

```
/app
  /(auth)
    /login         - Login page
    /register      - Registration page
  /(dashboard)
    /dashboard     - Dashboard home with stats
    /forms         - Forms list (TODO)
    /submissions   - Submissions list (TODO)
  /(public)
    /chat/[url]    - Public chat interface (TODO)
  /api
    /auth
      /[...nextauth]  - NextAuth handler
      /register       - User registration endpoint
```

### Key Features Implemented

✅ User authentication and registration
✅ Database models with validation
✅ Dashboard layout with sidebar navigation
✅ Landing page with feature showcase
✅ Session management and protected routes

### TODO: Core Features

- [ ] Forms list dashboard with CRUD operations
- [ ] Form builder UI with step editor
- [ ] Variable interpolation engine
- [ ] Conditional logic evaluator
- [ ] Chat interface for end users
- [ ] Submission collection and storage
- [ ] Submissions dashboard with export
- [ ] CSV export functionality

## Environment Variables

Required in `.env`:
```
MONGODB_URI=<your-mongodb-connection-string>
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000
```

## Git Status

This is a new/uninitialized repository. All files are currently untracked.
