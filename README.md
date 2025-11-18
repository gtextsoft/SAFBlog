# SAF Connect

> A modern, high-performance blog and content management platform for the Stephen Akintayo Foundation, empowering communities through education, sustainable development, and impactful storytelling.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.81-3ecf8e.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

SAF Connect is a comprehensive content management system designed to showcase the impactful work of the Stephen Akintayo Foundation. Built with modern web technologies, it provides a seamless experience for both content creators and readers, featuring a responsive design, optimized performance, and intuitive admin interface.

### Key Highlights

- ⚡ **Lightning-fast performance** with optimized queries and lazy loading
- 📱 **Fully responsive** design that works beautifully on all devices
- 🎨 **Modern UI/UX** built with shadcn/ui and Tailwind CSS
- 🔐 **Secure admin panel** for content management
- 📧 **Newsletter integration** for subscriber management
- 🔍 **Advanced search and filtering** capabilities
- 📊 **SEO optimized** with structured data and meta tags

---

## ✨ Features

### Public Features
- **Blog System**: Browse posts by category, tags, or search
- **Post Details**: Rich content display with reading time estimation
- **Category & Tag Filtering**: Easy navigation through content
- **Newsletter Signup**: Subscribe to receive updates
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **SEO Optimization**: Structured data and meta tags for better discoverability

### Admin Features
- **Content Management**: Create, edit, and publish blog posts
- **Category & Tag Management**: Organize content efficiently
- **Subscriber Management**: View and manage newsletter subscribers
- **Rich Text Editor**: Full-featured post editor with markdown support
- **Media Management**: Upload and manage cover images
- **Analytics Dashboard**: Track content performance

---

## 🛠 Tech Stack

### Core Technologies
- **[React 18.3](https://react.dev/)** - Modern UI library
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite 5.4](https://vitejs.dev/)** - Next-generation build tool
- **[React Router 6.3](https://reactrouter.com/)** - Client-side routing

### UI & Styling
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database

### Additional Libraries
- **[React Hook Form](https://react-hook-form.com/)** - Performant form management
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[date-fns](https://date-fns.org/)** - Modern date utility library
- **[React Markdown](https://remarkjs.github.io/react-markdown/)** - Markdown rendering
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) or **bun** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Recommended: Using nvm

If you manage multiple Node.js versions, we recommend using [nvm](https://github.com/nvm-sh/nvm):

```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd saf-connect
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using bun (faster):
```bash
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: Get your Supabase credentials from your [Supabase Dashboard](https://app.supabase.com/)

### 4. Run Database Migrations

Ensure your Supabase database is set up with the required tables. Migrations are located in `supabase/migrations/`.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
saf-connect/
├── public/                 # Static assets
│   ├── logos/             # Foundation logos
│   └── favicons/          # Favicon files
├── src/
│   ├── components/        # React components
│   │   ├── admin/         # Admin-specific components
│   │   ├── blog/          # Blog-related components
│   │   ├── layout/        # Layout components (Header, Footer)
│   │   ├── newsletter/    # Newsletter components
│   │   ├── seo/           # SEO components
│   │   └── ui/            # Reusable UI components (shadcn/ui)
│   ├── hooks/              # Custom React hooks
│   ├── integrations/      # Third-party integrations
│   │   └── supabase/      # Supabase client configuration
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin pages
│   │   └── ...            # Public pages
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── supabase/
│   └── migrations/        # Database migrations
├── .env.local             # Environment variables (not in git)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── vite.config.ts         # Vite configuration
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Security Note**: Never commit `.env.local` to version control. It's already included in `.gitignore`.

---

## 💻 Development

### Code Style

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** (recommended) for code formatting

### Best Practices

1. **Component Organization**: Keep components focused and reusable
2. **Type Safety**: Always use TypeScript types and interfaces
3. **Performance**: Use React.memo, useMemo, and useCallback where appropriate
4. **Accessibility**: Follow WCAG guidelines for accessible components
5. **SEO**: Use proper semantic HTML and meta tags

### Performance Optimizations

- ✅ Debounced search queries (500ms delay)
- ✅ Parallel database queries where possible
- ✅ Request cancellation to prevent race conditions
- ✅ Optimized image loading with lazy loading
- ✅ Code splitting and lazy loading routes
- ✅ Efficient pagination

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

#### Option 1: Deploy via Lovable
1. Open your [Lovable Project](https://lovable.dev/projects/032d9ab8-9779-48d9-aa6e-473dcd4d2a2a)
2. Navigate to **Share → Publish**
3. Follow the deployment wizard

#### Option 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option 3: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Option 4: Custom Domain

To connect a custom domain:
1. Navigate to **Project → Settings → Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration instructions

For detailed instructions, see: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Workflow

1. Make changes locally or via your IDE
2. Test thoroughly in development mode
3. Run linting: `npm run lint`
4. Build to check for errors: `npm run build`
5. Commit and push changes

### Code Review Guidelines

- Ensure all tests pass
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed
- Keep commits atomic and meaningful

---

## 📝 License

This project is proprietary software developed for the Stephen Akintayo Foundation.

---

## 📞 Support

For questions, issues, or contributions:
- **Issues**: Open an issue on GitHub
- **Documentation**: Check the inline code comments
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vite](https://vitejs.dev/) for the excellent build tooling
- [React](https://react.dev/) team for the amazing framework

---

**Built with ❤️ for the Stephen Akintayo Foundation**
