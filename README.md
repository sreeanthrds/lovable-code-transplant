
# TradeLayout - Strategy Builder

A professional trading strategy builder and backtesting platform built with modern web technologies.

## Features

- Visual strategy builder with drag-and-drop interface
- Advanced backtesting capabilities
- Multiple indicator support
- Real-time market data integration
- Position management and tracking
- Alert system for strategy signals

## Technologies Used

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase
- **Charts**: Recharts
- **Flow Editor**: React Flow

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd tradelayout
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
├── integrations/      # Third-party service integrations
└── layouts/           # Layout components
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Components

- **Strategy Builder**: Visual flow-based strategy creation
- **Backtesting Engine**: Historical strategy performance analysis
- **Node System**: Modular strategy components (Entry, Exit, Signals, etc.)
- **Condition Builder**: Advanced condition creation with multiple data sources

## Deployment

The application can be deployed to any static hosting service that supports single-page applications.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.
