# Delta API Suite

> **Professional API Comparison & Testing Platform**  
> Advanced JSON diff analysis with intelligent order-insensitive comparison

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

## 🚀 Overview

Delta API Suite is a comprehensive API comparison and testing platform designed for QA engineers and developers. It provides powerful tools for API analysis:

- **🔍 DeltaPro+**: Advanced single API comparison with intelligent diff analysis
- **🏗️ DeltaBulkPro**: Bulk API testing across multiple platforms and environments

## ✨ Key Features

### 🎯 Advanced Comparison Engine
- **Order-Insensitive JSON Comparison** - Semantic matching regardless of array order
- **Intelligent Similarity Matching** - 3-phase algorithm with 95%/70% thresholds
- **Severity Classification** - Critical/High/Medium/Low diff categorization
- **Real-time Processing** - Instant analysis with professional UI

### 🌍 Multi-Platform Testing
- **Platform Support** - iOS, Android, Mobile Web, Desktop
- **Geo-Location Testing** - Multi-region API comparison (IN, US, CA, AE)
- **Custom Headers** - Platform-specific authentication and configuration
- **Retry Logic** - Network resilience with configurable retry policies

### 📊 Professional Reporting
- **Interactive Monaco Diff Viewer** - Side-by-side JSON comparison
- **Visual Diff Trees** - Expandable diff item visualization
- **Comprehensive Summaries** - Statistical analysis with severity breakdown
- **Export Capabilities** - JSON download and report sharing

## 🏗️ Architecture

```
├── apps/
│   ├── frontend/          # React + TypeScript + Vite
│   │   ├── src/pages/     # Main application pages
│   │   ├── src/components/# Reusable UI components
│   │   └── src/services/  # API integration layer
│   └── backend/           # Node.js + Express API
│       ├── src/comparator.js  # Bulk comparison engine
│       ├── src/server.js      # API endpoints
│       └── src/utils.js       # Helper functions
├── docs/                  # Project documentation
└── config/               # Shared configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/subhadip-unn/CBZ-API-Delta-web.git
   cd CBZ-API-Delta-web
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd apps/frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd apps/frontend
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in both frontend and backend directories:

**Frontend (.env.local)**
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_APP_NAME=Delta API Suite
```

**Backend (.env.local)**
```env
PORT=3001
NODE_ENV=development
```

## 📖 Usage

### DeltaPro+ (Single API Comparison)
1. Navigate to the DeltaPro+ tool in the sidebar
2. Configure your API endpoints (Live vs New)
3. Add headers and authentication
4. Fetch both endpoints
5. Compare with advanced diff analysis

### DeltaBulkPro (Bulk API Testing)
1. Go to Config Editor
2. Set up endpoints, headers, and platforms
3. Configure comparison jobs
4. Run bulk comparison
5. View comprehensive reports

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/compare` | Run bulk API comparison |
| `GET` | `/api/reports` | List all reports |
| `GET` | `/api/reports/:id` | Get specific report |
| `POST` | `/api/upload-report` | Upload custom report |
| `POST` | `/api/proxy-fetch` | CORS proxy for external APIs |

## 🎨 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Professional component library
- **Monaco Editor** - Advanced code editor
- **Framer Motion** - Smooth animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **In-memory Storage** - No database dependency

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the QA engineering community
- Inspired by the need for better API testing tools
- Special thanks to all contributors and testers

---

**Made with ❤️ by the Delta API Suite Team**