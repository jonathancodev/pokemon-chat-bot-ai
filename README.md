# PokéBot - AI-Powered Pokédex Chatbot

An AI-powered Pokédex chatbot built with Next.js that streams responses from Anthropic's Claude API. Ask about any Pokémon, get team building advice, and explore the world of Pokémon with an intelligent AI companion!

## Features

- **Real-time Streaming**: Responses stream directly from Anthropic's API for immediate feedback
- **Pokémon Data**: Comprehensive Pokémon information from PokéAPI including stats, types, abilities, and sprites
- **Team Builder**: AI-powered team building with strategic recommendations and type coverage analysis
- **Modern UI**: Beautiful, responsive chat interface with dark mode support
- **Server-side Security**: API keys safely stored server-side with no client exposure

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd pokemon-chat-bot-ai
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the root directory:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your API key from [Anthropic Console](https://console.anthropic.com/)

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture

### Core Components

- **`/api/chat/route.ts`**: Streaming API endpoint that handles Anthropic integration
- **`PokemonChatbot`**: Main chat interface with real-time streaming
- **`PokemonCard`**: Beautiful Pokémon data display component
- **`TeamDisplay`**: Strategic team visualization with analysis

### Tools Integration

1. **PokéAPI Tool**: Fetches comprehensive Pokémon data including:
   - Basic info (height, weight, types)
   - Stats and abilities
   - Sprites (normal and shiny)

2. **Team Builder Tool**: Creates strategic teams based on:
   - User concepts and preferences
   - Type coverage and synergy
   - Balanced stat distribution

### Streaming Implementation

- Uses Server-Sent Events (SSE) for real-time streaming
- Handles tool calls and responses seamlessly
- Maintains conversation context throughout the session

## Usage Examples

Try these prompts to explore PokéBot's capabilities:

- **Pokémon Info**: "Tell me about Charizard"
- **Team Building**: "Build me a balanced competitive team"
- **Strategic Analysis**: "Create a team focused on speed and offense"
- **Type Coverage**: "What are the best Water-type Pokémon for battles?"

## Project Structure

```
pokemon-chat-bot-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts           # Streaming API endpoint
│   │   ├── components/
│   │   │   ├── PokemonChatbot.tsx     # Main chat interface with streaming
│   │   │   ├── PokemonCard.tsx        # Pokémon data display component
│   │   │   └── TeamDisplay.tsx        # Team visualization component
│   │   ├── favicon.ico
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # App layout
│   │   └── page.tsx                   # Home page
│   ├── lib/
│   │   ├── anthropic-service.ts       # Anthropic API integration
│   │   ├── pokemon-service.ts         # Pokémon data & ranking logic
│   │   └── tool-executor.ts           # Tool execution handler
│   ├── config/
│   │   └── tools.ts                   # Tool definitions & system prompt
│   └── types/
│       ├── api.ts                     # API constants & error types
│       ├── chat.ts                    # Chat & streaming types
│       ├── pokemon.ts                 # Pokémon data types
│       ├── ui.ts                      # UI component types
│       └── index.ts                   # Type exports
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .gitignore
├── eslint.config.mjs
├── LICENSE
├── next.config.ts                     # Next.js config with image domains
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
├── tailwindcss.config.mjs
├── tsconfig.json
└── WRITEUP.md                         # Project analysis & roadmap
```

## Technical Details

- **Framework**: Next.js 15 with App Router
- **AI Integration**: Direct Anthropic API integration
- **Styling**: Tailwind CSS with custom components
- **Type Safety**: Full TypeScript implementation
- **Streaming**: Custom SSE implementation for real-time responses

## Deployment

The app is ready for deployment on Vercel, Netlify, or any platform supporting Next.js:

1. Set environment variables in your deployment platform
2. Deploy using your platform's standard Next.js deployment process

## Environment Variables

Required environment variables:

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude access

## Security

- API keys are stored server-side only
- No sensitive data exposed to the client
- Secure streaming implementation with proper error handling
