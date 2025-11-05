# NICE AI Dashboard Demo## 🚀 Live Demo



A modern, feature-rich dashboard application built with Next.js for analyzing customer interactions, coaching agents, and monitoring performance metrics.The dashboard is deployed on Vercel:  

👉 [https://ni-ce-ai-dashboar-demo.vercel.app](https://ni-ce-ai-dashboar-demo.vercel.app)

## 🚀 Live Demo

[![Vercel](https://img.shields.io/badge/deployed-Vercel-brightgreen?logo=vercel)](https://ni-ce-ai-dashboar-demo.vercel.app)

The dashboard is deployed on Vercel:  

👉 [https://ni-ce-ai-dashboar-demo.vercel.app](https://ni-ce-ai-dashboar-demo.vercel.app)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

[![Vercel](https://img.shields.io/badge/deployed-Vercel-brightgreen?logo=vercel)](https://ni-ce-ai-dashboar-demo.vercel.app)

## How to set up your IDE (VS Code)

## ✨ Features

Follow these steps to get the project running locally so you can code on it too.

- **📊 Analytics Dashboard** - Comprehensive analytics with customizable KPI cards and data visualizations

- **🎯 Interactions Management** - View and analyze customer interactions with sentiment analysis---

- **👥 Coaching Module** - Agent coaching tools with performance tracking

- **📋 Evaluations** - Quality assurance and evaluation workflows### 🖥️ Windows Setup 

- **📁 Protocol Management** - Configure and manage evaluation protocols and questions

- **🎵 Audio Player** - Advanced audio playback with waveform visualization1. **Install prerequisites**

- **🌓 Dark Mode** - Full dark mode support with custom theme styling   - [Git](https://git-scm.com/download/win)  

- **📱 Responsive Design** - Optimized for desktop and mobile devices   - [Node.js 20+](https://nodejs.org/en/download/)  

- **🔐 Authentication** - Secure login and registration system   - [Visual Studio Code](https://code.visualstudio.com/Download)  



## 🛠️ Tech Stack2. **Clone this repo**

   Open **PowerShell** (or Git Bash) and run:

- **Framework:** [Next.js 15](https://nextjs.org) with App Router   ```bash

- **Language:** TypeScript   git clone https://github.com/dreuxhebert/NiCE_AI_Dashboar_Demo.git

- **Styling:** Tailwind CSS v4 with custom design tokens   cd NiCE_AI_Dashboar_Demo

- **UI Components:** Custom component library with shadcn/ui

- **Animations:** tw-animate-css 3. Open the project in VS Code

- **Grid Layout:** react-grid-layout for draggable dashboards

- **State Management:** React hookscode .

- **Deployment:** Vercel



## 📁 Project Structure 4. Install dependencies

    

``` npm ci

src/

├── app/                      # Next.js App Router pages(If npm ci doesn’t work, use npm install instead.)

│   ├── (dashboard)/         # Dashboard routes

│   │   ├── overview/        # Main dashboard overview

│   │   ├── analytics/       # Analytics page 5. Run the dev server

│   │   ├── analyticsv2/     # Enhanced analytics

│   │   ├── interactions/    # Interaction managementnpm run dev

│   │   ├── coaching/        # Coaching module

│   │   ├── evaluations/     # Evaluation workflowsThis will start the app on http://localhost:3000

│   │   ├── protocols/       # Protocol configuration

│   │   ├── settings/        # Application settings

│   │   └── upload/          # File upload interfaceYou can now edit files in VS Code, and the page will auto-refresh as you save changes. 

│   ├── auth/                # Authentication pages

│   └── api/                 # API routes

├── components/              # Reusable React componentsImportant: ⚡ About Vercel

│   ├── ui/                  # Base UI components

│   └── ...                  # Feature components

├── hooks/                   # Custom React hooksPushing changes to the main branch on GitHub will automatically redeploy the production site on Vercel.

└── lib/                     # Utility functions and dataUse npm run dev locally for testing before pushing to GitHub.

```

## 🖥️ Local Development Setup

### Prerequisites

- [Git](https://git-scm.com/download/win)
- [Node.js 20+](https://nodejs.org/en/download/)
- [Visual Studio Code](https://code.visualstudio.com/Download) (recommended)

### Installation

1. **Clone the repository**
   ```powershell
   git clone https://github.com/dreuxhebert/NiCE_AI_Dashboar_Demo.git
   cd NiCE_AI_Dashboar_Demo
   ```

2. **Install dependencies**
   ```powershell
   npm ci
   ```
   *Note: If `npm ci` fails, use `npm install` instead.*

3. **Run the development server**
   ```powershell
   npm run dev
   ```

4. **Open your browser**  
   Navigate to [http://localhost:3000](http://localhost:3000)

The development server supports hot reloading - changes to files will automatically refresh the page.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Theme & Styling

The application features a custom design system with:
- **Brand Colors:** ElevateAI primary blue (#3087DF)
- **Dark Mode:** Sophisticated navy and steel blue palette
- **Custom Components:** Fully styled UI component library
- **Responsive Grid:** Draggable and resizable dashboard widgets

Theme tokens are defined in `src/app/globals.css` and use Oklahoma LCH color space for perceptually uniform colors.

## 🚢 Deployment

The project is configured for automatic deployment on Vercel:

- **Production:** Pushing to `main` branch triggers automatic deployment
- **Preview:** Pull requests generate preview deployments
- **Environment:** Vercel automatically configures the Next.js environment

### Manual Deployment

```powershell
npm run build
npm run start
```

## 📝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally with `npm run dev`
4. Submit a pull request

## 📄 License

This project is proprietary software developed for NICE Ltd.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Platform](https://vercel.com)

---

**Built with ❤️ by the NICE AI Team**
