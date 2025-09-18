# 🚀 Delta API Suite

> **Professional API Testing & Comparison Tool**  
> Built for Cricbuzz by developers, for developers.

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.16.16-0055FF?style=flat-square&logo=framer)](https://www.framer.com/motion/)

## ✨ Features

- 🎯 **API Journey** - Explore and test APIs from your configuration
- 🔧 **Ad-hoc Compare** - Build custom requests with Postman-like interface
- 📄 **Paste Response** - Compare responses directly by pasting JSON data
- 🎨 **Modern UI/UX** - Professional design with Cricbuzz branding
- 🌙 **Dark Mode** - Beautiful dark theme with smooth transitions
- ⚡ **Performance** - Optimized for speed and efficiency
- 📱 **Responsive** - Works perfectly on mobile and desktop
- 🔒 **Secure** - CORS-free proxy with enterprise security

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cbz-api-delta-new
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── deltapro/          # Main application page
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── modes/            # Feature-specific components
│   ├── delta-logo.tsx    # Custom logo components
│   └── theme-provider.tsx # Theme management
├── lib/                   # Utility functions
│   ├── api-library.ts    # API configuration
│   ├── comparison-engine.ts # Core comparison logic
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## 🎨 Design System

### Brand Colors

- **Cricbuzz Green**: `#53936F` - Primary brand color
- **Delta Purple**: `#6366f1` - Secondary accent color
- **Neutral Grays**: Professional grayscale palette

### Typography

- **Primary Font**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono
- **Font Loading**: Optimized with `next/font`

### Components

Built with [shadcn/ui](https://ui.shadcn.com/) and enhanced with:
- Custom animations using Framer Motion
- Responsive design patterns
- Accessibility-first approach
- Dark mode support

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Analysis
pnpm analyze      # Analyze bundle size
```

### Performance Monitoring

The app includes built-in performance monitoring in development mode:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay) 
- **CLS** (Cumulative Layout Shift)
- **FCP** (First Contentful Paint)
- **TTFB** (Time to First Byte)

### Code Quality

- **TypeScript** - Strict type checking
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting (recommended)
- **Husky** - Git hooks (optional)

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Docker

```bash
# Build image
docker build -t delta-api-suite .

# Run container
docker run -p 3000:3000 delta-api-suite
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://apiprv.cricbuzz.com
NEXT_PUBLIC_APP_NAME=Delta API Suite
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Breakpoints** - sm, md, lg, xl, 2xl
- **Touch Friendly** - 44px minimum touch targets
- **Accessible** - WCAG 2.1 AA compliant

## 🌙 Dark Mode

- **System Preference** - Follows OS theme
- **Manual Toggle** - User-controlled switching
- **Smooth Transitions** - Animated theme changes
- **Consistent Branding** - Maintains brand colors

## 🔒 Security

- **CORS Headers** - Properly configured
- **Content Security Policy** - XSS protection
- **Input Validation** - Sanitized user inputs
- **Rate Limiting** - API protection (configurable)

## 📊 Performance

- **Bundle Size** - Optimized with tree shaking
- **Code Splitting** - Dynamic imports for heavy components
- **Image Optimization** - Next.js Image component
- **Caching** - Strategic caching strategies
- **Core Web Vitals** - Optimized for Google metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary to Cricbuzz. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ by the Cricbuzz Team**