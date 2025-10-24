# FormBotz Documentation

Complete documentation for building, deploying, and using FormBotz.

---

## 📚 Documentation Index

### Getting Started Guides

These guides help you understand core FormBotz concepts and build your first forms.

| Guide | Description |
|-------|-------------|
| **[Step Types Guide](./step-types.md)** | Learn about all 6 step types: Info, Multiple Choice, Yes/No, String Input, Replay, and Closing. Includes configuration examples and best practices. |
| **[Conditional Logic Guide](./conditional-logic.md)** | Master show/hide logic and branching flows. Create dynamic forms that adapt based on user answers. |
| **[Variable Interpolation Guide](./variable-interpolation.md)** | Personalize messages with collected data. Includes variable syntax, validation, and troubleshooting. |

### Advanced Topics

Deep-dive guides for production deployment and system architecture.

| Guide | Description |
|-------|-------------|
| **[Deployment Guide](./deployment.md)** | Complete deployment instructions for Vercel, Railway, or self-hosted VPS. Includes nginx setup, PM2 process management, SSL configuration, and zero-downtime maintenance mode. |
| **[Database Schema](./database-schema.md)** | MongoDB collections reference including Users, Forms, and Submissions schemas. Query examples and indexing strategies. |
| **[API Reference](./api-reference.md)** | Complete REST API documentation with request/response examples for all endpoints. |

### Component Reference

| Guide | Description |
|-------|-------------|
| **[Flowbite Components](../FLOWBITE_COMPONENTS.md)** | UI component library reference with code examples for all Flowbite React and vanilla Flowbite components. |

---

## 🎯 Quick Navigation by Task

### I want to...

**Build My First Form**
1. Start with [Step Types Guide](./step-types.md)
2. Learn [Variable Interpolation](./variable-interpolation.md)
3. Add [Conditional Logic](./conditional-logic.md)

**Deploy to Production**
1. Follow [Deployment Guide](./deployment.md)
2. Configure environment variables
3. Set up maintenance mode (optional)

**Integrate with API**
1. Review [API Reference](./api-reference.md)
2. Check [Database Schema](./database-schema.md)
3. Build your integration

**Understand Data Model**
1. Read [Database Schema](./database-schema.md)
2. Review [API Reference](./api-reference.md)

**Customize UI**
1. Check [Flowbite Components](../FLOWBITE_COMPONENTS.md)
2. Modify component styles
3. Update theme settings

---

## 📖 Guide Summaries

### Step Types Guide
Comprehensive reference for all step types in FormBotz:
- **Info** - Display-only messages
- **Multiple Choice** - User selects from options
- **Yes/No** - Binary true/false questions
- **String Input** - Text, email, phone, numbers
- **Replay** - Re-display and re-collect previous steps
- **Closing** - Thank you messages

**Key Topics:**
- Output types (String, Image, Carousel, Links, Buttons)
- Data collection configuration
- Validation rules
- Tips for choosing step types

---

### Conditional Logic Guide
Learn to create dynamic, branching forms:
- **Show/Hide Logic** - Display steps based on conditions
- **Branching** - Route users to different paths
- **Operators** - equals, contains, greaterThan, in, etc.
- **Logical Operators** - AND/OR combinations

**Key Topics:**
- Condition syntax
- Variable availability rules
- Complex conditional examples
- Validation and troubleshooting

---

### Variable Interpolation Guide
Personalize messages with user data:
- **Syntax** - `{{variableName}}`
- **Variable Naming** - Best practices
- **Availability** - When variables can be used
- **Validation** - Automatic warning system

**Key Topics:**
- Data type formatting
- Empty variable handling
- Conditional display with variables
- Advanced usage patterns

---

### Deployment Guide
Production deployment instructions:
- **Platforms** - Vercel, Railway, DigitalOcean, VPS
- **Environment Setup** - MongoDB, secrets, SSL
- **Nginx Configuration** - Reverse proxy setup
- **Maintenance Mode** - Zero-downtime deployments
- **PM2** - Process management
- **Security** - Best practices and checklist

**Key Topics:**
- Step-by-step VPS setup
- Automated deployment workflows
- Monitoring and logging
- Performance optimization
- Backup strategies

---

### Database Schema
MongoDB collection reference:
- **Users** - Authentication and subscriptions
- **Forms** - Form definitions with steps
- **Submissions** - User responses and analytics

**Key Topics:**
- Schema structure
- Indexes and performance
- Query examples
- Backup and restore
- Data privacy (GDPR)

---

### API Reference
Complete REST API documentation:
- **Authentication** - Register, login, session
- **Forms API** - CRUD operations
- **Submissions API** - View and export data
- **Chat API** - Public form interface

**Key Topics:**
- Request/response formats
- Error codes
- Rate limiting (future)
- Webhook support (planned)

---

## 🔗 External Resources

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs) - Next.js framework
- [React Docs](https://react.dev/) - React library
- [MongoDB Manual](https://docs.mongodb.com/) - Database
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Styling
- [Flowbite React](https://flowbite-react.com/docs) - Components

### Tutorials & Guides
- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

---

## 🆘 Getting Help

### Documentation Not Clear?
- 📧 Email: support@formbotz.com
- 🐛 Report issue: [GitHub Issues](https://github.com/yourusername/formbotz-nextjs/issues)
- 💬 Suggest improvement: Open a PR

### Found a Bug?
1. Check [GitHub Issues](https://github.com/yourusername/formbotz-nextjs/issues)
2. Search for similar issues
3. Open new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Feature Request?
1. Check existing issues for similar requests
2. Open new issue with `[Feature Request]` prefix
3. Describe use case and expected behavior
4. Suggest implementation if possible

---

## 📝 Contributing to Docs

Documentation improvements are welcome!

**How to Contribute:**
1. Fork repository
2. Edit markdown files in `/docs`
3. Submit pull request
4. Describe changes in PR description

**Guidelines:**
- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Test all code snippets
- Follow existing formatting

---

## 📄 License

Documentation is licensed under [MIT License](../LICENSE) - same as the main project.

---

**Need something not covered here?** [Open an issue](https://github.com/yourusername/formbotz-nextjs/issues) and we'll add it!
