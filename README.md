# Cryptoed

A stunning ASCII art crypto dashboard with real-time data visualization, built with Next.js, Three.js, and TypeScript.

## Features

- **ASCII Art Visualization**: Beautiful ASCII text rendering with Three.js shaders
- **Real-time Crypto Data**: Live cryptocurrency price data and charts
- **Matrix Background**: Animated matrix-style background effects
- **RSS News Feed**: Real-time crypto news from multiple sources
- **Responsive Design**: Fully responsive across all devices
- **Interactive Elements**: Mouse-responsive animations and effects

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js
- **Charts**: Recharts
- **Data**: Yahoo Finance API, RSS feeds
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jackhemignton/cryptoed.git
cd cryptoed
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── app/            # Main app page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   └── ui/            # UI components
│       ├── ascii-text.tsx      # ASCII art text renderer
│       ├── crypto-chart-fixed.tsx  # Crypto price charts
│       ├── matrix-background.tsx   # Matrix animation
│       └── rss-news.tsx        # RSS news feed
└── lib/               # Utility functions
    └── utils.ts       # Helper functions
```

## Key Components

### ASCII Text Component
Renders text as ASCII art using Three.js shaders with wave animations and mouse interaction.

### Crypto Chart Component
Displays real-time cryptocurrency price data with interactive charts and price statistics.

### Matrix Background
Animated matrix-style background with falling characters and glow effects.

### RSS News Feed
Aggregates crypto news from multiple RSS sources with real-time updates.

## API Integration

- **Yahoo Finance API**: Real-time cryptocurrency price data
- **RSS Feeds**: News from CoinDesk, Cointelegraph, Decrypt, and more
- **CORS Proxy**: Handles cross-origin requests for external APIs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Live Demo

Visit the live application at: [https://cryptoed.vercel.app](https://cryptoed.vercel.app)

## Acknowledgments

- Three.js for 3D graphics
- Recharts for data visualization
- Tailwind CSS for styling
- Next.js for the framework
