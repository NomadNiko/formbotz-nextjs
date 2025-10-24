# FormBotz

Transform traditional forms into engaging conversational experiences. FormBotz makes data collection feel like a natural chat conversation, leading to higher completion rates and better user engagement.

**Think Typeform meets ChatGPT** — with unlimited customization and full control over your data.

---

## ✨ Key Features

- 🎯 **Conversational UI** - Chat-style interface that feels natural and engaging
- 🔀 **Conditional Logic** - Show/hide steps and branch flows based on answers
- 💬 **Variable Interpolation** - Personalize messages with collected data
- 🔄 **Replay Steps** - Let users review and change previous answers
- 📊 **Analytics Dashboard** - Track completion rates, drop-off points, and trends
- 📥 **Export Data** - Download submissions as CSV or JSON
- 🎨 **Custom Branding** - Match your brand colors and style
- 🌙 **Dark Mode** - Full dark mode support
- 🔐 **Secure** - Built-in authentication with bcrypt and JWT

**Tech Stack:** Next.js 15 · React 19 · TypeScript · MongoDB · Tailwind CSS v4 · Flowbite React

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun 1.0+
- MongoDB (local or cloud)

### Installation

```bash
# Clone repository
git clone https://github.com/NomadNiko/formbotz-nextjs.git
cd formbotz-nextjs

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### Environment Setup

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/formbotz
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

Generate secret:
```bash
openssl rand -base64 32
```

### Run Development Server

```bash
npm run dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

---

## 📖 Documentation

### Getting Started
- **[Step Types Guide](./docs/step-types.md)** - Learn about all 6 step types including the new Replay step
- **[Conditional Logic Guide](./docs/conditional-logic.md)** - Create branching flows and dynamic forms
- **[Variable Interpolation Guide](./docs/variable-interpolation.md)** - Personalize messages and validate usage

### Advanced Topics
- **[Deployment Guide](./docs/deployment.md)** - Deploy to Vercel, Railway, or VPS with maintenance mode
- **[Database Schema](./docs/database-schema.md)** - MongoDB collections and data structure
- **[API Reference](./docs/api-reference.md)** - Complete API endpoint documentation

### Component Library
- **[Flowbite Components](./FLOWBITE_COMPONENTS.md)** - UI component reference and examples

---

## 🎯 How It Works

### 1. Create Your Form
Build forms using 6 step types:
- **Info** - Display messages
- **Multiple Choice** - Predefined options
- **Yes/No** - Binary choices
- **String Input** - Text, email, numbers
- **Replay** - Re-collect previous answers
- **Closing** - Thank you message

### 2. Add Logic & Personalization
- **Conditional Logic** - Show steps only when conditions are met
- **Branching** - Route users to different paths based on answers
- **Variables** - Insert collected data into messages: `"Thanks, {{userName}}!"`
- **Validation** - Required fields, email format, min/max length, regex patterns

### 3. Share & Collect
- Get a unique public URL: `yourdomain.com/chat/your-form`
- Share via email, social media, or embed on your site
- View real-time submissions in the dashboard
- Export data as CSV or JSON

---

## 🏗️ Project Structure

```
formbotz-nextjs/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login & registration
│   ├── (dashboard)/       # Protected dashboard
│   │   └── dashboard/
│   │       ├── forms/     # Form builder & management
│   │       └── submissions/
│   ├── (public)/          # Public chat interface
│   │   └── chat/[publicUrl]/
│   └── api/               # API routes
├── components/            # React components
│   ├── builder/          # Form builder UI
│   ├── chat/             # Chat interface
│   └── layout/           # Nav, sidebar, etc.
├── lib/
│   ├── db/models/        # Mongoose schemas
│   ├── auth/             # Auth utilities
│   └── utils/            # Helpers (validation, interpolation, etc.)
├── docs/                 # Documentation
└── types/                # TypeScript definitions
```

---

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Code formatting
npm run format
npm run format:check
```

---

## 🚀 Deployment

### Quick Deploy (Vercel - Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Self-Hosted (VPS)
Full deployment guide with nginx, PM2, SSL, and maintenance mode:

**[📘 Read Deployment Guide](./docs/deployment.md)**

Includes:
- Zero-downtime maintenance mode
- PM2 process management
- Nginx reverse proxy setup
- SSL certificate configuration
- Automated deployment workflows

---

## 📊 What's New

### Recent Updates

**v1.1.0** (Latest)
- ✨ **Replay Steps** - Let users change previous answers
- ✅ **Message Variable Validation** - Warns about undefined variables
- 🔧 **Maintenance Mode** - Zero-downtime deployments with nginx
- 🐛 **Mobile UI Fixes** - Improved chat scrolling and layout

**v1.0.0**
- 🎉 Initial release
- ✅ Form builder with conditional logic
- ✅ Chat interface with variable interpolation
- ✅ Submission management with CSV/JSON export
- ✅ Analytics dashboard
- ✅ Full authentication system

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - Free to use for personal and commercial projects.

---

## 💬 Support

- 📧 **Email:** support@formbotz.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/NomadNiko/formbotz-nextjs/issues)
- 📖 **Docs:** [Documentation](./docs/)
- 💼 **Enterprise:** Contact for custom solutions

---

## 🙏 Built With

- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - ODM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Flowbite React](https://flowbite-react.com/) - UI components

---

**⭐ If you find FormBotz useful, please consider giving it a star on GitHub!**
