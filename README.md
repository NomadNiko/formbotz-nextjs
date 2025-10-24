# FormBotz

A conversational form builder that presents forms as chat interfaces. Create dynamic, branching forms with conditional logic and variable interpolation.

**Tech Stack:** Next.js 15, React 19, TypeScript, MongoDB, Tailwind CSS v4

---

## Features

- Chat-style form interface with typing indicators
- Conditional logic (show/hide steps, branching flows)
- Variable interpolation for personalized messages
- Replay steps to re-collect previous answers
- CSV/JSON export of submissions
- Analytics dashboard with completion rates
- Custom branding and dark mode

---

## Quick Start

### Prerequisites
- Node.js 18+ or Bun 1.0+
- MongoDB

### Installation

```bash
git clone https://github.com/NomadNiko/formbotz-nextjs.git
cd formbotz-nextjs
npm install
```

### Configuration

Create `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/formbotz
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### Run

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

Visit http://localhost:3000

---

## Documentation

- [Step Types](./docs/step-types.md) - Form step configuration
- [Conditional Logic](./docs/conditional-logic.md) - Branching and show/hide
- [Variables](./docs/variable-interpolation.md) - Personalization syntax
- [Deployment](./docs/deployment.md) - Production setup
- [Database Schema](./docs/database-schema.md) - MongoDB structure
- [API Reference](./docs/api-reference.md) - REST endpoints

---

## Project Structure

```
formbotz-nextjs/
├── app/
│   ├── (auth)/              # Login/register
│   ├── (dashboard)/         # Form builder, submissions
│   ├── (public)/            # Public chat interface
│   └── api/                 # REST API routes
├── components/
│   ├── builder/             # Form editor UI
│   └── chat/                # Chat interface components
├── lib/
│   ├── db/models/           # Mongoose schemas
│   └── utils/               # Validation, interpolation
└── docs/                    # Documentation
```

---

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables
3. Deploy

### Self-Hosted
See [Deployment Guide](./docs/deployment.md) for:
- VPS setup with Nginx and PM2
- SSL configuration
- Zero-downtime maintenance mode
- Automated deployments

---

## Recent Updates

**v1.1.0**
- Replay steps for re-collecting answers
- Variable validation warnings
- Maintenance mode for deployments
- Mobile UI improvements

**v1.0.0**
- Initial release with form builder
- Conditional logic and branching
- Submission management
- Analytics dashboard

---

## License

MIT License

---

## Links

- [Documentation](./docs/)
- [Issues](https://github.com/NomadNiko/formbotz-nextjs/issues)
- [Contributing Guidelines](./docs/README.md#contributing-to-docs)
